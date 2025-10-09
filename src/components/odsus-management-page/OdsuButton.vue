<script setup lang="ts">
import { OdsuResponse } from '@/typings/models.types.ts'
import Dialog from 'primevue/dialog'
import { ref } from 'vue'
import OdsuDetailsForm from '@/components/odsus-management-page/OdsuDetailsForm.vue'

const props = defineProps<{ odsu: OdsuResponse; roleFilter: number | string | null }>()

/** Update User Dialog */
const showOdsuDetailsDialog = ref(false)
const toggleOdsuDetailsDialog = () => (showOdsuDetailsDialog.value = !showOdsuDetailsDialog.value)
</script>

<template>
<button
    @click="toggleOdsuDetailsDialog"
    class="relative flex min-h-10 flex-col items-center rounded-lg bg-surface-100 px-2 py-2 shadow-md dark:bg-surface-800"
>
    <span class="text-sm font-medium text-primary-600">Odsu Details</span>
    <Dialog
        v-model:visible="showOdsuDetailsDialog"
        header="Odsu Details"
        :draggable="false"
        modal
        maximizable
        class="mx-2 w-full sm:mx-0"
    >
        <OdsuDetailsForm :odsu="props.odsu" :current-role-filter="props.roleFilter" @odsu-updated="toggleOdsuDetailsDialog" />
    </Dialog>
    </button>


</template>
