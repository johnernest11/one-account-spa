<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store.ts'
import { useToast } from 'primevue/usetoast'
import { ApiErrorCode } from '@/typings/http-resources.types.ts'
import { snakeCaseToTitleCase } from '@/utils/helpers.ts'
import DeliveryBasedForm from '@/components/mfa-guard-page/DeliveryBasedForm.vue'
import AppBasedForm from '@/components/mfa-guard-page/AppBasedForm.vue'
import { applications } from '@/composables/sso/applications'

/** Handle Logout **/
const router = useRouter()
const authStore = useAuthStore()

/** Handle MFA code verification **/
const appName = ref('')
const urlParams = new URLSearchParams(window.location.search)
const toast = useToast()
const service = urlParams.get('service') || 'defaultService'
if (applications[service]) {
  appName.value = applications[service].application
}
const handleMfaCodeVerification = async (mfaCode: string) => {
  let response
  if (service && applications[service]) {
    response = await authStore.verifySSOMfaCode(mfaCode)
  } else {
    response = await authStore.verifyMfaCode(mfaCode)
  }


  if (!response.success && response.error_code !== ApiErrorCode.TOO_MANY_REQUESTS_ERROR) {
    toast.add({
      severity: 'error',
      summary: 'Multi-Factor Authentication',
      detail: 'The OTP entered is incorrect',
      life: 5000,
    })

    return false
  }

  // We go back to login page if we receive an invalid mfa attempt error
  if (!response.success && response.error_code === ApiErrorCode.INVALID_MFA_ATTEMPT_TOKEN_ERROR) {
    toast.add({
      severity: 'error',
      summary: 'Multi-Factor Authentication',
      detail: 'Your MFA attempt session has expired',
      life: 5000,
    })

    await router.replace({ name: 'login' })

    return false
  }

  if (!response.success) {
    return false
  }

  if (!authStore.allMfaStepsCompeted) {
    toast.add({
      severity: 'success',
      summary: 'Multi-Factor Authentication',
      detail: 'OTP verification success. Continue to the next step.',
      life: 4000,
    })
  } else {
    // Handle MFA completion directly here
    const authenticatedUser = authStore.authenticatedUser
    const authenticationToken = authStore.authenticationToken

    if (authenticationToken && authenticatedUser) {
      if (service && applications[service]) {
        const hrPayload = {
          token: authenticationToken,
          with_user: true,
          client_name: 'Single Sign-On',
          email: authenticatedUser.email,
          user: {
            email: authenticatedUser.email,
            userId: authenticatedUser.id,
          },
        }

        await sendToApplication(hrPayload)

        const hrCaresUrl = import.meta.env.VITE_SPA_SSO_URL
        const url = `${hrCaresUrl}?token=${authenticationToken}`
        window.location.replace(url)

        sessionStorage.removeItem('auth-token')
        sessionStorage.removeItem('auth-user')
        sessionStorage.removeItem('mfa-token')
        sessionStorage.removeItem('mfa-steps')
      } else {
        console.log('MFA completed for standard login (no SSO).')
      }
    } else {
      console.error('Authentication token or user not available after MFA completion.')
      await router.replace({ name: 'login' })
    }
  }

  return true
}

/** Handle MFA Step Management **/
const totalSteps = computed(() => {
  if (!authStore.mfaSteps) return null

  return authStore.mfaSteps.length
})

const currentStepNumber = computed(() => {
  if (!authStore.mfaSteps) return null

  return authStore.mfaSteps.reduce((count, step) => {
    return count + (step.completed ? 1 : 0)
  }, 1)
})

const stepStatus = computed(() => {
  return totalSteps.value && totalSteps.value > 1 ? '(' + currentStepNumber.value + '/' + totalSteps.value + ')' : ''
})

const sendToApplication = async (payload: { token: string; with_user: boolean; client_name: string; user: any }) => {
  console.log('Sending to HR system with payload:', payload)
  const hrCaresUrl = import.meta.env.VITE_API_SSO_URL
  const response = await fetch(hrCaresUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const hrResponse = await response.json()
  return hrResponse?.redirectUrl || null
}
</script>

<template>
    <div class="relative flex min-h-screen">
    <div class="mx-auto flex flex-col items-center px-0 py-8 md:min-h-screen lg:py-0 pt-24">
      <img src="@/assets/image/DesignTop.png" class="absolute top-0 w-full mx-auto" />
  <img src="@/assets/image/DesignBelow.png" class="absolute bottom-0 w-full mx-auto" />
  <div class="mt-4 flex justify-center">
        <!-- Start MFA Form -->
        <DeliveryBasedForm
          v-if="authStore.currentMfaStep?.type === 'delivery'"
          :mfa-name="snakeCaseToTitleCase(authStore.currentMfaStep?.name ?? '')"
          :steps-status="stepStatus"
          :verify-code="handleMfaCodeVerification"
          :is-first-mfa-step="currentStepNumber === 1"
        />
        <AppBasedForm
          v-else
          :mfa-name="snakeCaseToTitleCase(authStore.currentMfaStep?.name ?? '')"
          :steps-status="stepStatus"
          :verify-code="handleMfaCodeVerification"
        />
        <!-- End MFA Form -->
      </div>
    </div>
    </div>
</template>
