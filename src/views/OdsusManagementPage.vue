<script setup lang="ts">
import Paginator, { PageState } from 'primevue/paginator'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputGroup from 'primevue/inputgroup'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
// import { OdsuResponse } from '@/typings/models.types.ts'
import { onBeforeMount, ref, watch } from 'vue'
import { useOdsusStore } from '@/stores/odsus.store.ts'
import { ApiResponsePagination } from '@/typings/http-resources.types.ts'
import { useRolesStore } from '@/stores/roles.store.ts'
import CreateOdsuForm from '@/components/odsus-management-page/CreateOdsuForm.vue'
import OdsuButton from '@/components/odsus-management-page/OdsuButton.vue'
// import OdsuDetailsForm from '@/components/odsus-management-page/OdsuDetailsForm.vue'

/** Initial Users Fetch & Role Options */
const odsusStore = useOdsusStore()
const usersListIsLoading = ref(false)
const rolesStore = useRolesStore()
const rolesOptionsIsLoading = ref(false)
const paginationLimit = 10
onBeforeMount(async () => {
  usersListIsLoading.value = true
  const response = await odsusStore.fetchOdsus(searchQuery.value, paginationLimit)
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
  const response = await odsusStore.fetchOdsus(searchQuery.value, paginationLimit, pageSelected)

  if (response.success && response.pagination) {
    pagination.value = response.pagination
  }

  usersListIsLoading.value = false
}
/** End of Pagination */
/** Create User Dialog */
const showCreateOdsuDialog = ref(false)
const toggleCreateOdsuDialog = () => (showCreateOdsuDialog.value = !showCreateOdsuDialog.value)

/** Search and Filters */
const roleFilter = ref<number | null>(null)
const searchQuery = ref<string | null>(null)
watch(
  () => roleFilter.value,
  async () => {
    usersListIsLoading.value = true
    searchQuery.value = null // We clear the search query
    const response = await odsusStore.fetchOdsus(paginationLimit)
    if (response.success && response.pagination) {
      pagination.value = response.pagination
    }
    usersListIsLoading.value = false
  }
)

const handleSearchUser = async () => {
  // We do regular fetch if the query is null / empty
  usersListIsLoading.value = true
  if (!searchQuery.value) {
    const response = await odsusStore.fetchOdsus(searchQuery.value, paginationLimit)
    if (response.success && response.pagination) {
      pagination.value = response.pagination
    }
    return (usersListIsLoading.value = false)
  }

  // Handle the search if the search query
  const response = await odsusStore.searchOdsus(searchQuery.value)
  if (response.success && response.pagination) {
    pagination.value = response.pagination
    searchQuery.value = null
  }

  usersListIsLoading.value = false
}
/** End of Search and Filters */
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
          @click="toggleCreateOdsuDialog"
        >
          <template #icon>
            <i class="pi pi-plus mr-2" />
          </template>
        </Button>
      </div>
      <Dialog
        v-model:visible="showCreateOdsuDialog"
        header="User Creation"
        modal
        :draggable="false"
        maximizable
        class="mx-2 w-full sm:mx-0"
      >
        <CreateOdsuForm :current-role-filter="roleFilter" @user-created="toggleCreateOdsuDialog" />
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
        <h1><strong>Odsus</strong></h1>
        <span> Browse list of odsu`s accounts to manage their respective access </span>
        <DataTable :value="odsusStore.odsus" class="mt-6" dataKey="id">
          <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
          <Column field="Code" header="Code">
            <template #body="props">
              <p class="uppercase text-surface-600 font-semibold">
                {{ props.data.code }}
              </p>
              <span>{{ props.data.uuid }}</span>
            </template>
          </Column>
          <Column field="Name" header="Name">
            <template #body="props">
              <p class="uppercase text-surface-600">
                {{ props.data.name }}
              </p>
            </template>
          </Column>
          <Column field="Parent Code" header="Parent Code">
            <template #body="props">
              <span>   {{ props.data.parent_code }}</span>
            </template>
          </Column>
          <Column field="position" header="POSITION">
            <template #body="props">
              <p class="uppercase text-surface-600">
                {{ props.data.uuid }}
              </p>
            </template>
          </Column>
          <Column field="Office Type" header="Office Type">
            <template #body="{ data }">
              <span v-if="data.office_type == '0'">
                <div class="w-3 h-3 bg-green-400 rounded-full inline-block mr-2"></div> Office I
              </span>
              <span v-else>
                <div class="w-3 h-3 bg-red-400 rounded-full inline-block mr-2"></div> N/A
              </span>
            </template>
          </Column>
          <Column field="action" header="ACTION">
            <template #body="props">
              <OdsuButton :odsu="props.data" :role-filter="roleFilter" class="transition-all hover:scale-105 hover:cursor-pointer hover:shadow-xl" />
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
     <!-- Start No Users Message -->
    <div
      v-if="!usersListIsLoading && !pagination?.total"
      class="flex w-fit flex-col items-center self-center font-menu text-lg dark:text-surface-300"
    >
      <i class="pi pi-exclamation-triangle text-2xl"></i>
      <p class="mt-2">No odsus found</p>
    </div>
    <!-- End No Users Message -->
  </div>
</template>
