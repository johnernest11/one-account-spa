<script setup lang="ts">
import { reactive, ref, onBeforeMount, toRef, toRefs } from 'vue'
import { useProfileStore, UserProfilePayload } from '@/stores/profile.store.ts'
import { storeToRefs } from 'pinia'
import { useFilterByParentId, useClearSelectedAddressIfNotInParentList } from '@/composables/address.options.ts'
import { useAuthStore } from '@/stores/auth.store.ts'
import { useAddressStore } from '@/stores/address.store.ts'
import useVuelidate from '@vuelidate/core'
import { helpers, required, maxLength } from '@vuelidate/validators'
import { digitCountRule } from '@/utils/custom-validations.ts'
import { parseApiResponseError } from '@/utils/error-handle.ts'
import { sleep } from '@/utils/helpers.ts'
import WbInputText from '@/components/webkit/WbInputText.vue'
import WbCalendar from '@/components/webkit/WbCalendar.vue'
import WbDropdown from '@/components/webkit/WbDropdown.vue'
import Button from 'primevue/button'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import WbInputMask from '@/components/webkit/WbInputMask.vue'
import WbAutoComplete from '@/components/webkit/WbAutoComplete.vue'
import { WbAutoCompleteOption, WbAutoCompleteOptionTrueValue } from '@/components/webkit/WbAutoComplete.vue'
import { useWbAutoCompleteHandleTrueValue } from '@/composables/wb-ui-components.ts'
import Message from 'primevue/message'

/** Emits */
const emit = defineEmits<{
  (e: 'profileVerified', value: boolean): void
  (e: 'previousButtonClicked', value: boolean): void
}>()

/** Payload */
const authStore = useAuthStore()
const payload = reactive<Partial<UserProfilePayload>>({
  mobile_number: authStore.authenticatedUser?.user_profile?.mobile_number || null,
  first_name: authStore.authenticatedUser?.user_profile?.first_name || '',
  last_name: authStore.authenticatedUser?.user_profile?.last_name || '',
  middle_name: authStore.authenticatedUser?.user_profile?.middle_name || null,
  ext_name: authStore.authenticatedUser?.user_profile?.ext_name || null,
  birthday: authStore.authenticatedUser?.user_profile?.birthday || null,
  sex: authStore.authenticatedUser?.user_profile?.sex || null,
  home_address: authStore.authenticatedUser?.user_profile?.address?.home_address || null,
  city_id: authStore.authenticatedUser?.user_profile?.address?.city?.id || null,
  province_id: authStore.authenticatedUser?.user_profile?.address?.province?.id || null,
  region_id: authStore.authenticatedUser?.user_profile?.address?.region?.id || null,
  postal_code: authStore.authenticatedUser?.user_profile?.address?.postal_code || null,
  barangay_id: authStore.authenticatedUser?.user_profile?.address?.barangay?.id || null,
})
// We don't include the email in the payload when verifying the account
const tmpEmailField = authStore.authenticatedUser?.email || ''

// Start combo and select box options
const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
]

/** Address Section **/
/** Address WbAutoComplete Object References */
const selectedRegion = ref<WbAutoCompleteOption | null>(null)
const selectedProvince = ref<WbAutoCompleteOption | null>(null)
const selectedCity = ref<WbAutoCompleteOption | null>(null)
const selectedBarangay = ref<WbAutoCompleteOption | null>(null)

/** Initialize Address Options List */
const publicStore = useAddressStore()
const addressesAreLoading = ref(false)
onBeforeMount(async () => {
  addressesAreLoading.value = true
  await Promise.allSettled([
    publicStore.fetchRegions(),
    publicStore.fetchProvinces(),
    publicStore.fetchCities(),
    publicStore.fetchBarangays(),
  ])

  // Set the initial value of the selected addresses
  selectedRegion.value =
    publicStore.regionOptions.find((r) => r.value === authStore.authenticatedUser?.user_profile?.address?.region?.id) || null
  selectedProvince.value =
    publicStore.provinceOptions.find((p) => p.value === authStore.authenticatedUser?.user_profile?.address?.province?.id) || null
  selectedCity.value =
    publicStore.cityOptions.find((c) => c.value === authStore.authenticatedUser?.user_profile?.address?.city?.id) || null
  selectedBarangay.value =
    publicStore.barangayOptions.find((b) => b.value === authStore.authenticatedUser?.user_profile?.address?.barangay?.id) || null

  addressesAreLoading.value = false
})

/** We only display a list based on parent address */
const { provinceOptions, cityOptions, barangayOptions } = storeToRefs(publicStore)
const filteredProvinceOptionsByRegion = useFilterByParentId(toRef(payload, 'region_id', null), provinceOptions)
const filteredCityOptionsByProvince = useFilterByParentId(toRef(payload, 'province_id', null), cityOptions)
const filteredBarangayOptionsByCity = useFilterByParentId(toRef(payload, 'city_id', null), barangayOptions)

/** We set the `selected<Address>` and `payload.<address>_id` to null if the parent is changed */
useClearSelectedAddressIfNotInParentList(
  toRefs(payload),
  selectedProvince,
  selectedCity,
  selectedBarangay,
  filteredProvinceOptionsByRegion,
  filteredCityOptionsByProvince,
  filteredBarangayOptionsByCity
)

/** Form Validation */
const globalStringMaxLength = import.meta.env.VITE_GLOBAL_STRING_MAX_LENGTH
const globalStringMaxLengthRule = helpers.withMessage(
  `Must not exceed ${globalStringMaxLength} characters`,
  maxLength(globalStringMaxLength)
)
const formRules = {
  $lazy: true,
  first_name: {
    required: helpers.withMessage('Please enter your first name', required),
    maxLength: globalStringMaxLengthRule,
  },
  last_name: {
    required: helpers.withMessage('Please enter your last name', required),
    maxLength: globalStringMaxLengthRule,
  },
  middle_name: {
    maxLength: globalStringMaxLengthRule,
  },
  ext_name: {
    maxLength: globalStringMaxLengthRule,
  },
  home_address: {
    maxLength: globalStringMaxLengthRule,
  },
  postal_code: {
    digitCount: helpers.withMessage('Enter your 4-digit zip code', digitCountRule(4)),
  },
}
/** Handle Form Submission */
const validator = useVuelidate<Partial<UserProfilePayload>>(formRules, payload)
const formIsSubmitting = ref(false)
const profileStore = useProfileStore()
const showErrorAlert = ref(false)
const errorMessage = ref('')

const handleFormSubmission = async () => {
  const valid = await validator.value.$validate()
  if (!valid) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  formIsSubmitting.value = true

  const response = await profileStore.updateProfile(payload)
  // Handle the API error
  if (!response.success) {
    const result = parseApiResponseError(response)
    if (!result) return (formIsSubmitting.value = false)

    showErrorAlert.value = true
    errorMessage.value = result.message
    await sleep(0.2)
    formIsSubmitting.value = false
    return window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  formIsSubmitting.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
  return emit('profileVerified', true)
}
</script>

<template>
  <form autocomplete="off" class="flex w-full">
    <div class="flex w-full flex-col gap-4">
      <!-- Start Alert Message -->
      <transition enter-active-class="transition duration-200" enter-from-class="scale-50 opacity-0" leave-to-class="opacity-0">
        <Message v-if="showErrorAlert" :closable="false" severity="error" class="mx-4 mb-2 md:mx-0">
          <span>{{ errorMessage }}</span>
        </Message>
      </transition>
      <!-- End Alert Message -->

      <!-- Start Credentials -->
      <!-- Start Email and Mobile Number -->
      <div class="flex flex-col gap-4 md:flex-row">
        <WbInputText
          v-model="tmpEmailField"
          label="Email *"
          :disabled="true"
          v-tooltip.top="'You cannot change your email at this moment'"
        >
          <template #prepend-icon>
            <i class="pi pi-envelope" />
          </template>
        </WbInputText>
        <WbInputMask
          v-model="payload.mobile_number"
          label="Mobile Number"
          mask="+639999999999"
          placeholder="+63 XXX XXX XXXX"
          :invalid="validator.mobile_number.$invalid"
          :invalid-text="validator.mobile_number.$errors[0]?.$message"
          @blur="validator.mobile_number.$touch"
          @focusin="validator.mobile_number.$dirty = false"
        >
          <template #prepend-icon>
            <i class="pi pi-phone" />
          </template>
        </WbInputMask>
      </div>
      <!-- End Email and Mobile Number -->
      <!-- End Credentials -->

      <!-- Start Personal Information -->
      <!-- Start First name and Middle name -->
      <div class="flex flex-col gap-4 md:flex-row">
        <WbInputText
          v-model="payload.first_name"
          label="First name *"
          :invalid="validator.first_name.$invalid"
          :invalid-text="validator.first_name.$errors[0]?.$message"
          @blur="validator.first_name.$touch"
        >
          <template #prepend-icon>
            <i class="pi pi-id-card" />
          </template>
        </WbInputText>
        <WbInputText
          v-model="payload.middle_name"
          label="Middle name"
          :invalid="validator.middle_name.$invalid"
          :invalid-text="validator.middle_name.$errors[0]?.$message"
          @blur="validator.middle_name.$touch"
        >
          <template #prepend-icon>
            <i class="pi pi-id-card" />
          </template>
        </WbInputText>
      </div>
      <!-- End First name and Middle name -->
      <!-- Start Last name and Extension name -->
      <div class="flex flex-col gap-4 md:flex-row">
        <WbInputText
          v-model="payload.last_name"
          label="Last name *"
          :invalid="validator.last_name.$invalid"
          :invalid-text="validator.last_name.$errors[0]?.$message"
          @blur="validator.last_name.$touch"
        >
          <template #prepend-icon>
            <i class="pi pi-id-card" />
          </template>
        </WbInputText>
        <WbInputText
          v-model="payload.ext_name"
          label="Ext. name"
          :invalid="validator.ext_name.$invalid"
          :invalid-text="validator.ext_name.$errors[0]?.$message"
          @blur="validator.ext_name.$touch"
        >
          <template #prepend-icon>
            <i class="pi pi-id-card" />
          </template>
        </WbInputText>
      </div>
      <!-- End Last name and Extension name -->
      <!-- Start Sex and Birthday -->
      <div class="flex flex-col gap-4 md:flex-row">
        <WbDropdown v-model="payload.sex" :options="genderOptions" optionLabel="label" optionValue="value" label="Sex">
          <template #prepend-icon>
            <FontAwesomeIcon icon="fa-solid fa-mars-and-venus" />
          </template>
        </WbDropdown>
        <WbCalendar v-model="payload.birthday" dateFormat="MM dd, yy" :maxDate="new Date()" label="Birthday">
          <template #prepend-icon>
            <i class="pi pi-gift" />
          </template>
        </WbCalendar>
      </div>
      <!-- End Sex and Birthday -->
      <!-- End Personal Information -->

      <!-- Start Address -->
      <!-- Start Region and Province -->
      <div class="flex flex-col gap-4 md:flex-row">
        <WbAutoComplete
          v-model="selectedRegion"
          :suggestions="publicStore.regionOptions"
          label="Region"
          optionLabel="label"
          forceSelection
          @on-true-value-computed="
            (value: WbAutoCompleteOptionTrueValue) => useWbAutoCompleteHandleTrueValue(value, toRef(payload, 'region_id'))
          "
          :loading="publicStore.regionOptionsIsLoading"
          :disabled="publicStore.regionOptionsIsLoading"
        >
          <template #prepend-icon>
            <i class="pi pi-map" />
          </template>
        </WbAutoComplete>
        <WbAutoComplete
          v-model="selectedProvince"
          :suggestions="filteredProvinceOptionsByRegion"
          label="Province"
          optionLabel="label"
          forceSelection
          @on-true-value-computed="
            (value: WbAutoCompleteOptionTrueValue) => useWbAutoCompleteHandleTrueValue(value, toRef(payload, 'province_id'))
          "
          :loading="publicStore.provinceOptionsIsLoading"
          :disabled="publicStore.provinceOptionsIsLoading"
        >
          <template #prepend-icon>
            <i class="pi pi-map" />
          </template>
        </WbAutoComplete>
      </div>
      <!-- End Region and Province -->
      <!-- Start City and Barangay -->
      <div class="flex flex-col gap-4 md:flex-row">
        <WbAutoComplete
          v-model="selectedCity"
          :suggestions="filteredCityOptionsByProvince"
          label="City"
          optionLabel="label"
          forceSelection
          @on-true-value-computed="
            (value: WbAutoCompleteOptionTrueValue) => useWbAutoCompleteHandleTrueValue(value, toRef(payload, 'city_id'))
          "
          :loading="publicStore.cityOptionsIsLoading"
          :disabled="publicStore.cityOptionsIsLoading"
          :virtualScrollerOptions="{ itemSize: 38 }"
        >
          <template #prepend-icon>
            <i class="pi pi-map" />
          </template>
        </WbAutoComplete>
        <WbAutoComplete
          v-model="selectedBarangay"
          :suggestions="filteredBarangayOptionsByCity"
          label="Barangay"
          optionLabel="label"
          forceSelection
          @on-true-value-computed="
            (value: WbAutoCompleteOptionTrueValue) => useWbAutoCompleteHandleTrueValue(value, toRef(payload, 'barangay_id'))
          "
          :loading="publicStore.barangayOptionsIsLoading"
          :disabled="publicStore.barangayOptionsIsLoading"
          :virtualScrollerOptions="{ itemSize: 38 }"
        >
          <template #prepend-icon>
            <i class="pi pi-map" />
          </template>
        </WbAutoComplete>
      </div>
      <!-- End City and Barangay -->
      <!-- Start Home Address and Zip Code -->
      <div class="flex flex-col gap-4 md:flex-row">
        <WbInputText
          v-model="payload.home_address"
          label="Home Address"
          :invalid="validator.home_address.$invalid"
          :invalid-text="validator.home_address.$errors[0]?.$message"
          @blur="validator.home_address.$touch"
        >
          <template #prepend-icon>
            <i class="pi pi-map" />
          </template>
        </WbInputText>
        <WbInputMask
          v-model="payload.postal_code"
          label="Zip Code"
          mask="9999"
          :invalid="validator.postal_code.$invalid"
          :invalid-text="validator.postal_code.$errors[0]?.$message"
          @blur="validator.postal_code.$touch"
        >
          <template #prepend-icon>
            <i class="pi pi-map" />
          </template>
        </WbInputMask>
      </div>
      <!-- End Home Address and Zip Code -->
      <!-- End Address -->
      <!-- Start Action Buttons -->
      <div class="mt-6 flex justify-between">
        <Button @click="emit('previousButtonClicked', true)" label="Back" severity="secondary" :disabled="formIsSubmitting">
          <template #icon>
            <i class="pi pi-arrow-left mr-2" />
          </template>
        </Button>
        <Button
          @click="handleFormSubmission"
          label="Next"
          :loading="formIsSubmitting"
          :disabled="formIsSubmitting || addressesAreLoading"
        >
          <template #icon>
            <i class="pi pi-arrow-right mr-2" />
          </template>
        </Button>
      </div>
      <!-- End Action Buttons -->
    </div>
  </form>
</template>
