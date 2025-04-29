import { defineStore, storeToRefs } from 'pinia'
import { useApiCall } from '@/composables/network'
import { useAuthStore } from '@/stores/auth.store.ts'
import { UserResponse } from '@/typings/models.types.ts'
import { ApiResponseBody } from '@/typings/http-resources.types.ts'
import { useDateFormat } from '@vueuse/core'

/** Typings */
export type ChangePasswordPayload = { old_password: string; password: string; password_confirmation: string }

export type UploadProfilePictureResponse = { owner_id: string | number; path: string; url: string }

export type UserProfilePayload = {
  email: string
  guid: string
  first_name: string
  last_name: string
  middle_name: string | null
  ext_name: string | null
  mobile_number: string | null
  sex: 'male' | 'female' | null
  birthday: string | null
  position: string | null
  home_address: string | null
  barangay_id: string | number | null
  city_id: string | number | null
  province_id: string | number | null
  region_id: string | number | null
  postal_code: string | null
  telephone_number?: string | null
  profile_picture_path?: string | number | null
}

export const useProfileStore = defineStore('profile', () => {
  /**
   * VueUse's useStorage() loses reactivity after serialization,
   * we make it reactive again by wrapping storeToRefs()
   *
   * @see https://pinia.vuejs.org/core-concepts/#Destructuring-from-a-Store
   */
  const auth = storeToRefs(useAuthStore())

  const fetchProfile = async () => {
    const { data } = await useApiCall('/profile', auth.authenticationToken.value).get().json()

    const responseBody: ApiResponseBody = data.value
    if (responseBody.success) {
      auth.authenticatedUser.value = responseBody.data as UserResponse
    }

    return responseBody
  }

  const updateProfile = async (payload: Partial<UserProfilePayload>) => {
    // The API only accepts Y-m-d format (2024-01-31)
    if (payload.birthday) {
      payload.birthday = useDateFormat(payload.birthday, 'YYYY-MM-DD').value.toString()
    }

    const { data } = await useApiCall('/profile', auth.authenticationToken.value).patch(payload).json()

    const responseBody: ApiResponseBody = data.value
    if (responseBody.success) {
      auth.authenticatedUser.value = responseBody.data as UserResponse
    }

    return responseBody
  }

  const uploadProfilePicture = async (payload: FormData) => {
    const { data } = await useApiCall('/profile/profile-picture', auth.authenticationToken.value).post(payload).json()

    const responseBody: ApiResponseBody = data.value
    if (responseBody.success && auth.authenticatedUser.value.user_profile) {
      const uploadProfilePictureResponse = responseBody.data as UploadProfilePictureResponse
      auth.authenticatedUser.value.user_profile.profile_picture_url = uploadProfilePictureResponse.url
    }

    return responseBody
  }

  const changePassword = async (payload: ChangePasswordPayload) => {
    const { data } = await useApiCall('/profile/password', auth.authenticationToken.value).patch(payload).json()
    return data.value as ApiResponseBody
  }

  return { fetchProfile, updateProfile, uploadProfilePicture, changePassword }
})
