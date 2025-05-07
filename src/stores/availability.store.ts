import { defineStore } from 'pinia'
import { useApiCall } from '@/composables/network.ts'
import { ApiResponseBody } from '@/typings/http-resources.types.ts'

export const useAvailabilitiesStore = defineStore('availabilities', () => {
  const checkUserUniqueIdentifierAvailability = async (
    key: 'username' | 'email',
    value: string,
    excludeId: string | number | null = null
  ) => {
    let url = `/availability/${key}?value=${value}`
    if (excludeId) url += `&excluded_id=${excludeId}`

    const { data } = await useApiCall(url).get().json()
    return data.value as ApiResponseBody & { data: { is_available: boolean } }
  }

  return {
    checkUserUniqueIdentifierAvailability,
  }
})
