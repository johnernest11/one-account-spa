<script setup lang="ts">
// import { computed, onBeforeMount, reactive, ref, toRef, toRefs } from 'vue'
import { computed, reactive, ref } from 'vue'
import { UserPayload, useGoogleUsersStore } from '@/stores/google-users.store.ts'
// import WbAutoComplete, { WbAutoCompleteOption, WbAutoCompleteOptionTrueValue } from '@/components/webkit/WbAutoComplete.vue'
// import { useAddressStore } from '@/stores/address.store.ts'
// import { storeToRefs } from 'pinia'
// import { useClearSelectedAddressIfNotInParentList, useFilterByParentId } from '@/composables/address.options.ts'
import { email, helpers, maxLength, required } from '@vuelidate/validators'
import { mobilePhoneRule, uniqueUserIdentifierRule } from '@/utils/custom-validations.ts'
import useVuelidate from '@vuelidate/core'
// import { useRolesStore } from '@/stores/roles.store.ts'
// import { AuthRole } from '@/typings/auth.types.ts'
import { useToast } from 'primevue/usetoast'
import { GoogleUserResponse } from '@/typings/models.types.ts'
// import { UserResponse, GoogleUserResponse } from '@/typings/models.types.ts'
import { parseApiResponseError } from '@/utils/error-handle.ts'
// import { useWbAutoCompleteHandleTrueValue } from '@/composables/wb-ui-components.ts'
import Button from 'primevue/button'
// import WbMultiSelect from '@/components/webkit/WbMultiSelect.vue'
import WbInputMask from '@/components/webkit/WbInputMask.vue'
import WbInputText from '@/components/webkit/WbInputText.vue'
import WbDropdown from '@/components/webkit/WbDropdown.vue'
// import WbCalendar from '@/components/webkit/WbCalendar.vue'
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import InputSwitch from 'primevue/inputswitch'
import Message from 'primevue/message'
import { useConfirm } from 'primevue/useconfirm'
import Dialog from 'primevue/dialog'
import ManageMfaForm from '@/components/users-management-page/ManageMfaForm.vue'
import { useSettingsStore } from '@/stores/settings.store.ts'

/** Emits */
const emit = defineEmits<{
  (e: 'user-updated', value: boolean): void
  (e: 'user-deleted', value: boolean): void
}>()

/** Props */
// type UserDetailsFormProps = {
//   currentRoleFilter: number | string | null
//   user: UserResponse
// }

type UserDetailsFormProps = {
  currentRoleFilter: number | string | null
  user: GoogleUserResponse
}
const props = withDefaults(defineProps<UserDetailsFormProps>(), {
  currentRoleFilter: null,
})

console.log(props.user)
/** Payload */
const payload = reactive<Partial<UserPayload>>({
  email: props.user.primaryEmail || '',
  // mobile_number: props.user.phones[0].value || null,
  first_name: props.user.name?.givenName || '',
  last_name: props.user.name?.familyName || '',
  suspended: props.user.suspended,
  // middle_name: props.user.user_profile?.middle_name || null,
  // ext_name: props.user.user_profile?.ext_name || null,
  // birthday: props.user.user_profile?.birthday || null,
  // sex: props.user.user_profile?.sex || null,
  // home_address: props.user.user_profile?.address?.home_address || null,
  // city_id: props.user.user_profile?.address?.city?.id || null,
  // province_id: props.user.user_profile?.address?.province?.id || null,
  // region_id: props.user.user_profile?.address?.region?.id || null,
  // postal_code: props.user.user_profile?.address?.postal_code || null,
  // barangay_id: props.user.user_profile?.address?.barangay?.id || null,
  // roles: props.user.roles.map((r) => r.id),

})

// We disabled editing and deletion for super users
const userIsSuperUser = computed(() => {
  // return !!props.user.roles.find((r) => AuthRole.SUPER_USER.toString() === r.name)
  return false
})

// Toggle Edit Button
const editingEnabled = ref(false)

// Start combo and select box options
// const genderOptions = [
//   { label: 'Male', value: 'male' },
//   { label: 'Female', value: 'female' },
// ]

const activationOptions = [
  { label: 'Suspend', value: true },
  { label: 'Unsuspend', value: false },
]

/** Roles Options */
// const rolesStore = useRolesStore()
// const rolesOptionsIsLoading = ref(false)
// const rolesOptions = computed(() => {
//   // Admins should not be able to select the Super User option
//   return rolesStore.roleOptions.filter((r) => r.name !== AuthRole.SUPER_USER.toString())
// })
// onBeforeMount(async () => {
//   rolesOptionsIsLoading.value = true
//   await rolesStore.fetchRoles()
//   rolesOptionsIsLoading.value = false
// })

/** Address Section **/
/** Address WbAutoComplete Object References */
// const selectedRegion = ref<WbAutoCompleteOption | null>(null)
// const selectedProvince = ref<WbAutoCompleteOption | null>(null)
// const selectedCity = ref<WbAutoCompleteOption | null>(null)
// const selectedBarangay = ref<WbAutoCompleteOption | null>(null)

/** Initialize Address Options List */
// const publicStore = useAddressStore()
// const addressesAreLoading = ref(false)
// onBeforeMount(async () => {
//   addressesAreLoading.value = true
//   await Promise.allSettled([
//     publicStore.fetchRegions(),
//     publicStore.fetchProvinces(),
//     publicStore.fetchCities(),
//     publicStore.fetchBarangays(),
//   ])

//   // Set the initial value of the selected addresses
//   selectedRegion.value = publicStore.regionOptions.find((r) => r.value === props.user.user_profile?.address?.region?.id) || null
//   selectedProvince.value =
//     publicStore.provinceOptions.find((p) => p.value === props.user.user_profile?.address?.province?.id) || null
//   selectedCity.value = publicStore.cityOptions.find((c) => c.value === props.user.user_profile?.address?.city?.id) || null
//   selectedBarangay.value =
//     publicStore.barangayOptions.find((b) => b.value === props.user.user_profile?.address?.barangay?.id) || null

//   addressesAreLoading.value = false
// })

/** We only display a list based on parent address */
// const { provinceOptions, cityOptions, barangayOptions } = storeToRefs(publicStore)
// const filteredProvinceOptionsByRegion = useFilterByParentId(toRef(payload, 'region_id', null), provinceOptions)
// const filteredCityOptionsByProvince = useFilterByParentId(toRef(payload, 'province_id', null), cityOptions)
// const filteredBarangayOptionsByCity = useFilterByParentId(toRef(payload, 'city_id', null), barangayOptions)

/** We set the `selected<Address>` and `payload.<address>_id` to null if the parent is changed */
// useClearSelectedAddressIfNotInParentList(
//   toRefs(payload),
//   selectedProvince,
//   selectedCity,
//   selectedBarangay,
//   filteredProvinceOptionsByRegion,
//   filteredCityOptionsByProvince,
//   filteredBarangayOptionsByCity
// )

/** Form Validation */
const globalStringMaxLength = import.meta.env.VITE_GLOBAL_STRING_MAX_LENGTH
const globalStringMaxLengthRule = helpers.withMessage(
  `Must not exceed ${globalStringMaxLength} characters`,
  maxLength(globalStringMaxLength)
)
const formRules = {
  $lazy: true,
  email: {
    required: helpers.withMessage('Enter your email address', required),
    email: helpers.withMessage('Email format is invalid', email),
    unique: helpers.withAsync(
      helpers.withMessage('This email is already taken', uniqueUserIdentifierRule('email', props.user.id))
    ),
  },
  mobile_number: {
    mobile_number: helpers.withMessage('Must be a valid PH mobile number', mobilePhoneRule()),
    unique: helpers.withAsync(
      helpers.withMessage('This mobile number is already taken', uniqueUserIdentifierRule('mobile_number', props.user.id))
    ),
  },
  // roles: {
  //   required: helpers.withMessage('A user must have a role selected', required),
  // },
  first_name: {
    required: helpers.withMessage('Please enter your first name', required),
    maxLength: globalStringMaxLengthRule,
  },
  last_name: {
    required: helpers.withMessage('Please enter your last name', required),
    maxLength: globalStringMaxLengthRule,
  },
  // middle_name: {
  //   maxLength: globalStringMaxLengthRule,
  // },
  // ext_name: {
  //   maxLength: globalStringMaxLengthRule,
  // },
  // home_address: {
  //   maxLength: globalStringMaxLengthRule,
  // },
  // postal_code: {
  //   digitCount: helpers.withMessage('Enter your 4-digit zip code', digitCountRule(4)),
  // },
}

// Handle Form Submission
const validator = useVuelidate<Partial<UserPayload>>(formRules, payload)
const formIsSubmitting = ref(false)
const showErrorAlert = ref(false)
const errorMessage = ref<string | null>(null)
const errorDetails = ref<string[]>([])
const userStore = useGoogleUsersStore()
const toast = useToast()
const handleFormSubmission = async () => {
  const valid = await validator.value.$validate()
  if (!valid) {
    document.getElementsByClassName('update-user-creds-section')[0]?.scrollIntoView({ behavior: 'smooth' })
    toast.add({
      severity: 'error',
      summary: 'User Details',
      detail: 'Please see the validation messages',
      life: 5000,
    })
    return
  }

  formIsSubmitting.value = true
  const response = await userStore.updateUser(payload, props.user.primaryEmail)
  // Handle the API error
  if (!response.success) {
    const result = parseApiResponseError(response)
    if (!result) return (formIsSubmitting.value = false)

    showErrorAlert.value = true
    errorMessage.value = result.message
    errorDetails.value = result.errors

    formIsSubmitting.value = false
    return document.getElementsByClassName('create-user-creds-section')[0]?.scrollIntoView({ behavior: 'smooth' })
  }

  formIsSubmitting.value = false
  toast.add({
    severity: 'success',
    summary: 'User Details',
    detail: "You've successfully updated a user",
    life: 5000,
  })

  emit('user-updated', true)
}

/** Handle User Deletion */
const userIsBeingDeleted = ref(false)
const handleUserDeletion = async () => {

  userIsBeingDeleted.value = true
  const response = await userStore.deleteUser(props.user?.primaryEmail)

  if (!response) {
    const result = parseApiResponseError(response)
    if (!result) return (formIsSubmitting.value = false)

    showErrorAlert.value = true
    errorMessage.value = result.message
    errorDetails.value = result.errors
    userIsBeingDeleted.value = false
    return document.getElementsByClassName('create-user-creds-section')[0]?.scrollIntoView({ behavior: 'smooth' })
  }

  toast.add({
    severity: 'success',
    summary: 'User Deletion',
    detail: `${props.user.name?.fullName || 'The user '} was successfully deleted`,
    life: 5000,
  })

  userIsBeingDeleted.value = false
  emit('user-deleted', true)
}

const confirm = useConfirm()
const requireConfirmation = (event: Event) => {
  confirm.require({
    group: 'global',
    target: event.currentTarget as HTMLElement,
    message: ` Are you sure you want to delete ${props.user.name?.fullName || 'this user'}? You cannot undo this.`,
    header: 'Delete User',
    acceptLabel: 'Confirm Deletion',
    rejectLabel: 'Cancel',
    accept: () => {
      handleUserDeletion()
    },
  })
}

/** Handle MFA Config */
const showMfaConfigDialog = ref(false)
const settingsStore = useSettingsStore()
</script>

<template>
  <form autocomplete="off" @submit.prevent>
    <div class="flex w-full flex-col gap-4 pb-4">
      <!-- Start Alert Message -->
      <transition enter-active-class="transition duration-200" enter-from-class="scale-50 opacity-0" leave-to-class="opacity-0">
        <Message v-if="showErrorAlert" :closable="false" severity="error">
          <span>{{ errorMessage }}</span>
          <div class="flex flex-col text-xs">
            <div v-for="error in errorDetails" :key="error" class="mt-0.5">{{ '- ' + error }}</div>
          </div>
        </Message>
      </transition>
      <!-- End Alert Message -->
      <!-- Start Super User Cannot be Edited nor Deleted Warning -->
      <!-- End Super User Cannot be Edited nor Deleted Warning -->
      <Message v-if="userIsSuperUser" :closable="false" severity="warn">
        <span>A Super User can neither be edited or deleted.</span>
      </Message>
      <!-- Start Toggle Edit Switch & MFA Pop-up -->
      <div class="mb-1 flex items-center justify-between">
        <!-- Start MFA Dialog Button -->
        <div class="flex items-center">
          <button
            v-if="settingsStore.mfaIsEnabled && settingsStore.mfaIsConfigurable"
            @click="showMfaConfigDialog = true"
            class="!px-0 text-xs transition-all hover:underline"
          >
            <i class="pi pi-lock mr-1" />
            <span class="hidden sm:inline">Configure Multi-Factor Authentication</span>
            <span class="inline font-medium text-surface-500 sm:hidden">MFA</span>
          </button>
        </div>
        <!-- End MFA Dialog Button -->
        <!-- Start Enable Editing Switch -->
        <div class="flex items-center justify-between">
          <span class="mr-3 text-xs text-surface-500">{{ !editingEnabled ? 'Enable Editing' : 'Disabled Editing' }}</span>
          <InputSwitch v-model="editingEnabled" :disabled="userIsSuperUser"></InputSwitch>
        </div>
        <!-- End Enable Editing Switch -->
      </div>
      <!-- End Toggle Edit Switch & MFA Pop-up -->

      <!-- Start Credentials -->
      <p class="create-user-creds-section text-xs font-medium uppercase">Credentials</p>
      <!-- Start Email and Mobile Number -->
      <div class="flex flex-col gap-4 md:flex-row">
        <WbInputText
          v-model="payload.email"
          label="Email *"
          :invalid="validator.email.$invalid"
          :invalid-text="validator.email.$errors[0]?.$message"
          @blur="validator.email.$touch"
          @focusin="validator.email.$dirty = false"
          :disabled="!editingEnabled"
        >
          <template #prepend-icon>
            <i class="pi pi-envelope" />
          </template>
        </WbInputText>
        <WbInputMask
          v-model="payload.mobile_number"
          label="Mobile Number"
          mask="+639999999999"
          :invalid="validator.mobile_number.$invalid"
          :invalid-text="validator.mobile_number.$errors[0]?.$message"
          @blur="validator.mobile_number.$touch"
          @focusin="validator.mobile_number.$dirty = false"
          :disabled="!editingEnabled"
        >
          <template #prepend-icon>
            <i class="pi pi-phone" />
          </template>
        </WbInputMask>
      </div>
            <!-- Start First name and Middle name -->
            <div class="flex flex-col gap-4 md:flex-row">
        <WbInputText
          v-model="payload.first_name"
          label="First name *"
          :invalid="validator.first_name.$invalid"
          :invalid-text="validator.first_name.$errors[0]?.$message"
          @blur="validator.first_name.$touch"
          :disabled="!editingEnabled"
        >
          <template #prepend-icon>
            <i class="pi pi-id-card" />
          </template>
        </WbInputText>
        <WbInputText
          v-model="payload.last_name"
          label="Last name *"
          :invalid="validator.last_name.$invalid"
          :invalid-text="validator.last_name.$errors[0]?.$message"
          @blur="validator.last_name.$touch"
          :disabled="!editingEnabled"
        >
          <template #prepend-icon>
            <i class="pi pi-id-card" />
          </template>
        </WbInputText>

      </div>
      <!-- End Email and Mobile Number -->
      <!-- Start Roles & Activation Select -->
      <div class="flex flex-col gap-4 md:flex-row">
        <!-- <div class="flex md:w-[49%] md:flex-row">
          <WbMultiSelect
            v-model="payload.roles"
            :options="rolesOptions"
            label="Roles"
            placeholder="-- Select Roles --"
            optionLabel="label"
            optionValue="value"
            optionDisabled="disabled"
            :loading="rolesOptionsIsLoading"
            :disabled="rolesOptionsIsLoading || !editingEnabled"
            display="chip"
            class="text-xs"
            :invalid="validator.roles.$invalid"
            :invalid-text="validator.roles.$errors[0]?.$message"
            @blur="validator.roles.$touch"
            @focusin="validator.roles.$dirty = false"
          />
        </div> -->
        <div class="flex md:w-[49%] md:flex-row">
          <WbDropdown
            v-model="payload.suspended"
            :options="activationOptions"
            optionLabel="label"
            optionValue="value"
            label="Suspend User"
            :disabled="!editingEnabled"
          >
            <template #prepend-icon>
              <i class="pi pi-lock" />
            </template>
          </WbDropdown>
        </div>
      </div>
      <!-- End Roles & Activation Select -->
      <!-- End Credentials -->

      <!-- Start Personal Information -->
      <!-- <p class="mt-4 text-xs font-medium uppercase md:mt-6">Basic Information</p> -->

      <!-- End First name and Middle name -->
      <!-- Start Last name and Extension name -->
      <!-- <div class="flex flex-col gap-4 md:flex-row">
        <WbInputText
          v-model="payload.middle_name"
          label="Middle name"
          :invalid="validator.middle_name.$invalid"
          :invalid-text="validator.middle_name.$errors[0]?.$message"
          @blur="validator.middle_name.$touch"
          :disabled="!editingEnabled"
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
          :disabled="!editingEnabled"
        >
          <template #prepend-icon>
            <i class="pi pi-id-card" />
          </template>
        </WbInputText>
      </div> -->
      <!-- End Last name and Extension name -->
      <!-- Start Sex and Birthday -->
      <!-- <div class="flex flex-col gap-4 md:flex-row">
        <WbDropdown
          v-model="payload.sex"
          :options="genderOptions"
          optionLabel="label"
          optionValue="value"
          label="Sex"
          :disabled="!editingEnabled"
        >
          <template #prepend-icon>
            <FontAwesomeIcon icon="fa-solid fa-mars-and-venus" />
          </template>
        </WbDropdown>
        <WbCalendar
          v-model="payload.birthday"
          dateFormat="MM dd, yy"
          :maxDate="new Date()"
          label="Birthday"
          :disabled="!editingEnabled"
        >
          <template #prepend-icon>
            <i class="pi pi-gift" />
          </template>
        </WbCalendar>
      </div> -->
      <!-- End Sex and Birthday -->
      <!-- End Personal Information -->

      <!-- Start Address -->
      <!-- <p class="md:6 mt-4 text-xs font-medium uppercase">Address</p> -->
      <!-- Start Region and Province -->
      <!-- <div class="flex flex-col gap-4 md:flex-row">
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
          :disabled="publicStore.regionOptionsIsLoading || !editingEnabled"
          :virtualScrollerOptions="{ itemSize: 38 }"
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
          :disabled="publicStore.provinceOptionsIsLoading || !editingEnabled"
          :virtualScrollerOptions="{ itemSize: 38 }"
        >
          <template #prepend-icon>
            <i class="pi pi-map" />
          </template>
        </WbAutoComplete>
      </div> -->
      <!-- End Region and Province -->
      <!-- Start City and Barangay -->
      <!-- <div class="flex flex-col gap-4 md:flex-row">
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
          :disabled="publicStore.cityOptionsIsLoading || !editingEnabled"
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
          :disabled="publicStore.barangayOptionsIsLoading || !editingEnabled"
          :virtualScrollerOptions="{ itemSize: 38 }"
        >
          <template #prepend-icon>
            <i class="pi pi-map" />
          </template>
        </WbAutoComplete>
      </div> -->
      <!-- End City and Barangay -->
      <!-- Start Home Address and Zip Code -->
      <!-- <div class="flex flex-col gap-4 md:flex-row">
        <WbInputText
          v-model="payload.home_address"
          label="Home Address"
          :invalid="validator.home_address.$invalid"
          :invalid-text="validator.home_address.$errors[0]?.$message"
          @blur="validator.home_address.$touch"
          :disabled="!editingEnabled"
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
          :disabled="!editingEnabled"
        >
          <template #prepend-icon>
            <i class="pi pi-map" />
          </template>
        </WbInputMask>
      </div> -->
      <!-- End Home Address and Zip Code -->
      <!-- End Address -->

      <!-- Start Action Buttons -->
      <div class="mt-2 flex justify-between">
        <!-- Start Delete Button with Confirmation -->
        <Button
          @click="requireConfirmation($event)"
          label="Delete"
          severity="danger"
          :loading="userIsBeingDeleted"
          :disabled="formIsSubmitting || !editingEnabled || userIsBeingDeleted"
        >
          <template #icon>
            <i class="pi pi-trash mr-2"></i>
          </template>
        </Button>
        <!-- End Delete Button with Confirmation -->
        <!-- Start Update Button -->
        <Button
          @click="handleFormSubmission"
          label="Update"
          :loading="formIsSubmitting"
          :disabled="formIsSubmitting || !editingEnabled"
        >
          <template #icon>
            <i class="pi pi-save mr-2"></i>
          </template>
        </Button>
      </div>
      <!-- End Update Button -->
      <!-- End Action Buttons -->
    </div>
    <Dialog
      v-if="settingsStore.mfaIsEnabled && settingsStore.mfaIsConfigurable"
      v-model:visible="showMfaConfigDialog"
      header="MFA Config"
      modal
      :draggable="false"
      class="mx-2 w-full sm:mx-0"
    >
      <ManageMfaForm
        :user-id="props.user.id"
        :user-full-name="props.user.name?.fullName || ''"
        @mfa-config-updated="showMfaConfigDialog = false"
      />
    </Dialog>
  </form>
</template>
