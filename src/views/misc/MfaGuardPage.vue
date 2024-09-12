<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store.ts'
import { useToast } from 'primevue/usetoast'
import { ApiErrorCode } from '@/typings/http-resources.types.ts'
import { snakeCaseToTitleCase } from '@/utils/helpers.ts'
import DeliveryBasedForm from '@/components/mfa-guard-page/DeliveryBasedForm.vue'
import AppBasedForm from '@/components/mfa-guard-page/AppBasedForm.vue'

/** Handle Logout **/
const router = useRouter()
const authStore = useAuthStore()

/** Handle MFA code verification **/
const toast = useToast()
const handleMfaCodeVerification = async (mfaCode: string) => {
  const response = await authStore.verifyMfaCode(mfaCode)

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

const route = useRoute()
watch(
  () => authStore.allMfaStepsCompeted,
  async (completed) => {
    if (!completed) return

    // Handle route redirection from account verification page with params and queries (to the OTP page)
    if (route.query.from === 'verify-account') {
      return await router.replace({
        name: route.query.from,
        params: {
          id: route.query.id as string,
          hash: route.query.hash as string,
        },
        query: {
          expires: route.query.expires,
          signature: route.query.signature,
        },
      })
    }

    // Handle a regular redirect if the `from` query exists (to the OTP page)
    if (route.query.from) {
      try {
        return await router.replace({ name: route.query.from as string })
      } catch (e) {
        return await router.replace({ name: 'dashboard' })
      }
    }

    await router.replace({ name: 'dashboard' })
  }
)

const stepStatus = computed(() => {
  return totalSteps.value && totalSteps.value > 1 ? '(' + currentStepNumber.value + '/' + totalSteps.value + ')' : ''
})
</script>

<template>
    <div class="relative flex min-h-screen">
    <div class="mx-auto flex flex-col items-center px-0 py-8 md:h-screen lg:py-0 pt-24">
      <img src="@/assets/image/DesignTop.png" class="mx-auto" style="position: absolute; top: 0; width: 100%" />
      <img src="@/assets/image/DesignBelow.png" class="mx-auto" style="position: absolute; bottom: 0; width: 100%" />
      <div class="relative z-10 w-[96%] min-w-[96%] sm:mx-0 sm:w-auto md:min-w-[65%] lg:min-w-[50%]">
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
