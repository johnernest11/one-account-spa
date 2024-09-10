<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useSidebarNavLinks } from '@/composables/sidebar.ts'

const { navLinks } = useSidebarNavLinks()
</script>

<template>
  <div class="h-100% flex flex-col bg-surface-0 dark:bg-surface-900">
    <!-- Start Logo -->
    <div class="flex justify-start border-b border-surface-200 px-12 py-6 dark:border-surface-900">
      <img src="/DSWDUNO.png" width="150" class="ml-4" />
    </div>
    <!-- End Logo -->
    <!-- Start Nav Items -->
    <aside class="flex flex-col overflow-y-auto bg-surface-0 px-5 pt-4 dark:border-surface-700 dark:bg-surface-900">
      <div class="flex flex-1 flex-col justify-between">
        <nav class="-mx-3 space-y-6">
          <div v-for="item in navLinks" :key="item.group" class="space-y-3">
            <label class="px-3 text-xs font-bold uppercase text-surface-600 dark:text-surface-400">
              {{ item.group }}
            </label>
            <RouterLink
              as="div"
              v-for="link in item.links"
              :key="link.label"
              :to="{ name: link.name }"
              :class="`flex transform items-center rounded-lg px-3 py-2 transition-colors duration-300 hover:bg-primary-100 hover:text-primary-900 dark:text-surface-200 dark:hover:bg-primary-400/70 ${
                $route.name === link.name ? 'bg-primary-200 text-primary-900 dark:!bg-primary-400/70 dark:!text-surface-200' : ''
              }`"
            >
              <i :class="link.icon"></i>
              <span class="mx-2 text-sm font-medium">{{ link.label }}</span>
            </RouterLink>
          </div>
        </nav>
      </div>
    </aside>
    <!-- End Nav Items -->
  </div>
</template>
