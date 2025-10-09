<script setup lang="ts">
import WbInputText from '@/components/webkit/WbInputText.vue'
import { reactive, ref } from 'vue'
import useVuelidate from '@vuelidate/core'
import { helpers, required } from '@vuelidate/validators'
import { uniqueUserIdentifierRule } from '@/utils/custom-validations.ts'
import Button from 'primevue/button'
import { LoginEmailPayload, useAuthStore } from '@/stores/auth.store.ts'
import { useToast } from 'primevue/usetoast'

/** Payload */
const formStore = useAuthStore()

const payload = reactive<LoginEmailPayload>({
  email: formStore.loginInfo.email || null,
})

/** Events */
const emits = defineEmits(['nextButtonClicked'])
const toast = useToast()

/** Form Validation */
const formRules = {
  $lazy: true,
  email: {
    required: helpers.withMessage('Please enter your email address', required),
    unique: helpers.withAsync(
      helpers.withMessage('We could not find the account', uniqueUserIdentifierRule('email')),
      async () => {
        const isValidEmail = payload.email
        const isValid = await uniqueUserIdentifierRule('email')
        return isValid && isValidEmail
      }
    ),
  },
}

const validator = useVuelidate<LoginEmailPayload>(formRules, payload)

/** Form Submission State */
const formIsSubmitting = ref(false)

const handleNextSection = async () => {
  formIsSubmitting.value = true
  const valid = await validator.value.$validate()

  if (!valid) {
    toast.add({
      severity: 'error',
      summary: 'Username or Email error',
      detail: 'We could not find the account associated with the username/email you have provided',
      life: 5000,
    })
    formIsSubmitting.value = false
    return
  }

  formStore.saveLoginEmailSection(payload)
  emits('nextButtonClicked')
  formIsSubmitting.value = false
}
</script>

<template>
  <div class="text-center text-surface-0 lg:text-surface-800">
    <p class="mb-2 mt-2 text-sm text-primary-900">
      Welcome, please use your active directory <br />
      account username to continue.
    </p>
  </div>
  <section class="bg-transparent">
    <!-- Start Form -->
    <div class="flex justify-center">
      <form class="mt-6 flex w-3/4 flex-col space-y-2 md:w-3/5 lg:w-3/5" @submit.prevent>
        <WbInputText
          v-model="payload.email"
          placeholder="Enter your AD Username"
          label="AD Username"
          size="small"
          class="font-sans text-xs text-surface-800 lg:text-surface-800"
          @keyup.enter="handleNextSection"
          :invalid="validator.email.$invalid"
          :invalid-text="validator.email.$errors[0]?.$message"
          label-class="text-xs text-surface-500 lg:text-surface-500"
          validation-error-message-class="text-xs text-error-300 font-bold lg:font-normal lg:text-error-500 dark:lg:text-error-300"
        >
        </WbInputText>

        <!-- Start Action Buttons -->
        <div class="mt-4 flex items-center justify-end pb-12 pt-6">
          <Button @click="handleNextSection" label="Next" size="large" :loading="formIsSubmitting" class="bg-primary-900">
          </Button>
        </div>
        <!-- End Action Buttons -->
      </form>
    </div>
    <!-- End Form -->
  </section>
</template>
