import { defineStore } from 'pinia'
import { useApiCall } from '@/composables/network'
import { useAuthStore } from '@/stores/auth.store.ts'
import { OdsuResponse } from '@/typings/models.types.ts'
import { ApiResponseBody } from '@/typings/http-resources.types.ts'
import { ref } from 'vue'
import { WbAutoCompleteOption } from '@/components/webkit/WbAutoComplete.vue'

/** Typings */
export type OdsuPayload = {
  odsu_id: string | null
  uuid: string | null
  code: string | null
  name: string | null
  head_user_id: string | null
  cluster_code: string | null
  parent_code: string | null
  directorate_code: string | null
  office_type: string | null
  added_by_user_id?: string | null
  roles: Array<number | string>
  last_modified_by_user_id: string | null
}

export const useOdsusStore = defineStore('odsus', () => {
  const authStore = useAuthStore()

  /** States */
  const odsusOptions = ref<WbAutoCompleteOption[]>([])
  const odsusOptionsIsLoading = ref(false)
  const odsus = ref<OdsuResponse[]>([])

  /** Actions */
  /** Fectch Odsus using WBAutoCompleteOption */
  const fetchOdsuses = async () => {
    if (odsusOptions.value.length > 0) return null

    odsusOptionsIsLoading.value = true
    const { data } = await useApiCall('/odsus/',authStore.authenticationToken).get().json()
    const res: ApiResponseBody = data.value

    if (res.success) {
      odsusOptions.value = []
      const odsusListResponse = res.data as OdsuResponse[]
      odsusListResponse.forEach((odsu: OdsuResponse) => {
        odsusOptions.value.push({ value: odsu.id, label: odsu.name })
      })
    }

    odsusOptionsIsLoading.value = false

    return res
  }

  const fetchOdsus = async (roleFilter: string | number | null = null, limit: number = 10, page: number | null = null) => {
    let uri = `/odsus?limit=${limit}&sort=asc&`
    if (roleFilter) uri += `role=${roleFilter}&`
    if (page) uri += `page=${page}`

    
    const { data } = await useApiCall(uri, authStore.authenticationToken).get().json()
    const responseBody: ApiResponseBody = data.value

    if (responseBody.success) {
      const usersList = responseBody.data as OdsuResponse[]
      odsus.value = [...usersList]
    }

    return responseBody
  }

  const searchOdsus = async (query: string | null) => {
    let uri = '/odsus/search?'
    if (query) uri += `query=${query}`

    const { data } = await useApiCall(uri, authStore.authenticationToken).get().json()
    const responseBody: ApiResponseBody = data.value

    if (responseBody.success) {
      const usersList = responseBody.data as OdsuResponse[]
      odsus.value = [...usersList]
    }

    return responseBody
  }

  const createOdsu = async (odsu: Partial<OdsuPayload>, roleFilter: string | number | null = null) => {
    const { data } = await useApiCall('/odsus/', authStore.authenticationToken).post(odsu).json()
    const responseBody: ApiResponseBody = data.value

    if (responseBody.success) {
      // check if the update is still within the role filters param
      if (odsu.roles?.length && (roleFilter === null || (roleFilter && odsu.roles.includes(roleFilter)))) {
        odsus.value.unshift(responseBody.data as OdsuResponse)
      }
    }

    return responseBody
  }

  const updateOdsu = async (odsu: Partial<OdsuPayload>, id: string | number, roleFilter: string | number | null = null) => {

    const { data } = await useApiCall(`/odsus/${id}`, authStore.authenticationToken).patch(odsu).json()
    const responseBody: ApiResponseBody = data.value

    if (responseBody.success) {
      const index = odsus.value.findIndex((odsu) => odsu.id === id)
      if (index === -1) return responseBody
      odsus.value[index] = responseBody.data as OdsuResponse

      // Check if the update is still within the role filters param
      if (odsu.roles?.length && roleFilter !== null && !odsu.roles.includes(roleFilter)) {
        odsus.value.splice(index, 1)
      }
    }

    return responseBody
  }
  const deleteOdsu = async (id: string | number) => {
    const { data, statusCode } = await useApiCall(`/odsus/${id}`, authStore.authenticationToken).delete().json()

    if (statusCode.value === 204) {
      odsus.value = odsus.value.filter((odsu) => odsu.id !== id)
      return { success: true, message: 'Odsu deleted' }
    }

    return data.value as ApiResponseBody
  }


  return {
    odsus,
    odsusOptions,
    odsusOptionsIsLoading,
    fetchOdsuses,
    fetchOdsus,
    searchOdsus,
    createOdsu,
    updateOdsu,
    deleteOdsu
  }
})
