<script setup lang="ts">
import WbInputText from '@/components/webkit/WbInputText.vue'
import { reactive, ref } from 'vue'
import useVuelidate from '@vuelidate/core'
import { helpers, required, email } from '@vuelidate/validators'
import { uniqueUserIdentifierRule } from '@/utils/custom-validations.ts'
import Button from 'primevue/button'
import { LoginEmailPayload, useAuthStore } from '@/stores/auth.store.ts'
import { useToast } from 'primevue/usetoast'

/** Payload */
const formStore = useAuthStore()
const payload = reactive<LoginEmailPayload>({
  email: formStore.loginInfo.email?.email || null,
})

/** Events */
const emits = defineEmits(['nextButtonClicked'])
const toast = useToast()
// Flag to control showing email error toast
const shouldShowEmailToast = ref(false)

/** Form Validation */
const formRules = {
  $lazy: true,
  email: {
    required: helpers.withMessage('Please enter your email address', required),
    email: helpers.withMessage('Email format is invalid', email),
    unique: helpers.withAsync(helpers.withMessage('', uniqueUserIdentifierRule('email')), async () => {
      const isValidEmail = payload.email // Check email validity (assuming a validation method)

      const isValid = await uniqueUserIdentifierRule('email') // Check for unique identifier

      // Combine checks for both email validity and unique identifier
      const showToast = isValid && shouldShowEmailToast.value && isValidEmail

      if (showToast) {
        toast.add({
          severity: 'error',
          summary: 'Username or Email error',
          detail: 'We could not find the account associated with the username/email you have provided',
          life: 5000,
        })
      }

      return isValid
    }),
  },
}
/** Handle Next Section */
const validator = useVuelidate<LoginEmailPayload>(formRules, payload)
const handleNextSection = async () => {
  shouldShowEmailToast.value = true // Set flag before validation
  const valid = await validator.value.$validate()
  shouldShowEmailToast.value = false // Reset flag after validation
  if (!valid) return false
  formStore.saveLoginEmailSection(payload)
  emits('nextButtonClicked')
}
</script>

<template>
  <div class="text-center text-surface-0 lg:text-surface-800">
    <p class="mb-2 mt-2 text-sm text-blue-900">
      Welcome, please use your active directory <br />
      account username to continue.
    </p>
  </div>
  <section class="bg-transparent">
    <!-- Start Form -->
    <div class="flex justify-center">
      <form class="mt-6 flex flex-col space-y-2">
        <WbInputText
          v-model="payload.email"
          placeholder="you@example.com"
          label="Username or Email *"
          :invalid="validator.email.$invalid"
          :invalid-text="validator.email.$errors[0]?.$message"
          label-class="text-xs text-surface-0 lg:text-surface-800 dark:lg:text-surface-200"
          validation-error-message-class="text-xs text-error-300 font-bold lg:font-normal lg:text-error-500 dark:lg:text-error-300"
        >
          <template #prepend-icon>
            <i class="pi pi-envelope" />
          </template>
        </WbInputText>
        <!-- Start Action Buttons -->
        <div class="mt-4 flex items-center justify-end">
          <Button @click="handleNextSection" label="Next" size="large" class="bg-blue-800"> </Button>
        </div>
        <!-- End Action Buttons -->
      </form>
    </div>
    <!-- End Form -->
  </section>
</template>
<style scoped></style>
