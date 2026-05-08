export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  total?: number
}

export interface PageResponse<T = any> {
  list: T[]
  total: number
}

export type ApiPageResponse<T = any> = ApiResponse<PageResponse<T>>

export interface BaseEntity {
  id: number
  createdAt?: string
  updatedAt?: string
}

export const SUCCESS_CODE = 200

export const isSuccess = <T = any>(response: ApiResponse<T>): boolean => {
  return response.code === SUCCESS_CODE
}
