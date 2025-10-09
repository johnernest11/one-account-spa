<script setup lang="ts">
import { reactive, ref } from 'vue'
import { OdsuPayload, useOdsusStore } from '@/stores/odsus.store.ts'
import {  helpers, required } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import { useToast } from 'primevue/usetoast'
import { OdsuResponse } from '@/typings/models.types.ts'
import { parseApiResponseError } from '@/utils/error-handle.ts'
import { useConfirm } from 'primevue/useconfirm'
import Button from 'primevue/button'
import WbInputText from '@/components/webkit/WbInputText.vue'
import InputSwitch from 'primevue/inputswitch'
import Message from 'primevue/message'


/** Emits */
const emit = defineEmits<{
  (e: 'odsu-updated', value: boolean): void
  (e: 'odsu-deleted', value: boolean): void
}>()

/** Props */
type OdsuDetailsFormProps = {
  currentRoleFilter: number | string | null
  odsu: OdsuResponse
}
const props = withDefaults(defineProps<OdsuDetailsFormProps>(), {
  currentRoleFilter: null,
})

/** Payload */
const payload = reactive<Partial<OdsuPayload>>({
  uuid: props.odsu.uuid || '',
  code: props.odsu.code || '',
  name: props.odsu.name || '',
  head_user_id: props.odsu.head_user_id || '',
  cluster_code: props.odsu.cluster_code || '',
  parent_code: props.odsu.parent_code || '',
  directorate_code: props.odsu.directorate_code || '',
  office_type: props.odsu.office_type || '',
  added_by_user_id: props.odsu.added_by_user_id || '',
  last_modified_by_user_id: props.odsu.last_modified_by_user_id || '',
})

// Toggle Edit Button
const editingEnabled = ref(false)

/** Form Validation */
const formRules = {
  $lazy: true,
  code: {
    required: helpers.withMessage('Uuid is required', required),
  },
  name: {
    required: helpers.withMessage('Uuid is required', required),
  },
}

// Handle Form Submission
const validator = useVuelidate<Partial<OdsuPayload>>(formRules, payload)
const formIsSubmitting = ref(false)
const showErrorAlert = ref(false)
const errorMessage = ref<string | null>(null)
const errorDetails = ref<string[]>([])
const odsuStore = useOdsusStore()
const toast = useToast()
const handleFormSubmission = async () => {
  const valid = await validator.value.$validate()
  if (!valid) {
    document.getElementsByClassName('update-odsu-creds-section')[0]?.scrollIntoView({ behavior: 'smooth' })
    toast.add({
      severity: 'error',
      summary: 'Odsu Details',
      detail: 'Please see the validation messages',
      life: 5000,
    })
    return
  }

  formIsSubmitting.value = true
  const response = await odsuStore.updateOdsu(payload, props.odsu.id, props.currentRoleFilter)
  // Handle the API error
  if (!response.success) {
    const result = parseApiResponseError(response)
    if (!result) return (formIsSubmitting.value = false)

    showErrorAlert.value = true
    errorMessage.value = result.message
    errorDetails.value = result.errors

    formIsSubmitting.value = false
    return document.getElementsByClassName('create-odsu-creds-section')[0]?.scrollIntoView({ behavior: 'smooth' })
  }

  formIsSubmitting.value = false
  toast.add({
    severity: 'success',
    summary: 'Odsu Details',
    detail: "You've successfully updated a odsu",
    life: 5000,
  })

  emit('odsu-updated', true)
}


/** Handle Odsu Deletion */
const odsuIsBeingDeleted = ref(false)
const handleUserDeletion = async () => {
  odsuIsBeingDeleted.value = true
  const response = await odsuStore.deleteOdsu(props.odsu.id)

  if (!response.success) {
    const result = parseApiResponseError(response)
    if (!result) return (formIsSubmitting.value = false)

    showErrorAlert.value = true
    errorMessage.value = result.message
    errorDetails.value = result.errors
    odsuIsBeingDeleted.value = false
    return document.getElementsByClassName('delete-odsu-creds-section')[0]?.scrollIntoView({ behavior: 'smooth' })
  }

  toast.add({
    severity: 'success',
    summary: 'Odsu Deletion',
    detail: `${props.odsu.name || 'The user '} was successfully deleted`,
    life: 3000,
  })

  // Optional page reload, consider user experience and data consistency
  if (shouldReloadPageAfterOdsuDeletion()) {
    setTimeout(() => {
      window.location.reload()
    }, 2000) // Reload after toast disappears
  }

  odsuIsBeingDeleted.value = false
  emit('odsu-deleted', true)
}
const shouldReloadPageAfterOdsuDeletion = (): boolean => {
  return true // Replace with your actual logic
}
const confirm = useConfirm()
const requireConfirmation = (event: Event) => {
  confirm.require({
    group: 'global',
    target: event.currentTarget as HTMLElement,
    message: ` Are you sure you want to delete ${props.odsu.name || 'this user'}? You cannot undo this.`,
    header: 'Delete Odsu',
    acceptLabel: 'Confirm Deletion',
    rejectLabel: 'Cancel',
    accept: () => {
      handleUserDeletion()
    },
  })
}
</script>

<template>
  <form autocomplete="off" @submit.prevent>
    <div class="flex w-full flex-col gap-4 pb-4">
      <!-- Start Alert Message -->
      <transition enter-active-class="transition duration-200" enter-from-class="scale-50 opacity-0" leave-to-class="opacity-0">
        <Message v-if="showErrorAlert" :closable="false" severity="error">
          <span>{{ errorMessage }}</span>
          <div class="flex flex-col text-xs">
            <div v-for="error in errorDetails" :key="error" class="mt-0.5">{{ '- ' + error }}</div>
          </div>
        </Message>
      </transition>
      <!-- End Alert Message -->
      <!-- Start Super User Cannot be Edited nor Deleted Warning -->
      <!-- End Super User Cannot be Edited nor Deleted Warning -->
   
      <!-- Start Toggle Edit Switch  -->
      <div class="mb-1 flex items-center justify-between">
        <!-- Start Enable Editing Switch -->
        <div class="flex items-center justify-between">
          <span class="mr-3 text-xs text-surface-500">{{ !editingEnabled ? 'Enable Editing' : 'Disabled Editing' }}</span>
          <InputSwitch v-model="editingEnabled" ></InputSwitch>
        </div>
        <!-- End Enable Editing Switch -->
      </div>
      <!-- End Toggle Edit Switch-->

      <!-- Start Credentials -->
      <p class="create-user-creds-section text-xs font-medium uppercase">Credentials</p>
      <!-- Start Email and Mobile Number -->
      <div class="flex flex-col gap-4 md:flex-row">
        <WbInputText
          v-model="payload.code"
          label="Uuid *"
          :invalid="validator.code.$invalid"
          :invalid-text="validator.code.$errors[0]?.$message"
          @blur="validator.code.$touch"
          :disabled="!editingEnabled"
        >
          <template #prepend-icon>
            <i class="pi pi-envelope" />
          </template>
        </WbInputText>
        <WbInputText
          v-model="payload.name"
          label="Name *"
          :invalid="validator.name.$invalid"
          :invalid-text="validator.name.$errors[0]?.$message"
          @blur="validator.name.$touch"
          :disabled="!editingEnabled"
        >
          <template #prepend-icon>
            <i class="pi pi-envelope" />
          </template>
        </WbInputText>
      </div>
      <div class="flex flex-col gap-4 md:flex-row">
        <WbInputText
          v-model="payload.cluster_code"
          label="Cluster Code *"
          :invalid="validator.name.$invalid"
          :invalid-text="validator.name.$errors[0]?.$message"
          @blur="validator.name.$touch"
          :disabled="!editingEnabled"
        >
          <template #prepend-icon>
            <i class="pi pi-envelope" />
          </template>
        </WbInputText>
        <WbInputText
          v-model="payload.parent_code"
          label="Parent Code *"
          :invalid="validator.name.$invalid"
          :invalid-text="validator.name.$errors[0]?.$message"
          @blur="validator.name.$touch"
          :disabled="!editingEnabled"
        >
          <template #prepend-icon>
            <i class="pi pi-envelope" />
          </template>
        </WbInputText>
      </div>
      <div class="flex flex-col gap-4 md:flex-row">
        <WbInputText
          v-model="payload.office_type"
          label="Office Type *"
          :invalid="validator.name.$invalid"
          :invalid-text="validator.name.$errors[0]?.$message"
          @blur="validator.name.$touch"
          :disabled="!editingEnabled"
        >
          <template #prepend-icon>
            <i class="pi pi-envelope" />
          </template>
        </WbInputText>
        
      </div>
    

      <!-- Start Action Buttons -->
      <div class="mt-2 flex justify-between">
        <!-- Start Delete Button with Confirmation -->
        <Button
          @click="requireConfirmation($event)"
          label="Delete"
          severity="danger"
          :loading="odsuIsBeingDeleted"
          :disabled="formIsSubmitting ||  !editingEnabled || odsuIsBeingDeleted"
        >
          <template #icon>
            <i class="pi pi-trash mr-2"></i>
          </template>
        </Button>
        <!-- End Delete Button with Confirmation -->
        <!-- Start Update Button -->
        <Button
          @click="handleFormSubmission"
          label="Update"
          :loading="formIsSubmitting"
          :disabled="formIsSubmitting || !editingEnabled"
        >
          <template #icon>
            <i class="pi pi-save mr-2"></i>
          </template>
        </Button>
      </div>
      <!-- End Update Button -->
      <!-- End Action Buttons -->
    </div>
  
  </form>
</template>
