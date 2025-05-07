<script setup lang="ts">
// import Tag from 'primevue/tag'
import { UserResponse } from '@/typings/models.types.ts'
// import { snakeCaseToTitleCase } from '@/utils/helpers.ts'
import Dialog from 'primevue/dialog'
import UserDetailsForm from '@/components/users-management-page/UserDetailsForm.vue'
import { ref } from 'vue'

const props = defineProps<{ user: UserResponse; roleFilter: number | string | null }>()

/** Update User Dialog */
const showUserDetailsDialog = ref(false)
const toggleUserDetailsDialog = () => (showUserDetailsDialog.value = !showUserDetailsDialog.value)
</script>

<template>
<button
    @click="toggleUserDetailsDialog"
    class="relative flex min-h-10 flex-col items-center rounded-lg bg-surface-100 px-2 py-2 shadow-md dark:bg-surface-800"
>
    <span class="text-sm font-medium text-primary-600">User Details</span>
    <Dialog
        v-model:visible="showUserDetailsDialog"
        header="Active Dirctory Details"
        :draggable="false"
        modal
        maximizable
        class="mx-2 w-full sm:mx-0"
    >
        <UserDetailsForm :user="props.user" :current-role-filter="props.roleFilter" @user-updated="toggleUserDetailsDialog" />
    </Dialog>
    </button>


</template>
