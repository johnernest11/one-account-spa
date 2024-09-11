<script setup lang="ts">
import Paginator, { PageState } from 'primevue/paginator'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputGroup from 'primevue/inputgroup'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import { UserResponse } from '@/typings/models.types.ts'
import { onBeforeMount, ref, watch } from 'vue'
import { useUsersStore } from '@/stores/users.store.ts'
import { ApiResponsePagination } from '@/typings/http-resources.types.ts'
import { useRolesStore } from '@/stores/roles.store.ts'
import CreateUserForm from '@/components/users-management-page/CreateUserForm.vue'
import UserDetailsForm from '@/components/users-management-page/UserDetailsForm.vue'

/** Initial Users Fetch & Role Options */
const prop = defineProps<{ user: UserResponse; roleFilterUser: number | string | null }>()
const usersStore = useUsersStore()
const usersListIsLoading = ref(false)
const rolesStore = useRolesStore()
const rolesOptionsIsLoading = ref(false)
const paginationLimit = 12
onBeforeMount(async () => {
  usersListIsLoading.value = true
  const response = await usersStore.fetchUsers(searchQuery.value, paginationLimit)
  if (response.success && response.pagination) {
    pagination.value = response.pagination
  }
  usersListIsLoading.value = false

  rolesOptionsIsLoading.value = true
  await rolesStore.fetchRoles()
  rolesOptionsIsLoading.value = false
})

/** Pagination */
const pagination = ref<ApiResponsePagination | null>(null)
const handlePaginationPageChange = async (event: PageState) => {
  const pageSelected = event.page + 1 // The page state object starts at 0

  usersListIsLoading.value = true
  const response = await usersStore.fetchUsers(searchQuery.value, paginationLimit, pageSelected)

  if (response.success && response.pagination) {
    pagination.value = response.pagination
  }

  usersListIsLoading.value = false
}

/** Create User Dialog */
const showCreateUserDialog = ref(false)
const toggleCreateUserDialog = () => (showCreateUserDialog.value = !showCreateUserDialog.value)

/** Search and Filters */
const searchQuery = ref<string | null>(null)
watch(
  () => searchQuery.value,
  async () => {
    usersListIsLoading.value = true
    searchQuery.value = null // We clear the search query
    const response = await usersStore.fetchUsers(searchQuery.value, paginationLimit)
    if (response.success && response.pagination) {
      pagination.value = response.pagination
    }
    usersListIsLoading.value = false
  }
)

const toast = useToast()
const handleSearchUser = async () => {
  // We do regular fetch if the query is null / empty
  usersListIsLoading.value = true
  if (!searchQuery.value) {
    const response = await usersStore.fetchUsers(searchQuery.value, paginationLimit)
    if (response.success && response.pagination) {
      pagination.value = response.pagination
    }
    return (usersListIsLoading.value = false)
  }

  // Handle the search if the search query
  const response = await usersStore.searchUsers(searchQuery.value)
  if (response.success && response.pagination) {
    pagination.value = response.pagination
    searchQuery.value = null
    toast.add({
      severity: 'success',
      summary: 'Search Users',
      detail: 'Note that role filters are ignored',
      life: 4000,
    })
  }

  usersListIsLoading.value = false
}

/** Update User Dialog */
const showUserDetailsDialog = ref(false)
const toggleUserDetailsDialog = () => (showUserDetailsDialog.value = !showUserDetailsDialog.value)
</script>

<template>
  <div class="mx-auto flex h-[100%] w-full flex-col">
    <!-- Start Filters & Controls -->
    <div
      class="my-6 flex w-full flex-col items-center justify-between gap-4 rounded-lg bg-surface-0 px-6 py-6 shadow-sm dark:bg-surface-800 md:my-4 md:flex-row md:px-4 md:py-4"
    >
      <!-- Start Create User Button -->
      <div class="flex w-full">
        <Button
          label="Create User"
          severity="secondary"
          outlined
          class="h-8 w-full !ring-surface-400 dark:text-surface-400 md:mx-0 md:h-fit md:w-fit md:text-xs"
          @click="toggleCreateUserDialog"
        >
          <template #icon>
            <i class="pi pi-plus mr-2" />
          </template>
        </Button>
      </div>
      <Dialog
        v-model:visible="showCreateUserDialog"
        header="User Creation"
        modal
        :draggable="false"
        maximizable
        class="mx-2 w-full sm:mx-0"
      >
        <CreateUserForm :current-role-filter="roleFilterUser" @user-created="toggleCreateUserDialog" />
      </Dialog>
      <!-- End Create User Button -->
      <!-- Start Filter & Search Inputs -->
      <div class="flex w-full flex-col justify-end gap-4 md:flex-row">
        <InputGroup v-model="searchQuery">
          <InputText
            v-model="searchQuery"
            placeholder="Search by name or email"
            class="w-full md:min-w-36"
            :disabled="usersListIsLoading"
            @keyup.enter="handleSearchUser"
          />
          <Button icon="pi pi-search" @click="handleSearchUser" :loading="usersListIsLoading" :disabled="usersListIsLoading" />
        </InputGroup>
      </div>
      <!-- End Filter & Search Inputs -->
    </div>
    <!-- End Filters & Controls -->
    <!-- Start of Data Table -->
    <div class="h-[100 %] mx-auto flex w-full flex-col">
      <div class="flex flex-col px-4">
        <div class="flex flex-col md:flex-row"></div>
        <h1><strong>Users</strong></h1>
        <span> Browse list of user`s active directory accounts to manage their respective access </span>
        <DataTable :value="usersStore.users" class="mt-6" dataKey="id">
          <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
          <Column field="full_name" header="NAME">
            <template #body="props">
              <p class="font-menu font-bold dark:text-primary-400">
                {{ props.data.user_profile?.full_name }}
              </p>
              <span>{{ props.data.email }}</span>
            </template>
          </Column>
          <Column field="username" header="USERNAME">
            <template #body="props">
              <span>{{ props.data.user_profile?.first_name }}</span>
            </template>
          </Column>
          <Column field="odsu" header="ODSU">
            <template #body>
              <!-- <span>{{ slotProps.data.email }}</span> -->
            </template>
          </Column>
          <Column field="position" header="POSITION">
            <template #body>
              <!-- <span>{{ slotProps.data.email }}</span> -->
            </template>
          </Column>
          <Column field="status" header="STATUS">
            <template #body="props">
              <span>{{ props.data.active }}</span>
            </template>
          </Column>
          <Column field="action" header="ACTION">
            <template #body="props">
              <span>{{ props.data.id }}</span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
    <div v-if="usersListIsLoading" class="flex min-h-56 animate-pulse flex-col items-center justify-center">
      <i class="pi pi-spinner animate-spin text-xl text-surface-400" />
    </div>
    <!-- End of Data Table -->

    <!-- Start Update User Dialog -->
    <Dialog
      v-model:visible="showUserDetailsDialog"
      header="User Details"
      :draggable="false"
      modal
      maximizable
      class="mx-2 w-full sm:mx-0"
    >
      <UserDetailsForm :user="prop.user" :current-role-filter="prop.roleFilterUser" @user-updated="toggleUserDetailsDialog" />
    </Dialog>
    <!-- End Update-User Dialog -->

    <!-- Start Pagination -->
    <div class="mt-6 flex w-full justify-center md:mt-10">
      <Paginator
        v-if="pagination && pagination.total > 0"
        :rows="pagination.per_page"
        :total-records="pagination.total"
        template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
        @page="(event: PageState) => handlePaginationPageChange(event)"
        class="text-xs md:text-sm"
      />
    </div>
    <!-- End Pagination -->
  </div>
</template>
