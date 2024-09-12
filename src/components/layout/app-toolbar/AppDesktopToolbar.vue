<script setup lang="ts">
import Toolbar from 'primevue/toolbar'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
// import WbBreadcrumbs from '@/components/layout/AppBreadcrumbs.vue'
import Badge from 'primevue/badge'
import Menu from 'primevue/menu'
import Tag from 'primevue/tag'
import type { MenuItem } from 'primevue/menuitem'
import { useGlobalUiStore } from '@/stores/ui.store.ts'
import AppLogo from '@/components/layout/AppLogo.vue'
import { useAuthStore } from '@/stores/auth.store.ts'
import { useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import { snakeCaseToTitleCase } from '@/utils/helpers.ts'
// import InputText from 'primevue/inputtext'

const uiStore = useGlobalUiStore()
const authStore = useAuthStore()
const router = useRouter()

/** Avatar Menu */
const avatarMenu = ref()
const avatarMenuItems = ref<MenuItem[]>([
  {
    label: 'Data Entry',
    icon: 'pi pi-book',
  },
  {
    label: 'Need Help',
    icon: 'pi pi-phone',
    command: async () => {
      await router.push({ name: 'support' })
    },
  },
  {
    label: 'Logout',
    icon: 'pi pi-sign-out',
    noArrow: true,
    command: async () => {
      await handleLogout()
    },
  },
])
const fullName = computed(() => {
  return authStore.authenticatedUser.user_profile?.full_name || ''
})

const toggleAvatarMenu = (event: Event) => {
  avatarMenu.value.toggle(event)
}

const handleLogout = async () => {
  await authStore.logout()
  await router.replace({ name: 'login' })
}
</script>

<template>
  <Toolbar class="bg-surface-000 min-h-[4rem] px-6 py-6 shadow-none !ring-0 dark:bg-surface-950">
    <template #start>
      <div  v-if="uiStore.sidebarMinimized" icon-only class="mr-4">
          <img src="@/assets/image/DSWDUNO.png" width="150" class="ml-4" />
      </div>
      <!-- <AppLogo v-if="uiStore.sidebarMinimized" icon-only class="mr-4"></AppLogo> -->
      <Button
        icon="pi pi-th-large"
        severity="secondary"
        text
        rounded
        aria-label="Menu"
        v-tooltip.bottom="`${uiStore.sidebarMinimized ? 'Show Sidebar' : 'Hide Sidebar'}`"
        class="mr-4 hover:text-primary-500 dark:!text-surface-200"
        @click="uiStore.toggleSidebar()"
      />
      <!-- <WbBreadcrumbs /> -->
    </template>

    <template #end>
      <!-- <span class="relative mr-4">
        <i class="pi pi-search absolute left-3 top-2/4 -mt-2 text-surface-400 dark:text-surface-600" />
        <InputText placeholder="Search" class="pl-10" />
      </span> -->

      <!-- Start Avatar Menu -->
      <template v-if="authStore.isAuthenticated">
        <Avatar
          :image="authStore.authenticatedUser.user_profile?.profile_picture_url ?? undefined"
          shape="circle"
          class="cursor-pointer overflow-hidden transition-transform hover:scale-105 hover:ring-1 hover:ring-primary-500 dark:!bg-primary-500"
          :label="`${
            !authStore.authenticatedUser.user_profile?.profile_picture_url ? authStore.avatarDisplayNamePlaceholder : ''
          }`"
          @click="toggleAvatarMenu"
          aria-haspopup="true"
          aria-controls="avatar-menu"
        />
        <!--
          @note `avatarMenu.focusedOptionIndex = -1` removes the auto focus for the first item of the Menu component
          @see https://github.com/primefaces/primevue/issues/4481
        -->
        <Menu
          ref="avatarMenu"
          id="avatar-menu"
          :model="avatarMenuItems"
          :popup="true"
          @focus="() => $nextTick(() => (avatarMenu.focusedOptionIndex = -1))"
        >
          <template #start>
            <button
              class="p-link relative mb-2 flex w-full items-center overflow-hidden rounded-md p-2 pl-3 hover:bg-surface-100 dark:hover:bg-surface-400/10"
              @click="router.push({ name: 'profile' })"
            >
              <Avatar
                :image="authStore.authenticatedUser.user_profile?.profile_picture_url ?? undefined"
                :label="`${
                  !authStore.authenticatedUser.user_profile?.profile_picture_url ? authStore.avatarDisplayNamePlaceholder : ''
                }`"
                class="mr-2.5 overflow-hidden dark:!bg-primary-500"
                shape="square"
                size="large"
              />
              <span class="inline-flex flex-col justify-start">
                <span class="mx-1 text-sm">{{ fullName }}</span>
                <span class="mx-1 mt-2 flex flex-wrap gap-1">
                  <Tag v-for="role in authStore.authRoles" :value="snakeCaseToTitleCase(role)" :key="role"></Tag>
                </span>
              </span>
            </button>
          </template>
          <template #item="{ item, props }">
            <a class="flex items-center text-sm" v-bind="props.action">
              <span :class="item.icon" />
              <span class="ml-2 font-normal">{{ item.label }}</span>
              <Badge v-if="item.badge" class="ml-auto" :value="item.badge" />
              <i v-if="!item.noArrow" class="pi pi-angle-right ml-auto text-xs"></i>
            </a>
          </template>
        </Menu>
      </template>
      <!-- End Avatar Menu -->
    </template>
  </Toolbar>
</template>
