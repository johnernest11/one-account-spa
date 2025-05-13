<script setup lang="ts">
import { onBeforeMount, reactive, ref } from 'vue'
import { OdsuPayload, useOdsusStore } from '@/stores/odsus.store.ts'
import useVuelidate from '@vuelidate/core'
import { helpers, maxLength, required} from '@vuelidate/validators'
import { useToast } from 'primevue/usetoast'
import { parseApiResponseError } from '@/utils/error-handle.ts'
import WbInputText from '@/components/webkit/WbInputText.vue'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useRolesStore } from '@/stores/roles.store.ts'

/** Props */
const props = withDefaults(defineProps<{ currentRoleFilter: number | string | null }>(), {
  currentRoleFilter: null,
})

/** Payload */
const payload = reactive<Partial<OdsuPayload>>({

  uuid: '',
  code: '', 
  name: '',
  head_user_id:  null,
  cluster_code: null,
  parent_code:  null,
  directorate_code: null,
  office_type:  null,
  added_by_user_id:  null,
  last_modified_by_user_id: null, 
  roles: [],
})


/** Roles Options */
const rolesStore = useRolesStore()
const rolesOptionsIsLoading = ref(false)

onBeforeMount(async () => {
  rolesOptionsIsLoading.value = true
  await rolesStore.fetchRoles()
  rolesOptionsIsLoading.value = false
})

/** Validation */
const globalStringMaxLength = import.meta.env.VITE_GLOBAL_STRING_MAX_LENGTH
const globalStringMaxLengthRule = helpers.withMessage(
  `Must not exceed ${globalStringMaxLength} characters`,
  maxLength(globalStringMaxLength)
)
const formRules = {
  $lazy: true,
  uuid: {
    required: helpers.withMessage('Uuid is required', required),
  },
  code: {
    
  },
  name: {
    required: helpers.withMessage('Name is required', required),
    maxLength: globalStringMaxLengthRule,
  },
  parent_code: {
    required: helpers.withMessage('Parent Code is required', required),
  },
}

/** Handle Form Submission */
const validator = useVuelidate<Partial<OdsuPayload>>(formRules, payload)
const formIsSubmitting = ref(false)
const showErrorAlert = ref(false)
const errorMessage = ref<string | null>(null)
const errorDetails = ref<string[]>([])
const odsuStore = useOdsusStore()
const toast = useToast()

/** Emits */
const emit = defineEmits<{
  (e: 'user-created', value: boolean): void
}>()

/** Form Submission */
const handleFormSubmission = async () => {
  const valid = await validator.value.$validate()
  if (!valid) {
    document.getElementsByClassName('create-odsu-creds-section')[0]?.scrollIntoView({ behavior: 'smooth' })
    toast.add({
      severity: 'error',
      summary: 'Create Odsu',
      detail: 'Please see the validation messages',
      life: 5000,
    })
    return
  }

  formIsSubmitting.value = true
  const response = await odsuStore.createOdsu(payload, props.currentRoleFilter)
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
    summary: 'Create Odsu',
    detail: "You've successfully created a odsu",
    life: 5000,
  })

  emit('user-created', true)
}
</script>

<template>
  <form autocomplete="off" @submit.prevent>
    <div class="flex w-full flex-col gap-4 pb-4">
      <!-- Start Alert Message -->
      <transition enter-active-class="transition duration-200" enter-from-class="scale-50 opacity-0" leave-to-class="opacity-0">
        <Message v-if="showErrorAlert" :closable="false" severity="error" class="mb-2">
          <span>{{ errorMessage }}</span>
          <div class="flex flex-col text-xs">
            <div v-for="error in errorDetails" :key="error" class="mt-0.5">{{ '- ' + error }}</div>
          </div>
        </Message>
      </transition>
      <!-- End Alert Message -->
      <!-- Start Personal Information -->
      <p class="mt-4 text-xs font-medium uppercase md:mt-6">Basic Information</p>
      <!-- Start First name and Middle name -->
      <div class="flex flex-col gap-4 md:flex-row">
        <WbInputText
          v-model="payload.uuid"
          label="Uuid*"
          :invalid="validator.uuid.$invalid"
          :invalid-text="validator.uuid.$errors[0]?.$message"
          @blur="validator.uuid.$touch"
        >
          <template #prepend-icon>
            <i class="pi pi-id-card" />
          </template>
        </WbInputText>
        <WbInputText
          v-model="payload.code"
          label="Code"
          :invalid="validator.code.$invalid"
          :invalid-text="validator.code.$errors[0]?.$message"
          @blur="validator.code.$touch"
        >
          <template #prepend-icon>
            <i class="pi pi-id-card" />
          </template>
        </WbInputText>
      </div>
      <!-- End First name and Middle name -->
      <!-- Start Last name and Extension name -->
      <div class="flex flex-col gap-4 md:flex-row">
        <WbInputText
          v-model="payload.name"
          label="Name *"
          :invalid="validator.name.$invalid"
          :invalid-text="validator.name.$errors[0]?.$message"
          @blur="validator.name.$touch"
        >
          <template #prepend-icon>
            <i class="pi pi-id-card" />
          </template>
        </WbInputText>
        <WbInputText
          v-model="payload.parent_code"
          label="Parent Code"
          :invalid="validator.parent_code.$invalid"
          :invalid-text="validator.parent_code.$errors[0]?.$message"
          @blur="validator.parent_code.$touch"
        >
          <template #prepend-icon>
            <i class="pi pi-id-card" />
          </template>
        </WbInputText>
      </div>
      <!-- End Last name and Extension name -->
      <!-- End Personal Information -->
      <!-- Start Action Buttons -->
      <div class="mt-2 flex justify-end">
        <Button
          @click="handleFormSubmission"
          label="Save"
          :loading="formIsSubmitting"
          :disabled="formIsSubmitting"
        >
          <template #icon>
            <i class="pi pi-save mr-2"></i>
          </template>
        </Button>
      </div>
      <!-- End Action Buttons -->
    </div>
  </form>
</template>
