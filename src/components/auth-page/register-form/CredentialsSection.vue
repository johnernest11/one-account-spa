<script setup lang="ts">
import WbInputText from '@/components/webkit/WbInputText.vue'
import WbPassword from '@/components/webkit/WbPassword.vue'
import { reactive, computed } from 'vue'
import useVuelidate from '@vuelidate/core'
import { helpers, required, email, minLength, maxLength, sameAs } from '@vuelidate/validators'
import {passwordRule, uniqueUserIdentifierRule } from '@/utils/custom-validations.ts'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import WbInputMask from '@/components/webkit/WbInputMask.vue'
import { RegistrationCredentialsPayload, useFormsStore } from '@/stores/forms.store.ts'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/** Payload */
const formStore = useFormsStore()
const payload = reactive<RegistrationCredentialsPayload>({
  email: formStore.registrationInfo.credentials?.email || null,
  mobile_number: formStore.registrationInfo.credentials?.mobile_number || null,
  password: formStore.registrationInfo.credentials?.password || null,
  password_confirmation: formStore.registrationInfo.credentials?.password || null,
})

/** Events */
const emits = defineEmits(['nextButtonClicked'])

/** Form Validation */
const formRules = {
  $lazy: true,
  email: {
    required: helpers.withMessage('Please enter your email address', required),
    email: helpers.withMessage('Email format is invalid', email),
    unique: helpers.withAsync(helpers.withMessage('This email is already taken', uniqueUserIdentifierRule('email'))),
  },
  password: {
    required: helpers.withMessage('Please enter your password', required),
    minLength: helpers.withMessage('Must be at least 8 characters long', minLength(8)),
    maxLength: helpers.withMessage('Must be a maximum of 50 characters', maxLength(50)),
    password: helpers.withMessage('Must include at least one number, and one uppercase and lowercase letter', passwordRule()),
  },
  password_confirmation: {
    required: helpers.withMessage('Please confirm your password', required),
    sameAsPassword: helpers.withMessage('Must match the password field', sameAs(computed(() => payload.password))),
  },
}

/** Handle Next Section */
const validator = useVuelidate<RegistrationCredentialsPayload>(formRules, payload)
const handleNextSection = async () => {
  const valid = await validator.value.$validate()
  if (!valid) return false
  formStore.saveRegistrationCredentialsSection(payload)
  emits('nextButtonClicked')
}
</script>
<template>
  <div class="flex flex-col gap-4">
    <!-- Start Email and Mobile Number -->
    <div class="flex flex-col gap-4 md:flex-row">
      <WbInputText
        v-model="payload.email"
        placeholder="you@example.com"
        label="Email *"
        :invalid="validator.email.$invalid"
        :invalid-text="validator.email.$errors[0]?.$message"
        @blur="validator.email.$touch"
        @focusin="validator.email.$dirty = false"
        label-class="text-xs text-surface-0 lg:text-surface-800 dark:lg:text-surface-200"
        validation-error-message-class="text-xs text-error-300 font-bold lg:font-normal lg:text-error-500 dark:lg:text-error-300"
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
        label-class="text-xs text-surface-0 lg:text-surface-800 dark:lg:text-surface-200"
        validation-error-message-class="text-xs text-error-300 font-bold lg:font-normal lg:text-error-500 dark:lg:text-error-300"
      >
        <template #prepend-icon>
          <i class="pi pi-phone" />
        </template>
      </WbInputMask>
    </div>
    <!-- End Email and Mobile Number -->
    <!-- Start Password and Password Confirmation -->
    <div class="flex flex-col gap-4 md:flex-row">
      <WbPassword
        v-model="payload.password"
        label="Password *"
        toggleMask
        :invalid="validator.password.$invalid"
        :invalid-text="validator.password.$errors[0]?.$message"
        @blur="validator.password.$touch"
        @focusin="validator.password.$dirty = false"
        label-class="text-xs text-surface-0 lg:text-surface-800 dark:lg:text-surface-200"
        validation-error-message-class="text-xs text-error-300 font-bold lg:font-normal lg:text-error-500 dark:lg:text-error-300"
      >
        <template #prepend-icon>
          <i class="pi pi-lock" />
        </template>
        <template #footer-panel>
          <Divider />
          <p class="mb-2 font-bold">Requirements</p>
          <ul class="ml-2 pl-2 font-normal">
            <li class="mb-1">At least one lowercase</li>
            <li class="mb-1">At least one uppercase</li>
            <li class="mb-1">At least one numeric</li>
            <li class="mb-1">Minimum 8 characters</li>
          </ul>
        </template>
      </WbPassword>
      <WbPassword
        v-model="payload.password_confirmation"
        label="Confirm Password *"
        :feedback="false"
        toggleMask
        :invalid="validator.password_confirmation.$invalid"
        :invalid-text="validator.password_confirmation.$errors[0]?.$message"
        @blur="validator.password_confirmation.$touch"
        label-class="text-xs text-surface-0 lg:text-surface-800 dark:lg:text-surface-200"
        validation-error-message-class="text-xs text-error-300 font-bold lg:font-normal lg:text-error-500 dark:lg:text-error-300"
      >
        <template #prepend-icon>
          <i class="pi pi-lock" />
        </template>
      </WbPassword>
    </div>
    <!-- End Password and Password Confirmation -->
    <!-- Start Action Buttons -->
    <div class="mt-4 flex items-center justify-between">
      <Button
        @click="$router.push({ name: 'login' })"
        label="Back to Login"
        size="small"
        text
        class="text-xs text-surface-0 hover:bg-surface-100 dark:text-primary-100 dark:hover:bg-primary-300/20 lg:text-surface-500 dark:lg:text-primary-400"
      >
        <template #icon>
          <FontAwesomeIcon icon="fa-solid fa-sign-in" class="mr-1.5"></FontAwesomeIcon>
        </template>
      </Button>
      <Button @click="handleNextSection" label="Next" size="large">
        <template #icon>
          <i class="pi pi-arrow-right mr-2"></i>
        </template>
      </Button>
    </div>
    <!-- End Action Buttons -->
  </div>
</template>
