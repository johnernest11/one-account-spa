<script setup lang="ts">
import WbInputText from '@/components/webkit/WbInputText.vue'
import { reactive, ref } from 'vue'
import useVuelidate from '@vuelidate/core'
import { helpers, required, maxLength } from '@vuelidate/validators'
import Button from 'primevue/button'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import WbCalendar from '@/components/webkit/WbCalendar.vue'
import WbDropdown from '@/components/webkit/WbDropdown.vue'
import { RegistrationPersonalInfoPayload, RegistrationCredentialsPayload, useFormsStore } from '@/stores/forms.store.ts'

/** Payload */
const formStore = useFormsStore()
const payload = reactive<RegistrationPersonalInfoPayload>({
  first_name: formStore.registrationInfo.personal_info?.first_name || null,
  last_name: formStore.registrationInfo.personal_info?.last_name || null,
  middle_name: formStore.registrationInfo.personal_info?.middle_name || null,
  ext_name: formStore.registrationInfo.personal_info?.ext_name || null,
  sex: formStore.registrationInfo.personal_info?.sex || null,
  birthday: formStore.registrationInfo.personal_info?.birthday || null,
})

const payloads = reactive<RegistrationCredentialsPayload>({
  email: formStore.registrationInfo.credentials?.email || null,
  mobile_number: formStore.registrationInfo.credentials?.mobile_number || null,
  password: formStore.registrationInfo.credentials?.password || null,
  password_confirmation: formStore.registrationInfo.credentials?.password || null,
})
/** Component States */
const genderOptions = ref([
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
])

/** Events */
const emits = defineEmits(['nextButtonClicked', 'previousButtonClicked'])

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
}
const validator = useVuelidate<RegistrationPersonalInfoPayload>(formRules, payload)

/** Handle Next Section */
const handleNextSection = async () => {
  const valid = await validator.value.$validate()
  if (!valid) return false

  // Save to state manager
  formStore.saveRegistrationPersonalInfoSection(payload)

  emits('nextButtonClicked')
}
</script>
<template>
  <div class="flex flex-col gap-4">
    <!-- Start First name and Middle name -->
    <div class="flex flex-col gap-4 md:flex-row">
      <WbInputText
        v-model="payloads.email"
        placeholder="you@example.com"
        label="Email *"
        label-class="text-xs text-surface-0 lg:text-surface-800 dark:lg:text-surface-200"
        validation-error-message-class="text-xs text-error-300 font-bold lg:font-normal lg:text-error-500 dark:lg:text-error-300"
      >
        <template #prepend-icon>
          <i class="pi pi-envelope" />
        </template>
      </WbInputText>
      <WbInputText
        v-model="payload.first_name"
        label="First name *"
        :invalid="validator.first_name.$invalid"
        :invalid-text="validator.first_name.$errors[0]?.$message"
        label-class="text-xs text-surface-0 lg:text-surface-800 dark:lg:text-surface-200"
        validation-error-message-class="text-xs text-error-300 font-bold lg:font-normal lg:text-error-500 dark:lg:text-error-300"
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
        label-class="text-xs text-surface-0 lg:text-surface-800 dark:lg:text-surface-200"
        validation-error-message-class="text-xs text-error-300 font-bold lg:font-normal lg:text-error-500 dark:lg:text-error-300"
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
        label-class="text-xs text-surface-0 lg:text-surface-800 dark:lg:text-surface-200"
        validation-error-message-class="text-xs text-error-300 font-bold lg:font-normal lg:text-error-500 dark:lg:text-error-300"
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
        label-class="text-xs text-surface-0 lg:text-surface-800 dark:lg:text-surface-200"
        validation-error-message-class="text-xs text-error-300 font-bold lg:font-normal lg:text-error-500 dark:lg:text-error-300"
      >
        <template #prepend-icon>
          <i class="pi pi-id-card" />
        </template>
      </WbInputText>
    </div>
    <!-- End Last name and Extension name -->
    <!-- Start Sex and Birthday -->
    <div class="flex flex-col gap-4 md:flex-row">
      <WbDropdown
        v-model="payload.sex"
        :options="genderOptions"
        optionLabel="label"
        optionValue="value"
        label="Sex"
        label-class="text-xs text-surface-0 lg:text-surface-800 dark:lg:text-surface-200"
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
        label-class="text-xs text-surface-0 lg:text-surface-800 dark:lg:text-surface-200"
      >
        <template #prepend-icon>
          <i class="pi pi-gift" />
        </template>
      </WbCalendar>
    </div>
    <!-- End Sex and Birthday -->
    <!-- Start Action Buttons -->
    <div class="mt-4 flex justify-between">
      <Button @click="emits('previousButtonClicked')" label="Back" size="large" severity="secondary" class="px-10">
        <template #icon>
          <i class="pi pi-arrow-left mr-2"></i>
        </template>
      </Button>
      <Button @click="handleNextSection" label="Next" size="large" class="px-10">
        <template #icon>
          <i class="pi pi-arrow-right mr-2"></i>
        </template>
      </Button>
    </div>
    <!-- End Action Buttons -->
  </div>
</template>
