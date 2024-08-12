<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { UserPayload, useGoogleUsersStore } from '@/stores/google-users.store.ts'
import useVuelidate from '@vuelidate/core'
import { email, helpers, maxLength, minLength, required, sameAs } from '@vuelidate/validators'
import { mobilePhoneRule, passwordRule, uniqueUserIdentifierRule } from '@/utils/custom-validations.ts'
import { useToast } from 'primevue/usetoast'
import { parseApiResponseError } from '@/utils/error-handle.ts'
import WbInputText from '@/components/webkit/WbInputText.vue'
import WbInputMask from '@/components/webkit/WbInputMask.vue'
import Button from 'primevue/button'
import WbPassword from '@/components/webkit/WbPassword.vue'
import Divider from 'primevue/divider'
import Message from 'primevue/message'

/** Payload */
const payload = reactive<Partial<UserPayload>>({
  email: '',
  mobile_number: null,
  first_name: '',
  last_name: '',
})

/** Validation */
const globalStringMaxLength = import.meta.env.VITE_GLOBAL_STRING_MAX_LENGTH
const globalStringMaxLengthRule = helpers.withMessage(
  `Must not exceed ${globalStringMaxLength} characters`,
  maxLength(globalStringMaxLength)
)
const formRules = {
  $lazy: true,
  email: {
    required: helpers.withMessage('The email address is required', required),
    email: helpers.withMessage('Email format is invalid', email),
    unique: helpers.withAsync(helpers.withMessage('This email is already taken', uniqueUserIdentifierRule('email'))),
  },
  mobile_number: {
    mobile_number: helpers.withMessage('Must be a valid PH mobile number', mobilePhoneRule()),
    unique: helpers.withAsync(
      helpers.withMessage('This mobile number is already taken', uniqueUserIdentifierRule('mobile_number'))
    ),
  },
  first_name: {
    required: helpers.withMessage('First name is required', required),
    maxLength: helpers.withMessage('', globalStringMaxLengthRule),
  },
  last_name: {
    required: helpers.withMessage('Last name is required', required),
    maxLength: globalStringMaxLengthRule,
  },
  password: {
    required: helpers.withMessage('Please enter their password', required),
    minLength: helpers.withMessage('Must be at least 8 characters long', minLength(8)),
    maxLength: helpers.withMessage('Must be a maximum of 50 characters', maxLength(50)),
    password: helpers.withMessage('Must include at least one number, and one uppercase and lowercase letter', passwordRule()),
  },
  password_confirmation: {
    required: helpers.withMessage('Please confirm their password', required),
    sameAsPassword: helpers.withMessage('Must match the password field', sameAs(computed(() => payload.password))),
  },
}

/** Handle Form Submission */
const validator = useVuelidate<Partial<UserPayload>>(formRules, payload)
const formIsSubmitting = ref(false)
const showErrorAlert = ref(false)
const errorMessage = ref<string | null>(null)
const errorDetails = ref<string[]>([])
const userStore = useGoogleUsersStore()
const toast = useToast()

/** Emits */
const emit = defineEmits<{
  (e: 'user-created', value: boolean): void
}>()

/** Form Submission */
const handleFormSubmission = async () => {
  const valid = await validator.value.$validate()
  if (!valid) {
    document.getElementsByClassName('create-user-creds-section')[0]?.scrollIntoView({ behavior: 'smooth' })
    toast.add({
      severity: 'error',
      summary: 'Create User',
      detail: 'Please see the validation messages',
      life: 5000,
    })
    return
  }

  formIsSubmitting.value = true
  // Auth Token
  // User data to be created
  const userData = {
    primaryEmail: payload.email,
    name: {
      givenName: payload.first_name,
      familyName: payload.last_name
    },
    password: payload.password, // Ensure to use hashed passwords in production
    changePasswordAtNextLogin: true
  }
  // Create Google workspace Account
  const responseGoogle = await userStore.createUser(userData)

  const userAdPayload = {
    cn:`${payload.first_name} ${payload.last_name}`,
    givenname: payload.first_name,
    sn: payload.last_name,
    initials:'P',
    company:'DSWD',
    userprincipalname:"dptan@staging.local",
    samaccountname:"dptan",
    password: payload.password
}

  // Create AD Account
  const responseAd = await userStore.createAdUser(userAdPayload)
  console.log(responseAd)

  // Handle the API error
  if (!responseGoogle.success) {
    const result = parseApiResponseError(responseGoogle)
    if (!result) return (formIsSubmitting.value = false)

    showErrorAlert.value = true
    errorMessage.value = result.message
    errorDetails.value = result.errors

    formIsSubmitting.value = false
    return document.getElementsByClassName('create-user-creds-section')[0]?.scrollIntoView({ behavior: 'smooth' })
  }

  formIsSubmitting.value = false
  toast.add({
    severity: 'success',
    summary: 'Create User',
    detail: "You've successfully created a user",
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

      <!-- Start Credentials -->
      <p class="create-user-creds-section text-xs font-medium uppercase">Credentials</p>
      <!-- Start Email and Mobile Number -->
      <div class="flex flex-col gap-4 md:flex-row">
        <WbInputText
          v-model="payload.email"
          label="Email *"
          :invalid="validator.email.$invalid"
          :invalid-text="validator.email.$errors[0]?.$message"
          @blur="validator.email.$touch"
          @focusin="validator.email.$dirty = false"
        >
          <template #prepend-icon>
            <i class="pi pi-envelope" />
          </template>
        </WbInputText>
        <WbInputMask
          v-model="payload.mobile_number"
          label="Mobile Number"
          mask="+639999999999"
          placeholder="+63 XXX XXX XXXX"
          :invalid="validator.mobile_number.$invalid"
          :invalid-text="validator.mobile_number.$errors[0]?.$message"
          @blur="validator.mobile_number.$touch"
          @focusin="validator.mobile_number.$dirty = false"
        >
          <template #prepend-icon>
            <i class="pi pi-phone" />
          </template>
        </WbInputMask>
      </div>
      <!-- End Email and Mobile Number -->

      <!-- Start First name and Last name -->
      <div class="flex flex-col gap-4 md:flex-row">
        <WbInputText
          v-model="payload.first_name"
          label="First name *"
          :invalid="validator.first_name.$invalid"
          :invalid-text="validator.first_name.$errors[0]?.$message"
          @blur="validator.first_name.$touch"
        >
          <template #prepend-icon>
            <i class="pi pi-id-card" />
          </template>
        </WbInputText>
        <WbInputText
          v-model="payload.last_name"
          label="Last name *"
          :invalid="validator.last_name.$invalid"
          :invalid-text="validator.last_name.$errors[0]?.$message"
          @blur="validator.last_name.$touch"
        >
          <template #prepend-icon>
            <i class="pi pi-id-card" />
          </template>
        </WbInputText>
      </div>
      <!-- End First name and Last name -->

      <!-- Start Password and Password Confirmation -->
      <div class="flex flex-col gap-4 md:flex-row">
        <WbPassword
          v-model="payload.password"
          label="Password *"
          toggleMask
          :invalid="validator.password.$invalid"
          :invalid-text="validator.password.$errors[0]?.$message"
          @blur="validator.password.$touch"
          @focusin="validator.password.$dirty = false"
        >
          <template #prepend-icon>
            <i class="pi pi-lock" />
          </template>
          <template #footer-panel>
            <Divider />
            <p class="mb-2 font-bold">Requirements</p>
            <ul class="ml-2 pl-2 font-normal">
              <li class="mb-1">At least one lowercase</li>
              <li class="mb-1">At least one uppercase</li>
              <li class="mb-1">At least one numeric</li>
              <li class="mb-1">Minimum 8 characters</li>
            </ul>
          </template>
        </WbPassword>
        <WbPassword
          v-model="payload.password_confirmation"
          label="Confirm Password *"
          :feedback="false"
          toggleMask
          :invalid="validator.password_confirmation.$invalid"
          :invalid-text="validator.password_confirmation.$errors[0]?.$message"
          @blur="validator.password_confirmation.$touch"
        >
          <template #prepend-icon>
            <i class="pi pi-lock" />
          </template>
        </WbPassword>
      </div>
      <!-- End Password and Password Confirmation -->
      <!-- End Credentials -->

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
