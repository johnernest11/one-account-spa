<script setup lang="ts">
import LoginForm from '@/components/auth-page/LoginForm.vue'
import { useRoute } from 'vue-router'
import { computed, onMounted, ref, watch } from 'vue'
import RegisterForm from '@/components/auth-page/register-form/RegisterForm.vue'
import { useAuthStore } from '@/stores/auth.store.ts'

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
</script>

<template>
  <div class="relative flex min-h-screen">
    <div class="flex min-w-0 flex-auto flex-col place-items-start lg:flex-row pt-24">
      <!-- Start Login Form -->
        <template v-if="showLogin">
          <LoginForm
            class="mt-6 w-full lg:mt-0"
            @on-credentials-error="formHasError = true"
            :show-login-expired-alert="showLoginExpiredAlert"
          />
        </template>
        <template v-else>
          <RegisterForm class="mt-6 w-full lg:mt-0" />
        </template>
      <!-- End Login Form -->
    </div>
  </div>
</template>
