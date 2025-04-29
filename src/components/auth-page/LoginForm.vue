<script setup lang="ts">
import EmailSection from '@/components/auth-page/login-form/LoginFormEmail.vue'
import PasswordSection from '@/components/auth-page/login-form/LoginFormPassword.vue'
import { applications } from '@/composables/sso/applications'
import { useAuthStore } from '@/stores/auth.store.ts'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'


const appName = ref('')
const appNameSystem = ref('')
const appNameSystems = ref('')
onMounted(async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    let appRedirect = urlParams.get("redirect");
    console.log(appRedirect);
    let service = urlParams.get("service") || 'defaultService';
    console.log(service);
    appName.value = applications[service].name;
    appNameSystem.value = applications[service].names;
    appNameSystems.value = applications[service].namess;
    
  } catch (error) {
    console.error('Error fetching app name:', error);
    // Handle error gracefully, e.g., display a fallback message
  }
  showLogin.value = route.name === 'login'
})
/** We either show the Login Form or the Create Account Form based on the route */
const route = useRoute()
const showLogin = ref(true)

// We check route when DOM mounts
onMounted(() => {
  showLogin.value = route.name === 'login' ? (showLogin.value = true) : (showLogin.value = false)
})

// We toggle background color of the Webkit text on the left side based on form errors and warnings
const formHasError = ref(false)
const formHasWarning = ref(false)

// We also watch for route changes
watch(
  () => route.name,
  (name) => {
    showLogin.value = name === 'login'
    formHasError.value = false
    formHasWarning.value = false
  }
)

// Handle Login Expiration
const authStore = useAuthStore()
const showLoginExpiredAlert = computed(() => {
  return authStore.authExpired
})


watch(
  () => route.name,
  (name) => {
    showLogin.value = name === 'login'
    formHasError.value = false
    formHasWarning.value = false
  }
)
/** Component States */
const activeStep = ref(0)
const handleNextButtonClicked = () => {
  activeStep.value++
}
const handlePreviousButtonClicked = () => {
  activeStep.value--
}



</script>
<template>
  <section>
<div class="flex justify-center items-start">
  <img src="@/assets/image/DesignTop.png" class="absolute top-0 w-full mx-auto" />
  <img src="@/assets/image/DesignBelow.png" class="absolute bottom-0 w-full mx-auto" />
  <div class="text-surface text-center lg:text-surface-800">
    <img src="@/assets/image/DSWDUNO.png" width="100" class="mx-auto  my-1"  />
    <div class="text-center text-primary-900">
      <h5 v-if="appName != ''">Sign In to continue to <strong v-text="appName"></strong></h5>
        <p v-else>
            Use your <b>Active Directory</b> account
        </p>
        <h1 v-if="appNameSystem != ''" ><b v-text="appNameSystem"></b></h1>
        <h1 v-if="appNameSystems != ''" ><b v-text="appNameSystems"></b></h1>
    </div>
  </div>
</div>
    <div class="mt-4 flex justify-center">
      <form @submit.prevent class="w-full max-w-md">  
        <EmailSection
          key="0"
          v-if="activeStep === 0"
          @next-button-clicked="handleNextButtonClicked"
        />
        <PasswordSection
          key="1"
          v-else-if="activeStep === 1"
          @previous-button-clicked="handlePreviousButtonClicked"
          @on-credentials-error="formHasError = true"
          :show-login-expired-alert="showLoginExpiredAlert"
        />
      </form>
    </div>
  </section>
</template>
