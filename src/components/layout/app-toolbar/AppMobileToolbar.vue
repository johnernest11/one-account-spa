<script setup lang="ts">
import Toolbar from 'primevue/toolbar'
import AppMobileSidebar from '@/components/layout/app-sidebar/AppMobileSidebar.vue'

import WbBreadcrumbs from '@/components/layout/AppBreadcrumbs.vue'
</script>

<template>
  <nav class="flex w-full flex-col">
    <!-- Start Mobile Toolbar -->
    <Toolbar class="!rounded-0 !bg-surface-000  px-4 shadow-none !ring-0 lg:hidden">
      <template #start>
        <img src="@/assets/image/DSWDUNO.png" width="50" class="ml-4" />
      </template>
      <template #end>
        <AppMobileSidebar />
      </template>
    </Toolbar>
    <!-- End Mobile Toolbar -->
    <WbBreadcrumbs class="mt-4 px-6 !font-medium" />
  </nav>
</template>

<style scoped></style>
