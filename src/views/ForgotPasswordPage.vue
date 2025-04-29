<script setup lang="ts">
import Button from 'primevue/button'
import WbInputText from '@/components/webkit/WbInputText.vue'
import { reactive, ref } from 'vue'
import { email, required, helpers } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import { useAuthStore } from '@/stores/auth.store.ts'
import { useToast } from 'primevue/usetoast'
import { ApiErrorCode } from '@/typings/http-resources.types.ts'

const payload = reactive<{ email: string }>({
  email: '',
})

/** Handle Validation */
const formRules = {
  $lazy: true,
  email: {
    required: helpers.withMessage('Please enter your email address', required),
    email: helpers.withMessage('Please enter a valid email address', email),
  },
}

const validator = useVuelidate<{ email: string }>(formRules, payload)

// Prevent the user from submitting too many emails
const requestPasswordButtonIsLocked = ref(false)
const requestPasswordButtonTimer = ref(60)
let requestPasswordButtonTimerId: NodeJS.Timeout | undefined = undefined
const resetRequestPasswordButtonLock = () => {
  clearInterval(requestPasswordButtonTimerId)
  requestPasswordButtonIsLocked.value = false
  requestPasswordButtonTimer.value = 60
}

// Handle Form Submission
const authStore = useAuthStore()
const formIsLoading = ref(false)
const showErrorAlert = ref(false)
const errorMessage = ref<string | null>(null)
const toast = useToast()
const handleSubmitForm = async () => {
  const valid = await validator.value.$validate()
  if (!valid || requestPasswordButtonIsLocked.value) return

  formIsLoading.value = true
  const response = await authStore.requestForgotPassword(payload.email)
  formIsLoading.value = false

  if (!response.success) {
    showErrorAlert.value = true
    if (response.error_code === ApiErrorCode.FORBIDDEN_ERROR)
      return (errorMessage.value = 'The account using this email address is deactivated. Please contact our support team.')
    else
      return (errorMessage.value =
        "We were unable to send an email to the address you've provided. Please contact our support team.")
  }

  toast.add({
    severity: 'success',
    summary: 'Forgot Password',
    detail: "We've sent a password reset link to your email address",
    life: 5000,
  })

  showErrorAlert.value = false

  // Lock the send email button for 60 seconds
  requestPasswordButtonIsLocked.value = true
  requestPasswordButtonTimerId = setInterval(async () => {
    requestPasswordButtonTimer.value -= 1
    if (requestPasswordButtonTimer.value <= 0) {
      resetRequestPasswordButtonLock()
    }
  }, 1000)
}
</script>

<template>
    <section>
      <div class="relative flex min-h-screen">
    <div class="mx-auto flex flex-col items-center px-0 py-8 md:min-h-screen lg:py-0 pt-10">
    <img src="@/assets/image/DesignTop.png" class="absolute top-0 w-full mx-auto" />
    <img src="@/assets/image/DesignBelow.png" class="absolute bottom-0 w-full mx-auto" />
  <div class=" text-surface text-center lg:text-surface-800 ">
    <div class="mb-24"></div>
    <img src="@/assets/image/DSWDUNO.png" width="100" class="mx-auto my-1" />
    <div class="text-center text-primary-900 ">
      <h1 class="mb-4 text-center text-2xl font-semibold dark:text-gray-200">Forgot Your Password?</h1>
      <div class="text-center text-surface-0 lg:text-surface-800">
        <p class="mb-2 mt-2 text-sm text-primary-900">
        Please enter the email you've used to sign-in to the application. <br> If you've entered a valid email address, you
        will receive the reset link in your inbox.
      </p>
      </div>
    </div>
    <div class="flex justify-center ">
      <form class="w-3/4 md:w-3/5 lg:w-3/5  mt-6 flex flex-col space-y-2 "  @submit.prevent>
            <WbInputText
              v-model="payload.email"
              label="Email Address"
              placeholder="Enter your email"
              class="text-xs text-surface-800 lg:text-surface-800 font-sans"
              :invalid="validator.email.$invalid"
              :invalid-text="validator.email.$errors[0]?.$message"
              label-class="text-xs text-surface-500 lg:text-surface-500 flex justify-start"  validation-error-message-class="text-xs text-error-300 font-bold lg:font-normal lg:text-error-500 dark:lg:text-error-300"
              @keyup.enter="handleSubmitForm"
            >
            </WbInputText>
            <div class="mt-4 flex items-center justify-between pt-6 pb-12">
            <Button
              label="Back to Login"
              size="small"
              class="text-xs text-surface-600 lg:text-surface-800 font-sans"
              text
              @click="$router.push({ name: 'login' })"
            >
            <template #icon><i class="pi pi-arrow-left mr-2 " /></template>
            </Button>
            <Button
              label="Submit"
              :loading="formIsLoading"
              :disabled="requestPasswordButtonIsLocked || formIsLoading"
              @click="handleSubmitForm"
              class="bg-primary-900"
            >
              <template #icon>
                <i class="pi pi-send mr-2"></i>
              </template>
            </Button>
             
            </div>
            <small
                v-if="requestPasswordButtonIsLocked"
                class="mt-4 w-full text-center text-xs italic text-surface-500 md:text-right"
              >
                You can request again after <span class="font-bold">{{ requestPasswordButtonTimer }}</span> seconds
              </small>
      </form>
    </div>
  </div>
  </div>
  </div>
</section>
</template>

