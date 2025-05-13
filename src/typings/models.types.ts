import { ApiResponseData } from '@/typings/http-resources.types.ts'

/** Address (HTTP Responses) */
export type RegionResponse = {
  code_correspondence: string
  code: string
  name: string
  alt_name: string
  geo_level: string
} & ApiResponseData

export type ProvinceResponse = {
  code_correspondence: string
  code: string
  name: string
  alt_name: string
  geo_level: string
  region_id: number
  old_name?: string
  income_classification: string
} & ApiResponseData

export type CityResponse = {
  code_correspondence: string
  code: string
  name: string
  alt_name: string
  province_id: number
  old_name?: string
  income_classification: string
  classification: 'city' | 'municipality'
  city_class?: string
} & ApiResponseData

export type BarangayResponse = {
  code_correspondence: string
  city_id: number
  name: string
} & ApiResponseData

export type AddressResponse = {
  home_address: string | null
  postal_code: string | null
  barangay_id: string | number | null
  city_id: string | number | null
  province_id: string | number | null
  region_id: string | number | null
  barangay: BarangayResponse | null
  city: CityResponse | null
  province: ProvinceResponse | null
  region: RegionResponse | null
} & ApiResponseData

/** User (HTTP Responses) */
export type UserResponse = {
  email: string
  guid: string | null
  domain: string | null
  active: boolean
  email_verified_at: string
  roles: Array<{ id: string | number; name: string }>
  user_profile?: UserProfileResponse
} & ApiResponseData

export type UserProfileResponse = {
  first_name: string
  last_name: string
  middle_name: string | null
  ext_name: string | null
  mobile_number: string | null
  telephone_number: string | null
  sex: 'male' | 'female' | null
  birthday: string | null
  position: string | null
  full_name: string
  profile_picture_url: string | null
  address: AddressResponse
  odsu?:OdsuResponse
} & ApiResponseData

export type OdsuResponse = {
  uuid: string
  code: string
  name: string 
  head_user_id: string | null
  cluster_code: string | null
  parent_code: string | null
  directorate_code: string | null
  office_type: string | null
  added_by_user_id: string
  last_modified_by_user_id: string | null
  user_profile?: UserProfileResponse
} & ApiResponseData

/** Role (HTTP Responses) */
export type RoleResponse = {
  name: string
} & ApiResponseData

/** Settings (HTTPResponse) */
export type SettingsResponse = {
  name: string
  value: string
} & ApiResponseData
