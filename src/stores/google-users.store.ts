import { defineStore } from 'pinia'
import { useApiCall, useExternalApiCall } from '@/composables/network'
import { useAuthStore } from '@/stores/auth.store.ts'
import { GoogleUserResponse } from '@/typings/models.types.ts'
import { GoogleApiResponseBody, ApiResponseBody } from '@/typings/http-resources.types.ts'
import { ref } from 'vue'
// import { useDateFormat } from '@vueuse/core'

/** Typings */
export type UserPayload = {
  email: string
  password: string
  password_confirmation: string
  first_name: string
  last_name: string
  mobile_number?: string | null
  suspended?: boolean
}

/** Typings */
export type AdUserPayload = {
  email: string,
  cn : string,
  sn : string,
  givenname : string,
  initials? : string,
  company? : string,
  userprincipalname : string,
  samaccountname : string,
  password : string,
}

export const useUserAccountStore = defineStore('users-credentials', () => {

  const authStore = useAuthStore()
  // Google base url and API 
  const apiUrl = 'https://admin.googleapis.com/admin/directory/v1/users'
  const authToken = 'ya29.a0AcM612wTw6mr5BQcorSPwR4skL7D0xjzauQfSMw_3G1wWbhHWNv7gz-2aVNG_GzpdsNrqmgA1KH5fpYvIITZVsVGgkJysPb3EtUU9Pa61Old-nSqXuoNJvpDIO0rUornAA6B378B0f8HQx16BqdwGurQKq7oQhNGHu7paCgYKAfQSARASFQHGX2Mi-pTYqIzEaxkRyU1-thxjFg0171'
  /** States */
  const users = ref<GoogleUserResponse[]>([])

  /** Actions */
  const fetchGoogleUsers = async () => {
    let uri =  `${apiUrl}?domain=dev.dx-dswd.com&maxResults=100`

    const { data } = await useExternalApiCall(uri, authToken).get().json()

    const responseBody: GoogleApiResponseBody = data.value

    if (responseBody) {
      const usersList = responseBody.users as GoogleUserResponse[]
      users.value = [...usersList]
    }
    console.log(users.value)
    return responseBody
  }

  const searchGoogleUsers = async (query: string | null) => {
    let uri = '/users/search?'
    if (query) uri += `query=${query}`

    const { data } = await useApiCall(uri, authStore.authenticationToken).get().json()
    const responseBody: ApiResponseBody = data.value

    if (responseBody.success) {
      const usersList = responseBody.data as GoogleUserResponse[]
      users.value = [...usersList]
    }

    return responseBody
  }

  const createGoogleUser = async (user: Partial<UserPayload>) => {
    // Define your API key and endpoint
    const { data } = await useExternalApiCall(apiUrl, authToken).post(user).json()
    const responseBody: ApiResponseBody = data.value

    if (responseBody.success) {
      alert("User created successfully.")
    } else {
      console.log(responseBody)
    }

    return responseBody
  }

  const updateGoogleUser = async (user: Partial<UserPayload>, id: string | number | undefined) => {

    const userData = {
      primaryEmail: user.email,
      name: {
        givenName: user.first_name,
        familyName: user.last_name
      },
      phones: [
        {
          type: "work",
          value: user.mobile_number
        }
      ],
      suspended: user.suspended
    }

    const { data } = await useExternalApiCall(`${apiUrl}/${id}`, authToken).patch(userData).json()
    const responseBody: ApiResponseBody = data.value

    console.log(data)
    if (responseBody.success) {
      const index = users.value.findIndex((user) => user.id === id)
      if (index === -1) return responseBody
      // users.value[index] = responseBody.data as UserResponse
    }
    
    return responseBody
  }

  const deleteGoogleUser = async (id: string | number | undefined) => {
    const { data } = await useExternalApiCall(`${apiUrl}/${id}`, authToken).delete().json()
    return data.value as ApiResponseBody
  }

  const createAdUser = async (user: Partial<AdUserPayload>) => {
    // Define your API key and endpoint
    const { data } = await useApiCall('/active-directory/', authStore.authenticationToken).post(user).json()
    const responseBody: ApiResponseBody = data.value

    if (responseBody.success) {
      alert("User created successfully.")
    } else {
      console.log(responseBody)
    }

    return responseBody
  }

  const deleteAdUser = async (id: string | number | undefined) => {
    // Define your API key and endpoint
    const { data } = await useApiCall(`/active-directory/${id}`, authStore.authenticationToken).delete().json()
    return data.value as ApiResponseBody
  }

  const updateAdUser = async (user: Partial<AdUserPayload>, id: string | number | undefined) => {
    // Define your API key and endpoint
    const { data } = await useApiCall(`/active-directory/${id}`, authStore.authenticationToken).patch(user).json()
    const responseBody: ApiResponseBody = data.value

    // if (responseBody.success) {
    //   const index = users.value.findIndex((user) => user.id === id)
    //   if (index === -1) return responseBody
    //   // users.value[index] = responseBody.data as UserResponse
    // }
    
    return responseBody
  }

  return {
    users,
    fetchGoogleUsers,
    searchGoogleUsers,
    createGoogleUser,
    updateGoogleUser,
    deleteGoogleUser,
    createAdUser,
    deleteAdUser,
    updateAdUser,
  }
  
})
