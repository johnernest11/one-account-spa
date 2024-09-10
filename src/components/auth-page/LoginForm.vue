<script setup lang="ts">
import { ref } from 'vue'
// import Steps from 'primevue/steps'

import LoginSection from '@/components/auth-page/login-form/LoginFormEmail.vue'
import EmailSection from '@/components/auth-page/login-form/LoginFormPassword.vue'

/** Component States */
const activeStep = ref(0)
// const registrationSteps = ref([
//   {
//     label: 'Email Confirmation',
//   },
//   {
//     label: 'Password',
//   },
// ])
/** UI Handlers */
const handleNextButtonClicked = () => {
  activeStep.value++
}
const handlePreviousButtonClicked = () => {
  activeStep.value--
}
</script>
<template>
  <section>
    <div class="text-surface text-center lg:text-surface-800">
      <img src="/DesignTop.png" class="mx-auto" style="position: absolute; top: 0; width: 100%" />
      <img src="/DesignBelow.png" class="mx-auto" style="position: absolute; bottom: 0; width: 100%" />
      <img src="/DSWDUNO.png" width="150" class="mx-auto" />
      <div class="mb-2 mt-2 flex"></div>
      <div class="mb-2 mt-2 flex"></div>
      <h5 class="text-md mb-2 mt-2 text-blue-900">Sign In to continue to <b>Record</b></h5>
      <h3 class="text-md mb-2 mt-2 text-blue-900">
        <b> Managemnent and</b>
      </h3>
      <h1 class="text-md mb-2 mt-2 text-blue-900">
        <b> Disposition Information System</b>
      </h1>
    </div>
    <!-- <Steps v-model:active-step="activeStep" :model="registrationSteps" /> -->
    <div class="mt-4">
      <form @submit.prevent>
        <LoginSection key="0" v-if="activeStep === 0" @next-button-clicked="handleNextButtonClicked" />
        <EmailSection key="1" v-else-if="activeStep === 1" @previous-button-clicked="handlePreviousButtonClicked" />
      </form>
    </div>
  </section>
</template>
