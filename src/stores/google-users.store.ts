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
  cn : string,
  sn : string,
  givenname : string,
  initials? : string,
  company? : string,
  userprincipalname : string,
  samaccountname : string,
  password : string,
}

export const useGoogleUsersStore = defineStore('users', () => {

  const authStore = useAuthStore()
  // Google base url and API 
  const apiUrl = 'https://admin.googleapis.com/admin/directory/v1/users'
  const authToken = 'ya29.a0AcM612zju6b6_l-jLfk6LzLwvYSI_3-JMJMxWggft30EFeohTHfC_KWpZ-s6-mmvKZf7x9WhLyKNKtNIIuZOA4VMOThKbg1fA6-pT6zgCDH9AnIm7h9WXsjmQZdj0Z9h9XKNXJk8lsJzbuEPeg0qhnniJG5T-tZ2ouuDaCgYKAdsSARASFQHGX2MiT6znrjJNdF7NWsloqPznFQ0171'
  /** States */
  const users = ref<GoogleUserResponse[]>([])

  /** Actions */
  const fetchUsers = async () => {
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

  const searchUsers = async (query: string | null) => {
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

  const createUser = async (user: Partial<UserPayload>) => {
    // Define your API key and endpoint
    const { data } = await useExternalApiCall(apiUrl, authToken).post(user).json()
    const responseBody: ApiResponseBody = data.value

    if (responseBody.success) {
      // // check if the update is still within the role filters param
      // if (user.roles?.length && (roleFilter === null || (roleFilter && user.roles.includes(roleFilter)))) {
      //   users.value.unshift(responseBody.data as UserResponse)
      // }
      alert("User created successfully.")
    }

    return responseBody
  }

  const createAdUser = async (user: Partial<AdUserPayload>) => {
    // Define your API key and endpoint
    const { data } = await useApiCall('/active-directory/', authStore.authenticationToken).post(user).json()
    const responseBody: ApiResponseBody = data.value

    if (responseBody.success) {
      // // check if the update is still within the role filters param
      // if (user.roles?.length && (roleFilter === null || (roleFilter && user.roles.includes(roleFilter)))) {
      //   users.value.unshift(responseBody.data as UserResponse)
      // }
      alert("User created successfully.")
    }

    return responseBody
  }


  const updateUser = async (user: Partial<UserPayload>, id: string | number) => {
    // The API only accepts Y-m-d format (2024-01-31)
    // if (user.birthday) {
    //   user.birthday = useDateFormat(user.birthday, 'YYYY-MM-DD').value.toString()
    // }

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

      // Check if the update is still within the role filters param
      // if (user.roles?.length && roleFilter !== null && !user.roles.includes(roleFilter)) {
      //   users.value.splice(index, 1)
      // }
    }

    return responseBody
  }

  const deleteUser = async (id: string | number) => {
    // const { data, statusCode } = await useExternalApiCall(`${apiUrl}/${id}`, authToken).delete().json()
    const { data } = await useExternalApiCall(`${apiUrl}/${id}`, authToken).delete().json()

    // if (statusCode.value === 204) {
    //   users.value = users.value.filter((user) => user.id !== id)
    //   return { success: true, message: 'User deleted' }
    // }

    return data.value as ApiResponseBody
  }

  return {
    users,
    fetchUsers,
    searchUsers,
    createUser,
    updateUser,
    deleteUser,
    createAdUser,
  }
})
