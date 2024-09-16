<script setup lang="ts">
import InputOtp from 'primevue/inputotp'
import Button from 'primevue/button'
import { reactive,ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useAuthStore, LoginEmailPayload } from '@/stores/auth.store.ts'
import { maskEmail } from '@/utils/custom-validations.ts'

const props = defineProps({
  mfaName: String,
  stepsStatus: String,
  verifyCode: Function,
  isFirstMfaStep: Boolean,
  email: String,
})

/** Payload */
const formStore = useAuthStore()
const payloads = reactive<LoginEmailPayload>({
  email: formStore.loginInfo.email?.email || null,
})

const MaskEmail = maskEmail(payloads.email); // Outputs: "joh******@example.com"


/** Handle MFA code verification **/
const mfaCode = ref('')
const mfaCodeIsBeingVerified = ref(false)

const handleCodeVerification = async (code: string) => {
  mfaCodeIsBeingVerified.value = true
  let isVerified = false

  if (props.verifyCode) {
    isVerified = await props.verifyCode(code)
  }

  mfaCodeIsBeingVerified.value = false

  if (isVerified) mfaCode.value = ''
}

/** Handle MFA code delivery lockout **/
// Prevent the user from submitting too many OTPs
const resendMfaCodeButtonIsLocked = ref(false)
const resendMfaCodeButtonTimer = ref(60)
let resendMfaCodeButtonTimerId: NodeJS.Timeout | undefined = undefined

const resetResendMfaCodeButtonLock = () => {
  clearInterval(resendMfaCodeButtonTimerId)
  resendMfaCodeButtonIsLocked.value = false
  resendMfaCodeButtonTimer.value = 60
}

const toast = useToast()
const mfaCodeIsBeingResent = ref(false)
const authStore = useAuthStore()
const handleResendMfaCode = async () => {
  if (resendMfaCodeButtonIsLocked.value) return

  mfaCodeIsBeingResent.value = true
  const response = await authStore.resendMfaCode()
  mfaCodeIsBeingResent.value = false

  // If it's a validation error, then the email is incorrect (or someone is trying to guess an email)
  if (!response.success) {
    return toast.add({
      severity: 'error',
      summary: 'Multi-Factor Authentication',
      detail: 'Unable to resend OTP',
      life: 5000,
    })
  }

  toast.add({
    severity: 'success',
    summary: 'Multi-Factor Authentication',
    detail: "We've sent you another OTP",
    life: 5000,
  })

  // Lock the send email button for 60 seconds
  resendMfaCodeButtonIsLocked.value = true
  resendMfaCodeButtonTimerId = setInterval(async () => {
    resendMfaCodeButtonTimer.value -= 1
    if (resendMfaCodeButtonTimer.value <= 0) {
      resetResendMfaCodeButtonLock()
    }
  }, 1000)
}
</script>

<template>
    <div class="text-center text-surface-0 lg:text-surface-800 ">
      <div class="flex w-full flex-col text-surface-600 lg:pt-24 sm:pt-0">
        <img src="@/assets/image/DSWDUNO.png" width="150" class="mx-auto" />
      </div>
      <h5 class="text-md mb-0 mt-0 text-blue-900">
        <b>Multi-Factor Authentication</b>
      </h5>
      <h3 class="text-md mb-0 mt-0 text-blue-900">
        <span>{{ props.stepsStatus }}</span>
        <b> {{ props.mfaName }} </b>
      </h3>
      <div class="flex w-full flex-col text-surface-600">
        <p v-if="props.isFirstMfaStep" class="my-2 text-sm leading-relaxed dark:text-surface-100 text-blue-900">
          We have sent a six-digit one-time-password <br> (OTP) to your email <strong>{{ MaskEmail }}</strong><br>
          <strong class="text-black">Not you?.</strong>
        </p>
        <p v-else class="my-2 text-sm leading-relaxed dark:text-surface-100">
          Use the <b>Send OTP</b> button to receive a six-digit one-time-password. Please enter the code to proceed.
        </p>
        <div class="mt-4 flex justify-center">
          <InputOtp v-model="mfaCode" :length="6" integerOnly />
        </div>
        <div class="mt-4 flex items-center justify-between pt-6">
          <div class="mt-4 flex w-full flex-col sm:items-start md:mt-0">
            <p class="text-md ml-2">Did not receive the OTP?</p>
            <Button
              :disabled="resendMfaCodeButtonIsLocked"
              :loading="mfaCodeIsBeingResent"
              @click="handleResendMfaCode"
              :label="`${props.isFirstMfaStep ? 'Re-send OTP' : 'Send OTP'}`"
              class="text-md lg:text-blue-900 border-0"
              size="small"
              text
            >
              <strong>{{ `${props.isFirstMfaStep ? 'Re-send OTP' : 'Send OTP'}` }}</strong>
            </Button>
            <p v-if="resendMfaCodeButtonIsLocked" class="mt-1 text-center text-xs italic text-surface-600 sm:mt-3 lg:text-sm">
              You can send again after <span class="font-bold">{{ resendMfaCodeButtonTimer }}</span> seconds
            </p>
          </div>
          <Button
            :loading="mfaCodeIsBeingVerified"
            @click="handleCodeVerification(mfaCode)"
            :disabled="!mfaCode"
            label="Verify Code"
            class="w-full bg-blue-700 text-white sm:w-40"
          >
          </Button>
        </div>
        </div>
    </div>
</template>
