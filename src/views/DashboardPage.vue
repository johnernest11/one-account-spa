<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGlobalUiStore } from '@/stores/ui.store.ts'
import { sleep } from '@/utils/helpers.ts'
import { useThemeConfig } from '@/composables/theme.ts'
import { useAuthStore } from '@/stores/auth.store.ts'
import WbAvatarFileInput from '@/components/webkit/WbAvatarFileInput.vue'

import Card from 'primevue/card'

const authStore = useAuthStore()

/** We Force Update the page to eliminate the delay when hiding the sidebar in desktop view*/
const uiStore = useGlobalUiStore()
const mountCharts = ref(true)
watch(
  () => uiStore.sidebarMinimized,
  async (isMinimized) => {
    if (!isMinimized) {
      mountCharts.value = false
      await sleep(0.2)
      mountCharts.value = true
    }
  }
)

/** Handle Dark Mode */
const { selectedTheme } = useThemeConfig()
const chartsInDarkMode = ref(selectedTheme.value?.value === 'dark')
watch(
  () => selectedTheme.value,
  (theme) => {
    if (theme?.value === 'dark') {
      return (chartsInDarkMode.value = true)
    }

    chartsInDarkMode.value = false
  }
)
</script>

<template>
  <div v-if="mountCharts" class="mx-auto h-[100%] w-[100%] px-2 md:px-0">
    <!-- Start Welcome Cards -->
    <div class="grid grid-cols-12 gap-5">
      <Card class="col-span-3 opacity-0"></Card>
      <Card align="center" class="col-span-6">
        <template #content>
          <template v-if="authStore.isAuthenticated">
            <WbAvatarFileInput />
          </template>
          <div class="card-header">
            <h3 class="font-bold">Welcome, {{ authStore.authFullName }}</h3>
            <p class="font-bold text-gray-700">Computer Programmer III</p>
            <div class="my-4">
              <hr />
            </div>
            <p class="my-4">Policy and Plans Division - Regional Information and Communications Technology Management Section</p>
          </div>
        </template>
      </Card>
      <Card class="col-span-3 opacity-0"></Card>
      <!-- End Welcome Cards -->
    </div>
    <!-- Start Account & Personal information -->
    <div class="grid grid-cols-1 items-stretch gap-2 space-x-2 md:grid-cols-2">
      <div class="flex h-full w-full flex-col">
        <br />
        <Card>
          <template #content>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <h3 class="text-3xl font-bold">Account Information</h3>
                <span class="text-gray-600"
                  >Authentication information to different information systems developed/deployed in the field office</span
                >
              </div>
              <div class="flex justify-end">
                <i class="pi pi-user" style="font-size: 5rem; color: gray"></i>
              </div>
            </div>
            <div class="mt-6 justify-items-start">
              <span class="text-gray-600"
                >GUID <strong class="text-gray-1000">{{ authStore.authFullName }}</strong></span
              >
            </div>
            <div class="mt-2 justify-items-start">
              <span class="text-gray-600"
                >Active Directory (AD) Account Username <strong>{{ authStore.authFullName }}</strong></span
              >
            </div>
            <hr />
            <div class="flex-col justify-center text-center">
              <p>See Details</p>
            </div>
          </template>
        </Card>
      </div>
      <div class="flex w-full flex-col">
        <br />
        <Card>
          <template #content>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <h3 class="text-3xl font-bold">Personal Information</h3>
                <span class="text-gray-600"
                  >Information about you across information systems developed/deployed in the field office</span
                >
              </div>
              <div class="flex justify-end">
                <i class="pi pi-id-card" style="font-size: 5rem; color: gray"></i>
              </div>
            </div>
            <div class="mt-12 justify-items-start">
              <span class="text-gray-600"
                >Name <strong class="text-gray-1000">{{ authStore.authFullName }}</strong></span
              >
            </div>
            <div class="mt-2 justify-items-start">
              <span class="text-gray-600">Email Address: <strong>(Not Provided)</strong></span>
            </div>
            <hr />
            <div class="flex-col justify-center text-center">
              <p>View More Details</p>
            </div>
          </template>
        </Card>
      </div>
    </div>
    <!-- End Programs & Timeline -->
  </div>
</template>
