<script setup lang="ts">
import {  onMounted, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useAuthStore } from '@/stores/auth.store.ts'
import { OAuthRequestPayload } from '@/stores/auth.store'

const authStore = useAuthStore()
const oAuthURL = import.meta.env.VITE_OAUTH_ROOT_URL
const queryString = ref('')



onMounted(async () => {

  await authStore.fetchClientId(authStore.ssoPayload?.client_id)
  
  queryString.value = window.location.search
  
  const ssoParams = new URLSearchParams(window.location.search)

  authStore.ssoPayload = Object.fromEntries(ssoParams)
  // window.location.href = `${oAuthURL}/authorize?${queryString.value}`
})



</script>

<template>
  <div class="relative flex min-h-screen">
    <div class="flex min-w-0 flex-auto flex-col place-items-start lg:flex-row pt-24">
      <!-- Start SSO entry Form -->
      <section class="mt-6 w-full lg:mt-0">
        <div class="flex justify-center items-start">
            <img src="@/assets/image/DesignTop.png" class="absolute top-0 w-full mx-auto" />
            <img src="@/assets/image/DesignBelow.png" class="absolute bottom-0 w-full mx-auto" />
            <div class="text-surface text-center lg:text-surface-800">
                <img src="@/assets/image/DSWDUNO.png" width="100" class="mx-auto  my-1"  />
                <div class="text-center text-primary-900 text-2xl">
                    <h1>Please Wait</h1>
                    <h5></h5>
                </div>
            </div>
        </div>
            <div class="mt-4 flex justify-center">
                <FontAwesomeIcon icon="fa-solid fa-circle-notch" class="text-primary-900 h-12 w-auto animate-spin"></FontAwesomeIcon>
            </div>
        </section>
      <!-- End SSO entry Form -->
    </div>
  </div>
</template>
