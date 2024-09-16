import { defineStore } from 'pinia'
import { ref } from 'vue'

/** Typings */

export type RegistrationCredentialsPayload = {
  email: string | null
  mobile_number: string | null
  password: string | null
  password_confirmation: string | null
}

export type RegistrationPersonalInfoPayload = {
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  ext_name: string | null
  sex: 'male' | 'female' | null
  birthday: Date | string | null
}

export type RegistrationAddressPayload = {
  region_id: string | number | null
  province_id: string | number | null
  city_id: string | number | null
  barangay_id: string | number | null
  home_address: string | null
  postal_code: string | null
}

export type RegistrationPayload = {
  credentials: RegistrationCredentialsPayload | null
  personal_info: RegistrationPersonalInfoPayload | null
  address: RegistrationAddressPayload | null
  client_name?: string
}

export const useFormsStore = defineStore('forms', () => {
  /** States */
  const registrationInfo = ref<RegistrationPayload>({
    credentials: null,
    personal_info: null,
    address: null,
  })

  /** Actions */
  const saveRegistrationCredentialsSection = (model: RegistrationCredentialsPayload) => {
    registrationInfo.value.credentials = model
  }

  const saveRegistrationPersonalInfoSection = (model: RegistrationPersonalInfoPayload) => {
    registrationInfo.value.personal_info = model
  }

  const saveRegistrationAddressSection = (model: RegistrationAddressPayload) => {
    registrationInfo.value.address = model
  }

  const resetRegistrationInfo = () => {
    registrationInfo.value.personal_info = null
    registrationInfo.value.credentials = null
    registrationInfo.value.address = null
  }

  return {
    registrationInfo,
    resetRegistrationInfo,
    saveRegistrationCredentialsSection,
    saveRegistrationPersonalInfoSection,
    saveRegistrationAddressSection,
  }
})
