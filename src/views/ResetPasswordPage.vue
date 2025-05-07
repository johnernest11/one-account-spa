<script setup lang="ts">
import Button from 'primevue/button'
import WbInputText from '@/components/webkit/WbInputText.vue'
import { computed, reactive, ref } from 'vue'
import { email, required, helpers, minLength, maxLength, sameAs } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import { ResetPasswordPayload, useAuthStore } from '@/stores/auth.store.ts'
import { useToast } from 'primevue/usetoast'
import Message from 'primevue/message'
import { passwordRule } from '@/utils/custom-validations.ts'
import { useRoute, useRouter } from 'vue-router'
import WbPassword from '@/components/webkit/WbPassword.vue'
import Divider from 'primevue/divider'

const router = useRouter()
const payload = reactive<ResetPasswordPayload>({
  email: router.currentRoute.value.query.email as string,
  password: '',
  password_confirmation: '',
  token: '',
})

/** Handle Validation */
const formRules = {
  $lazy: true,
  email: {
    required: helpers.withMessage('Please enter your email address', required),
    email: helpers.withMessage('Please enter a valid email address', email),
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

const validator = useVuelidate<{ email: string }>(formRules, payload)

// Handle Form Submission
const authStore = useAuthStore()
const formIsLoading = ref(false)
const showErrorAlert = ref(false)
const toast = useToast()
const route = useRoute()
const handleSubmitForm = async () => {
  const valid = await validator.value.$validate()
  if (!valid) return

  formIsLoading.value = true
  payload.token = route.query.token?.toString() || ''
  const response = await authStore.resetPassword(payload)
  formIsLoading.value = false

  // If it's a validation error, then the email is incorrect (or someone is trying to guess an email)
  if (!response.success) {
    return (showErrorAlert.value = true)
  }

  toast.add({
    severity: 'success',
    summary: 'Reset Password',
    detail: "You've successfully reset your password",
    life: 5000,
  })

  showErrorAlert.value = false

  await router.replace({ name: 'login' })
}
</script>

<template>
      <section>
        <div class="relative flex min-h-screen">
  <div
    :class="`flex h-full w-full flex-col items-center pt-2 transition-colors md:pt-14 ${
      showErrorAlert
        ? 'from-error-500 to-error-900 dark:from-error-800'
        : 'from-primary-500 to-primary-900 dark:from-primary-800 dark:to-primary-950'
    }`"
  >
  <img src="@/assets/image/DesignTop.png" class="absolute top-0 w-full mx-auto" />
    <img src="@/assets/image/DesignBelow.png" class="absolute bottom-0 w-full mx-auto" />
    <!-- <br> -->
        <!-- Start Alert Message -->
          <transition enter-active-class="transition duration-100" enter-from-class="scale-50 opacity-0" leave-to-class="opacity-0">
            <Message v-if="showErrorAlert" :closable="false" severity="error" class="mx-4 mb-6 md:mx-0">
              <span> The link has either expired, so please double check your inbox, or you've entered an incorrect email. </span>
            </Message>
          </transition>
        <!-- End Alert Message -->
         <!--Start Form-->
        <div :class="` flex justify-center z-10 mx-2 max-w-3xl px-0.5 md:mx-0 md:px-2  ${showErrorAlert ? 'lg:mt-0' : 'lg:mt-8'}`">
          <form class="w-3/4 md:w-3/5 lg:w-3/5  mt-6 flex flex-col space-y-2"  @submit.prevent>
            <div class="item-center  flex justify-between">
              <img src="@/assets/image/DSWDUNO.png" width="100" class="mx-auto my-1" />
            </div>
            <div class="mb-6">
             <h1 class="mb-4 text-center text-2xl font-semibold dark:text-gray-200">Reset Your Password?</h1>
             <div class="text-center text-surface-0 lg:text-surface-800">
              <p class="mb-2 mt-2 text-sm text-primary-900">
                Enter the email you've used to request this link and input your new password.
              </p>
              </div>
            </div>
             
            <div class="flex flex-col gap-4">
              <WbInputText
                v-model="payload.email"
                label="Email Address *"
                :invalid="validator.email.$invalid"
                :invalid-text="validator.email.$errors[0]?.$message"
                :disabled="true"
              >
              </WbInputText>
              <WbPassword
                v-model="payload.password"
                label="Password *"
                toggleMask
                :invalid="validator.password.$invalid"
                :invalid-text="validator.password.$errors[0]?.$message"
                @blur="validator.password.$touch"
                @focusin="validator.password.$dirty = false"
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
              >
                <template #prepend-icon>
                  <i class="pi pi-lock" />
                </template>
              </WbPassword>
            </div>

            <div class="mt-4 flex items-center justify-between pt-6 pb-12">
              <Button 
                label="Back to Login" 
                text size="small" @click="$router.push({ name: 'login' })"   
                class="text-xs text-surface-600 lg:text-surface-800 font-sans">
                <template #icon><i class="pi pi-arrow-left mr-2 hidden md:block" /></template>
              </Button>
              <Button
                label="Submit"
                :loading="formIsLoading"
                :disabled="formIsLoading"
                @click="handleSubmitForm"
                 class="bg-primary-900"
              >
                <template #icon>
                  <i class="pi pi-send mr-2"></i>
                </template>
              </Button>
              
            </div>
          </form>
        </div>
            <!-- End Form -->
  </div>
  </div>
</section>
</template>

<style scoped></style>
