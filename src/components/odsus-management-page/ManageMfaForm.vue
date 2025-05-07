<script setup lang="ts">
import Message from 'primevue/message'
import Button from 'primevue/button'
import Skeleton from 'primevue/skeleton'
import { onMounted, reactive, ref } from 'vue'
import { MfaAllStepsResponseData, MfaUnEnrollUserPayload, useAuthStore } from '@/stores/auth.store.ts'
import { parseApiResponseError } from '@/utils/error-handle.ts'
import { useToast } from 'primevue/usetoast'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { snakeCaseToTitleCase } from '@/utils/helpers.ts'
import { ApiErrorCode } from '@/typings/http-resources.types.ts'

/** Emits */
const emit = defineEmits<{
  (e: 'mfa-config-updated', value: boolean): void
}>()

const props = defineProps<{ userId: string | number; userFullName: string }>()

/** Payload */
const payload = reactive<MfaUnEnrollUserPayload>({
  user_id: props.userId || '',
  mfa_step: '',
})

/** Handle MFA Option Selection */
const mfaOptions = ref<MfaAllStepsResponseData>([])
// const selectedMfaOption = ref<string | null>(null)
const mfaOptionsAreLoading = ref(false)
const authStore = useAuthStore()
onMounted(async () => {
  mfaOptionsAreLoading.value = true

  // We just want to show the app-based ones
  mfaOptions.value = (await authStore.fetchAllAvailableMfaMethods()).filter((o) => o.type === 'app')

  mfaOptionsAreLoading.value = false
})

const handleMfaOptionSelect = (name: string) => {
  if (name === payload.mfa_step) return (payload.mfa_step = '')
  payload.mfa_step = name
}

/** Handle Form Submission */
const formIsSubmitting = ref(false)
const showErrorAlert = ref(false)
const errorMessage = ref<string | null>(null)
const errorDetails = ref<string[]>([])
const toast = useToast()
const handleFormSubmission = async () => {
  formIsSubmitting.value = true
  const response = await authStore.unEnrollUserFromMfaMethod(payload)
  formIsSubmitting.value = false

  if (!response.success) {
    const result = parseApiResponseError(response)
    if (!result) return (formIsSubmitting.value = false)

    showErrorAlert.value = true
    errorMessage.value = result.message
    errorDetails.value = result.errors

    if (result.code === ApiErrorCode.RESOURCE_NOT_FOUND_ERROR) {
      errorMessage.value = 'You can only un-enroll a user from an MFA method if they have already initially logged in'
    }

    return
  }

  toast.add({
    severity: 'success',
    summary: 'User MFA Config',
    detail: 'Successfully un-enrolled a user',
    life: 3000,
  })

  emit('mfa-config-updated', true)
}
</script>

<template>
  <form autocomplete="off" @submit.prevent>
    <div class="flex w-full flex-col gap-2 pb-4">
      <!-- Start Alert Message -->
      <transition enter-active-class="transition duration-200" enter-from-class="scale-50 opacity-0" leave-to-class="opacity-0">
        <Message v-if="showErrorAlert" :closable="false" severity="error" class="mb-4">
          <span>{{ errorMessage }}</span>
          <div class="flex flex-col text-xs">
            <div v-for="error in errorDetails" :key="error" class="mt-0.5">{{ '- ' + error }}</div>
          </div>
        </Message>
      </transition>
      <!-- End Alert Message -->
      <!-- Start Un-enroll Section -->
      <span class="un-enroll-user-section text-xs font-bold uppercase">User Un-enrollment</span>
      <span class="text-xs sm:text-sm">
        Here you can un-enroll <b>{{ props.userFullName }}</b> from any available App-based MFA methods. If you want them to
        <b>re-scan the QR code</b> and <b>re-generate back-up codes</b>, select an option below.
      </span>
      <!-- Start MFA Options -->
      <Skeleton v-if="mfaOptionsAreLoading" height="4rem" class="mb-2 mt-3" />
      <template v-if="!mfaOptionsAreLoading">
        <button
          v-for="option in mfaOptions"
          :key="option.name"
          @click="handleMfaOptionSelect(option.name)"
          :class="`mb-1 mt-3 flex items-center justify-between rounded-lg px-2 py-2 font-bold ring-2 transition-all hover:scale-[101%]
            sm:px-6 sm:py-4 ${payload.mfa_step === option.name ? 'ring-primary-500' : 'ring-surface-500'}`"
        >
          <div class="flex flex-col items-start justify-center text-left">
            <span
              >{{ snakeCaseToTitleCase(option.name) }}
              <FontAwesomeIcon
                v-if="payload.mfa_step === option.name"
                icon="fa-solid fa-check-circle"
                class="ml-1 inline text-primary-500 sm:hidden"
              />
            </span>
            <span class="text-xs font-medium"
              >Use the {{ snakeCaseToTitleCase(option.name) }} app to generate one-time-passwords</span
            >
          </div>
          <div v-if="payload.mfa_step === option.name" class="hidden sm:flex">
            <FontAwesomeIcon icon="fa-solid fa-check-circle" class="text-lg text-primary-500 sm:text-2xl" />
          </div>
        </button>
      </template>
      <template v-if="!mfaOptionsAreLoading && mfaOptions.length === 0">
        <Message :closable="false" severity="warn">
          There are no app-based MFA methods currently available for this application
        </Message>
      </template>
      <!-- End MFA Options -->
      <!-- End Un-enroll Section -->
      <!-- Start Action Buttons -->
      <div class="mt-4 flex justify-end">
        <Button
          @click="handleFormSubmission"
          :loading="formIsSubmitting"
          :disabled="!payload.mfa_step || formIsSubmitting"
          label="Un-enroll User"
        >
          <template #icon>
            <FontAwesomeIcon icon="fa-solid fa-delete-left" class="mr-2" />
          </template>
        </Button>
      </div>
      <!-- End Action Buttons -->
    </div>
  </form>
</template>
