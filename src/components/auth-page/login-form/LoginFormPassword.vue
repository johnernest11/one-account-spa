<script setup lang="ts">
// import WbInputText from '@/components/webkit/WbInputText.vue'
import Message from 'primevue/message'
import Button from 'primevue/button'
import WbPassword from '@/components/webkit/WbPassword.vue'
import { reactive, ref } from 'vue'
import useVuelidate from '@vuelidate/core'
import { helpers, required } from '@vuelidate/validators'
import { useRoute, useRouter } from 'vue-router'
import { LoginPayload, LoginEmailPayload, useAuthStore } from '@/stores/auth.store.ts'
import { ApiErrorCode,ApiResponseBody } from '@/typings/http-resources.types.ts'
import { useSettingsStore } from '@/stores/settings.store.ts'
import { applications } from '@/composables/sso/applications'
import { useToast } from 'primevue/usetoast'


/** Emits */
const emit = defineEmits<{
    (e: 'onCredentialsError', value: boolean): void;
    (e: 'previousButtonClicked'): void;
}>()

/** Props */
const props = withDefaults(defineProps<{ showLoginExpiredAlert: boolean }>(), {
  showLoginExpiredAlert: false,
})

const route = useRoute() 
/** Payload */
const formStore = useAuthStore()
const payloads = reactive<LoginEmailPayload>({
  email: formStore.loginInfo.email || null,
})

const payload = reactive<LoginPayload>({
  email: payloads.email || '',
  password: '',
})

/** Form Validation */
const formRules = {
  $lazy: true,
  password: {
    required: helpers.withMessage('Enter your password', required),
  },
}
const validator = useVuelidate<LoginPayload>(formRules, payload)

/** Form Submission */
const formIsSubmitting = ref(false)
const showCredsErrorAlert = ref(false)
const credsErrorMessage = ref('')
const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const toast = useToast()
const appName = ref("");
const urlParams = new URLSearchParams(window.location.search);
const service = urlParams.get("service") || 'defaultService';
if (applications[service]) {
  appName.value = applications[service].application; 
}
const handleLogin = async () => {
  formIsSubmitting.value = true
  const valid = await validator.value.$validate()
  if (!valid) return (formIsSubmitting.value = false)

  const newPayload = manageIfEmailIsUsername(Object.assign({}, payload))
  let response: ApiResponseBody | undefined

  if (!service || !applications[service]) {
    response = await authStore.login(newPayload);
  } else {
    response = await authStore.signInToApplication(newPayload, appName.value)
  
  }

  if (!response?.success ) {
    toast.add({
      severity: 'error',
      summary: 'Invalid  Password',
      detail: "The credentials you've entered are incorrect",
      life: 5000,
    })
  }
  // Handle unsuccessful login attempt
  if (!response?.success) {
    formIsSubmitting.value = false
    showCredsErrorAlert.value = true

    switch (response?.error_code) {
      case ApiErrorCode.INVALID_CREDENTIALS_ERROR:
      case ApiErrorCode.VALIDATION_ERROR:
        credsErrorMessage.value = "The credentials you've entered are incorrect"
        break
      case ApiErrorCode.FORBIDDEN_ERROR:
        credsErrorMessage.value =
          "We're sorry, but your account login is currently disabled. To reactivate your account, please contact support."
        break
      case ApiErrorCode.TOO_MANY_REQUESTS_ERROR:
        credsErrorMessage.value = "We've received too many attempts from you. Please try again after a few minutes."
        break
      default:
        credsErrorMessage.value = 'Your account is currently deactived. Please contact our support team.'
    }
    emit('onCredentialsError', true)
    return
  }
  formIsSubmitting.value = false

 

  // Handle Login -> MFA Guard -> Verify Account flow if MFA is enabled
  if (route.query.from === 'verify-account' && settingsStore.mfaIsEnabled) {
    return await router.replace({
      name: 'mfa-guard-page',
      query: {
        from: route.query.from,
        id: route.query.id,
        hash: route.query.hash,
        expires: route.query.expires,
        signature: route.query.signature,
      },
    })
  }

  // Handle Login -> Verify Account flow if MFA is disabled
  if (route.query.from === 'verify-account' && !settingsStore.mfaIsEnabled) {
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

  // If MFA is enabled, the mfa_token and mfa_steps will be populated
  // and the user is not authenticated
  if (authStore.mfaToken && !authStore.isAuthenticated) {
    const queryParams: any = {
      from: route.query.from, 
    };
    const currentRouteQueryParams = route.query;
    for (const key in currentRouteQueryParams) {
      if (Object.prototype.hasOwnProperty.call(currentRouteQueryParams, key)) {
        if (key !== 'from') {
          if (currentRouteQueryParams[key] !== undefined) {
            queryParams[key] = currentRouteQueryParams[key];
          }
        }
      }
    }

    return await router.replace({
      name: 'mfa-guard-page',
      query: queryParams,
    })
  }

  // Redirect to the `from` route if it exists
  if (route.query.from) {
    return await router.replace({ name: route.query.from as string })
  }
  // For normal log-ins, we go the dashboard page for verified emails, and to the guard page for those who
  if (authStore.authenticatedUser.email_verified_at) {
    return await router.replace({ name: 'dashboard' })
  } else {
    return await router.replace({ name: 'verify-email-guard' })
  }  
}
console.log('[DEBUG] MFA token:', authStore.mfaToken)

const manageIfEmailIsUsername = (payload: LoginPayload) => {
  // Combine conditions for efficiency and security
  if (isValidEmail(payload.email as string)) {
  // Email is valid, keep it as-is
    return payload
  } else {
  // Email is invalid OR not provided, use it as username (if present)
    if (payload.email) {
      payload.username = payload.email // Use email as username even if invalid
    }
    delete payload.email // Remove potentially invalid email
  }
  return payload
}
// Function to validate email format (basic validation, adjust as needed)
function isValidEmail(email: string): boolean {
  const emailRegex = /^\w+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}
</script>

<template>
  <section class="bg-transparent">
    <div class="flex justify-center">
    <form class="w-3/4 md:w-3/5 lg:w-3/5  mt-6 flex flex-col space-y-2" @submit.prevent>
    <div class="text-center text-surface-0 lg:text-primary-800">
      <p class="mb-1 mt-2 text-sm text-primary-900">
        Welcome, <strong>{{ payload.email }} </strong><br />
          <Button 
              @click="emit('previousButtonClicked')"
              label=" Not you ?"
              class="mt-1 text-surface-600 font-semibold"
              text
            >
            </Button>
      </p>
       <!-- Start Alert Message -->
    <transition enter-active-class="transition duration-200" enter-from-class="scale-50 opacity-0" leave-to-class="opacity-0">
      <Message v-if="showCredsErrorAlert" :closable="false" severity="error">
        <span>{{ credsErrorMessage }}</span>
      </Message>
    </transition>
      <!-- Start Auth Token Expired Message -->
      <transition enter-active-class="transition duration-200" enter-from-class="scale-50 opacity-0" leave-to-class="opacity-0">
        <Message v-if="props.showLoginExpiredAlert && !showCredsErrorAlert" :closable="false" severity="warn">
          <span>Your login session has expired, please enter your credentials again to continue.</span>
        </Message>
      </transition>
      <!-- End Auth Token Expired Message -->
    </div>
    <!-- Start Form -->
        
        
        <WbPassword
          v-model="payload.password"
          label="Enter your password"
          :feedback="false"
          toggleMask
          :invalid="validator.password.$invalid"
          :invalid-text="validator.password.$errors[0]?.$message"
          @keyup.enter="handleLogin" 
          label-class="text-xs text-surface-500 lg:text-surface-500"
          validation-error-message-class="text-xs text-error-300 font-bold lg:font-normal lg:text-error-500 dark:lg:text-error-300"
        >
        </WbPassword>
        <div class="mt-4 flex items-center justify-end pt-6 pb-12">
          <!-- Start Action Buttons -->
          <div class="mt-1 flex items-center justify-end ">
            <Button 
              @click="handleLogin" 
              label="Next" size="large" 
              class="bg-primary-900" 
              :loading="formIsSubmitting"> </Button>
          </div>
          <!-- End Action Buttons -->
        </div>
      </form>
    </div>
    <!-- End Form -->
  </section>
</template>
