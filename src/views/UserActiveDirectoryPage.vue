<script setup lang="ts">
import Paginator, { PageState } from 'primevue/paginator'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputGroup from 'primevue/inputgroup'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useToast } from 'primevue/usetoast'
import { onBeforeMount, ref, watch } from 'vue'
import { useUsersStore } from '@/stores/users.store.ts'
import { ApiResponsePagination } from '@/typings/http-resources.types.ts'
import { useRolesStore } from '@/stores/roles.store.ts'
import DirectoryCard from '@/components/active-directory-page/DirectoryCard.vue'

/** Initial Users Fetch & Role Options */
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

/** Search and Filters */
const roleFilter = ref<number | null>(null)
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
</script>

<template>
  <div class="mx-auto flex h-[100%] w-full flex-col">
    <!-- Start Filters & Controls -->
    <div
      class="my-6 flex w-full flex-col items-center justify-between gap-4 rounded-lg bg-surface-0 px-6 py-6 shadow-sm dark:bg-surface-800 md:my-4 md:flex-row md:px-4 md:py-4"
    >
       <!-- Start Filter & Search Inputs -->
      <div class="flex w-full">
      </div>
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
              <p class="uppercase text-surface-600 font-semibold">
                {{ props.data.user_profile?.full_name }}
              </p>
              <span>{{ props.data.email }}</span>
            </template>
          </Column>
          <Column field="username" header="USERNAME">
            <template #body="props">
              <p class="uppercase text-surface-600">
                {{ props.data.user_profile?.first_name?.slice(0, 1) || '' }}{{ props.data.user_profile?.last_name }}
              </p>
            </template>
          </Column>
          <Column field="odsu" header="ODSU">
            <template #body="props">
              <span>   {{ props.data.user_profile?.odsu?.uuid }}</span>
            </template>
          </Column>
          <Column field="position" header="POSITION">
            <template #body="props">
              <p class="uppercase text-surface-600">
                {{ props.data.user_profile?.position }}
              </p>
            </template>
          </Column>
          <Column field="status" header="STATUS">
            <template #body="{ data }">
              <span v-if="data.active === true">
                <div class="w-3 h-3 bg-green-400 rounded-full inline-block mr-2"></div> Online
              </span>
              <span v-else>
                <div class="w-3 h-3 bg-red-400 rounded-full inline-block mr-2"></div> Offline
              </span>
            </template>
          </Column>
          <Column field="action" header="ACTION">
            <template #body="props">
              <DirectoryCard :user="props.data" :role-filter="roleFilter" class="transition-all hover:scale-105 hover:cursor-pointer hover:shadow-xl" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
    <div v-if="usersListIsLoading" class="flex min-h-56 animate-pulse flex-col items-center justify-center">
      <i class="pi pi-spinner animate-spin text-xl text-surface-400" />
    </div>
    <!-- End of Data Table -->

 

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
