<script setup lang="ts">
import InputOtp from 'primevue/inputotp'
import Image from 'primevue/image'
import { onBeforeMount, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Button from 'primevue/button'
import { MfaVerifyBackupCodeResponseData, useAuthStore } from '@/stores/auth.store.ts'
import { ApiErrorCode } from '@/typings/http-resources.types.ts'
import { useToast } from 'primevue/usetoast'
import WbInputText from '@/components/webkit/WbInputText.vue'

const props = defineProps({
  mfaName: String,
  stepsStatus: String,
  verifyCode: Function,
})

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

/** Handle QR Code (and code backups) and OTP input visibility */
const showBackupCodesInput = ref(false)
const authStore = useAuthStore()
const showQrCode = ref(!authStore.currentMfaStep?.enrolled && !showBackupCodesInput.value)
const showOtpInput = ref(authStore.currentMfaStep?.enrolled && !showBackupCodesInput.value)

const qrCodeBase64 = ref<null | string>(null)
const backupCodes = ref<Array<string>>([])
const setupKey = ref<null | string>(null)
const qrCodeIsLoading = ref(false)
onBeforeMount(async () => {
  if (showQrCode.value) {
    qrCodeIsLoading.value = true
    const responseData = await authStore.fetchMfaQrCode()
    qrCodeIsLoading.value = false

    if (!responseData) {
      showOtpInput.value = true
      showQrCode.value = false
      return
    }

    qrCodeBase64.value = responseData.qr_code
    backupCodes.value = responseData.backup_codes
    setupKey.value = responseData.secret_key
  }
})

const handleQrCodeContinue = () => {
  if (backupCodes.value.length > 0) return handleShowBackupCodes()
  handleShowOtpInput()
}

/** Handle Backup Codes */
const backupCode = ref('')
const backupCodeIsBeingVerified = ref(false)

const handleShowBackupCodeInput = () => {
  showBackupCodesInput.value = true
  showBackupCodes.value = false
  showQrCode.value = false
  showOtpInput.value = false
}

const handleShowQrCode = () => {
  showQrCode.value = true
  showBackupCodesInput.value = false
  showBackupCodes.value = false
  showOtpInput.value = false
}

const toast = useToast()

const handleVerifyBackupCode = async () => {
  backupCodeIsBeingVerified.value = true
  const response = await authStore.verifyMfaBackupCode(backupCode.value)
  backupCodeIsBeingVerified.value = false

  if (!response.success && response.error_code === ApiErrorCode.INVALID_MFA_BACKUP_CODE_ERROR) {
    toast.add({
      severity: 'error',
      summary: 'Multi-Factor Authentication',
      detail: 'The Backup Code entered is incorrect',
      life: 5000,
    })

    return false
  }

  if (!response.success && response.error_code === ApiErrorCode.TOO_MANY_REQUESTS_ERROR) {
    return false
  }

  toast.add({
    severity: 'success',
    summary: 'Multi-Factor Authentication',
    detail: 'Backup code verification success',
    life: 3000,
  })

  const responseData = response.data as MfaVerifyBackupCodeResponseData
  qrCodeBase64.value = responseData.qr_code
  setupKey.value = responseData.secret_key
  handleShowQrCode()
}

const showBackupCodes = ref(false)
const handleShowBackupCodes = () => {
  showBackupCodes.value = true
  showQrCode.value = false
  showOtpInput.value = false
  showBackupCodesInput.value = false
}

const handleShowOtpInput = () => {
  showBackupCodes.value = false
  showQrCode.value = false
  showOtpInput.value = true
  showBackupCodesInput.value = false

  backupCodes.value = []
}
</script>

<template>
  <section>
  <div class=" text-surface-0 lg:text-surface-800 ">
    <!-- Start Form Title -->
    <div class="flex w-full flex-col text-surface-600 lg:pt-24 sm:pt-0">
        <img src="@/assets/image/DSWDUNO.png" width="150" class="mx-auto" />
      </div>
      <h5 class="text-md mb-0 mt-0 text-primary-900 text-center">
        <b>Multi-Factor Authentication</b>
      </h5>
      <h3 class="text-md mb-0 mt-0 text-primary-900 text-center">
        <span>{{ props.stepsStatus }}</span>
        <b> {{ props.mfaName }} </b>
      </h3>
    <!-- End Form Title -->
    <!-- Start Form Caption -->
    <div class="flex w-full flex-col text-surface-600 text-center">
      <p class="my-2 text-sm leading-relaxed dark:text-surface-100">
        <span v-if="showOtpInput">
          Enter the six-digit code shown in your <span class="font-bold text-primary-900">Authenticator </span> app to
          proceed.
        </span>
        <span v-if="showQrCode">
          <span class="font-bold">Scan</span> the QR code with the
          <span class="font-bold text-primary-500">Authenticator App. </span>Note that the QR code will only be displayed
          <b>once</b>.
        </span>
        <span v-if="showBackupCodes">
          <span class="font-bold text-primary-500">Store your backup codes securely: </span>
          <br />
          These ({{ backupCodes?.length }}) one-time codes are like spare keys to your account.
          <span class="font-bold">Keep them private and in a safe place</span>, separate from your phone.
        </span>
        <span v-if="showBackupCodesInput">
          Enter an <span class="font-bold">unused backup code</span> to regenerate a new QR code.
          <br> Scan it with
          <span class="font-bold text-primary-500">{{ props.mfaName }}</span> app when prompted.
        </span>
      </p>
    </div>
    <!-- End Form Caption -->
    <div class="mt-2 flex justify-center">
      <!-- Start show the QR code first if the user has not enrolled yet -->
      <div v-if="showQrCode" class="flex w-full flex-col items-center justify-center text-sm">
        <Image :src="qrCodeBase64 || undefined" alt="MFA QR Code" width="250"></Image>
        <br />
        <span class="mb-1">Or you may manually use the time-based set-up key</span>
        <span class="text-md font-code sm:text-xl">{{ setupKey }}</span>
      </div>
      <!-- End show the QR code first if the user has not enrolled yet -->
      <!-- Start Code Input -->
      <InputOtp v-if="showOtpInput" v-model="mfaCode" :length="6" integerOnly />
      <!-- End Code Input -->
      <!-- Start Display Backup Codes -->
      <div v-if="showBackupCodes" class="flex max-w-96 flex-wrap justify-center gap-2 sm:gap-4">
        <div
          v-for="code in backupCodes"
          :key="code"
          class="text-md mb-1 rounded-lg bg-surface-200 px-3 py-1 font-code dark:bg-surface-800 sm:text-xl text-surface-900"
        >
          {{ code }}
        </div>
      </div>
      <!-- End Display Backup Codes -->
      <!-- Start Backup Codes Input -->
      <WbInputText
        v-if="showBackupCodesInput"
        v-model="backupCode"
        label="Backup Code"
        label-class="text-xs text-surface-500 lg:text-surface-900 "
        class="text-xs text-surface-800 lg:text-surface-800 font-sans"
      />
      <!-- End Backup Codes Input -->
    </div>
    <!-- Start Action Buttons -->
    <div class="mt-6 flex flex-col items-start justify-between gap-y-4 sm:flex-row md:flex-row lg:mt-8 pb-12">
      <div class="mt-4 flex w-full flex-col sm:items-start md:mt-0">
        <Button
          v-if="showOtpInput"
          @click="handleShowBackupCodeInput"
          severity="secondary"
          label="Use Backup Code"
          class="w-full sm:w-fit"
        >
          <template #icon>
            <FontAwesomeIcon icon="fa-solid fa-database" class="mr-2" />
          </template>
        </Button>
        <Button v-if="showBackupCodesInput" @click="handleShowOtpInput" severity="secondary" label="Back">
          <template #icon>
            <FontAwesomeIcon icon="fa-solid fa-arrow-circle-left" class="mr-2" />
          </template>
        </Button>
      </div>
      <Button
        v-if="showOtpInput"
        :loading="mfaCodeIsBeingVerified"
        :disabled="!mfaCode"
        @click="handleCodeVerification(mfaCode)"
        label="Verify Code"
        class="w-full bg-primary-900 text-white sm:w-40"
      >
        <template #icon>
          <FontAwesomeIcon icon="fa-solid fa-key" class="mr-2" />
        </template>
      </Button>
      <Button v-if="showQrCode" @click="handleQrCodeContinue" label="Continue" class="py-2 px-4 text-sm font-medium text-white bg-primary-900 rounded-lg w-full sm:w-auto justify-self-end mx-2">
        <template #icon>
          <FontAwesomeIcon icon="fa-solid fa-arrow-circle-right" class="mr-2" />
        </template>
      </Button>
      <Button v-if="showBackupCodes" @click="handleShowOtpInput" label="Complete" class="py-2 px-4 text-sm font-medium text-white bg-primary-900 rounded-lg w-full sm:w-auto justify-self-end mx-2">
        
        <template #icon>
          <FontAwesomeIcon icon="fa-solid fa-circle-check" class="mr-2" />
        </template>
      </Button>
      <Button
        v-if="showBackupCodesInput"
        @click="handleVerifyBackupCode"
        :disabled="!backupCode || backupCodeIsBeingVerified"
        :loading="backupCodeIsBeingVerified"
        label="Verify Backup Code"
        class="w-full justify-self-end sm:w-60 bg-primary-900 truncate"
      >
        <template #icon>
          <FontAwesomeIcon icon="fa-solid fa-key" class="mr-2" />
        </template>
      </Button>
    </div>
    <!-- End Action Buttons -->
  </div>
</section>
</template>
