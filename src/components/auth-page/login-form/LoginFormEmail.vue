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
  email: formStore.loginInfo.email || null,
})

/** Events */
const emits = defineEmits(['nextButtonClicked'])
const toast = useToast()

/** Form Validation */
const formRules = {
  $lazy: true,
  email: {
    required: helpers.withMessage('Please enter your email address', required),
    email: helpers.withMessage('Email format is invalid', email),
    unique: helpers.withAsync(
      helpers.withMessage('We could not find the account', uniqueUserIdentifierRule('email')),
      async () => {
        const isValidEmail = payload.email // Check email validity (assuming a validation method)
        const isValid = await uniqueUserIdentifierRule('email') // Check for unique identifier
        return isValid && isValidEmail // Combine checks
      }
    ),
  },
}


const validator = useVuelidate<LoginEmailPayload>(formRules, payload)
/** Form Submission State */
const formIsSubmitting = ref(false);

/** Handle Next Section (with Loading State) */
const handleNextSection = async () => {
  formIsSubmitting.value = true; // Set button to loading state
  const valid = await validator.value.$validate()

  if (!valid) {
    toast.add({
      severity: 'error',
      summary: 'Username or Email error',
      detail: 'We could not find the account associated with the username/email you have provided',
      life: 5000,
    })
    formIsSubmitting.value = false; // Reset button state after error
    return; // Prevent further processing if validation failss
  }

  formStore.saveLoginEmailSection(payload)
  emits('nextButtonClicked') // Emit event for successful validation
  formIsSubmitting.value = false; // Reset button state after success
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
      <form class="w-3/4 md:w-3/5 lg:w-3/5  mt-6 flex flex-col space-y-2">
        <WbInputText
          v-model="payload.email"
          placeholder="Enter your email"
          label="Username or Email"
          size="small"
          class="text-xs text-surface-800 lg:text-surface-800 font-sans"
          @keyup.enter="handleNextSection" 
          :invalid="validator.email.$invalid"
          :invalid-text="validator.email.$errors[0]?.$message"
          label-class="text-xs text-surface-500 lg:text-surface-500"
          validation-error-message-class="text-xs text-error-300 font-bold lg:font-normal lg:text-error-500 dark:lg:text-error-300"
        >
        </WbInputText>
      
        <!-- Start Action Buttons -->
        <div class="mt-4 flex items-center justify-between pt-6">
          <Button
            label="Forgot Email?"
            size="small"
            class="text-xs text-surface-600 lg:text-surface-800 font-sans"
            text
            @click="$router.push({ name: 'forgot-password' })"
          >
          </Button>

          <Button 
            @click="handleNextSection" 
            label="Next" 
            size="large" 
            :loading="formIsSubmitting"
            class="bg-blue-800"> 
          </Button>

        </div>
        <!-- End Action Buttons -->
      </form>
    </div>
    <!-- End Form -->
  </section>
</template>
