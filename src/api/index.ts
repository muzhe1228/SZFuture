import request from '@/utils/request'
import type { ApiResponse, ApiPageResponse } from '@/types/api'

export interface Trial {
  id: number
  authNo: string
  licenseKey: string
  status: string
  companyName: string
  productName: string
  startTime: string
  endTime: string
  freezeTime?: string
  freezeReason?: string
  createdAt: string
  updatedAt: string
}

export interface Auth {
  id: number
  authNo: string
  licenseKey: string
  status: string
  companyName: string
  productName: string
  startTime: string
  endTime: string
  freezeTime?: string
  freezeReason?: string
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: number
  orderNo: string
  productName: string
  customerName: string
  amount: number
  status: string
  createdAt: string
}

export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  companyName: string
  createdAt: string
}

export interface User {
  id: number
  username: string
  name: string
  email: string
  role: string
  department: string
  status: string
  createdAt: string
}

export interface Role {
  id: number
  name: string
  description: string
  permissions: string[]
  createdAt: string
}

export interface Department {
  id: number
  name: string
  parentId: number
  createdAt: string
}

export interface Message {
  id: number
  title: string
  content: string
  type: string
  status: string
  createdAt: string
}

export interface Approval {
  id: number
  authNo: string
  type: string
  status: string
  applicant: string
  createdAt: string
}

export interface OperationLog {
  id: number
  operator: string
  operation: string
  description: string
  ip: string
  createdAt: string
}

export interface SystemLog {
  id: number
  level: string
  message: string
  module: string
  createdAt: string
}

export const trialApi = {
  list: async (params?: Record<string, any>): Promise<ApiPageResponse<Trial>> => {
    return request.get('/api/trial/list', { params })
  },
  activate: async (data: {
    id?: number | null
    licenseKey: string
    deviceFingerprint: string
  }): Promise<ApiResponse> => {
    return request.post('/api/trial/activate', data)
  },
  freeze: async (data: { ids: number[]; reason: string }): Promise<ApiResponse> => {
    return request.post('/api/trial/freeze', data)
  },
  unfreeze: async (data: { id?: number | null; reason: string }): Promise<ApiResponse> => {
    return request.post('/api/trial/unfreeze', data)
  },
  delete: async (data: { ids: number[] }): Promise<ApiResponse> => {
    return request.delete('/api/trial/delete', { data })
  },
  void: async (data: { ids: number[]; reason: string; approver: string }): Promise<ApiResponse> => {
    return request.post('/api/trial/void', data)
  },
}

export const authApi = {
  list: async (params?: Record<string, any>): Promise<ApiPageResponse<Auth>> => {
    return request.get('/api/auth/list', { params })
  },
  activate: async (data: {
    id?: number | null
    licenseKey: string
    deviceFingerprint: string
  }): Promise<ApiResponse> => {
    return request.post('/api/auth/activate', data)
  },
  freeze: async (data: { ids: number[]; reason: string }): Promise<ApiResponse> => {
    return request.post('/api/auth/freeze', data)
  },
  unfreeze: async (data: { id?: number | null; reason: string }): Promise<ApiResponse> => {
    return request.post('/api/auth/unfreeze', data)
  },
  extend: async (data: { id?: number | null; days: number; reason: string }): Promise<ApiResponse> => {
    return request.post('/api/auth/extend', data)
  },
  void: async (data: { ids: number[]; reason: string; approver: string }): Promise<ApiResponse> => {
    return request.post('/api/auth/void', data)
  },
  import: async (data: FormData): Promise<ApiResponse> => {
    return request.post('/api/auth/import', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const orderApi = {
  list: async (params?: Record<string, any>): Promise<ApiPageResponse<Order>> => {
    return request.get('/api/order/list', { params })
  },
  delete: async (data: { ids: number[] }): Promise<ApiResponse> => {
    return request.delete('/api/order/delete', { data })
  },
  create: async (data: Record<string, any>): Promise<ApiResponse> => {
    return request.post('/api/order/create', data)
  },
}

export const customerApi = {
  list: async (params?: Record<string, any>): Promise<ApiPageResponse<Customer>> => {
    return request.get('/api/customer/list', { params })
  },
  delete: async (data: { ids: number[] }): Promise<ApiResponse> => {
    return request.delete('/api/customer/delete', { data })
  },
}

export const userApi = {
  list: async (params?: Record<string, any>): Promise<ApiPageResponse<User>> => {
    return request.get('/api/user/list', { params })
  },
  create: async (data: Record<string, any>): Promise<ApiResponse> => {
    return request.post('/api/user/create', data)
  },
  update: async (data: Record<string, any>): Promise<ApiResponse> => {
    return request.put('/api/user/update', data)
  },
  delete: async (data: { ids: number[] }): Promise<ApiResponse> => {
    return request.delete('/api/user/delete', { data })
  },
}

export const roleApi = {
  list: async (params?: Record<string, any>): Promise<ApiPageResponse<Role>> => {
    return request.get('/api/role/list', { params })
  },
  create: async (data: Record<string, any>): Promise<ApiResponse> => {
    return request.post('/api/role/create', data)
  },
  update: async (data: Record<string, any>): Promise<ApiResponse> => {
    return request.put('/api/role/update', data)
  },
  delete: async (data: { ids: number[] }): Promise<ApiResponse> => {
    return request.delete('/api/role/delete', { data })
  },
}

export const departmentApi = {
  list: async (params?: Record<string, any>): Promise<ApiPageResponse<Department>> => {
    return request.get('/api/department/list', { params })
  },
  create: async (data: Record<string, any>): Promise<ApiResponse> => {
    return request.post('/api/department/create', data)
  },
  update: async (data: Record<string, any>): Promise<ApiResponse> => {
    return request.put('/api/department/update', data)
  },
  delete: async (data: { ids: number[] }): Promise<ApiResponse> => {
    return request.delete('/api/department/delete', { data })
  },
}

export const messageApi = {
  list: async (params?: Record<string, any>): Promise<ApiPageResponse<Message>> => {
    return request.get('/api/message/list', { params })
  },
  markAsRead: async (data: { ids: number[] }): Promise<ApiResponse> => {
    return request.post('/api/message/mark-read', data)
  },
  delete: async (data: { ids: number[] }): Promise<ApiResponse> => {
    return request.delete('/api/message/delete', { data })
  },
}

export const approvalApi = {
  list: async (params?: Record<string, any>): Promise<ApiPageResponse<Approval>> => {
    return request.get('/api/approval/list', { params })
  },
  approve: async (data: { id: number; comment?: string }): Promise<ApiResponse> => {
    return request.post('/api/approval/approve', data)
  },
  reject: async (data: { id: number; comment: string }): Promise<ApiResponse> => {
    return request.post('/api/approval/reject', data)
  },
}

export const logApi = {
  operation: {
    list: async (params?: Record<string, any>): Promise<ApiPageResponse<OperationLog>> => {
      return request.get('/api/log/operation/list', { params })
    },
  },
  system: {
    list: async (params?: Record<string, any>): Promise<ApiPageResponse<SystemLog>> => {
      return request.get('/api/log/system/list', { params })
    },
  },
}

export const productApi = {
  list: async (params?: Record<string, any>): Promise<ApiPageResponse<Record<string, any>>> => {
    return request.get('/api/product/list', { params })
  },
  licenseTemplate: {
    list: async (params?: Record<string, any>): Promise<ApiPageResponse<Record<string, any>>> => {
      return request.get('/api/license-template/list', { params })
    },
  },
}

export const authApiV2 = {
  login: async (data: { username: string; password: string }): Promise<ApiResponse<{ token: string; user: User }>> => {
    return request.post('/api/auth/login', data)
  },
  logout: async (): Promise<ApiResponse> => {
    return request.post('/api/auth/logout')
  },
  forgotPassword: async (data: { email: string }): Promise<ApiResponse> => {
    return request.post('/api/auth/forgot-password', data)
  },
  resetPassword: async (data: { token: string; newPassword: string }): Promise<ApiResponse> => {
    return request.post('/api/auth/reset-password', data)
  },
  changePassword: async (data: { oldPassword: string; newPassword: string }): Promise<ApiResponse> => {
    return request.post('/api/auth/change-password', data)
  },
}

export default {
  trial: trialApi,
  auth: authApi,
  order: orderApi,
  customer: customerApi,
  user: userApi,
  role: roleApi,
  department: departmentApi,
  message: messageApi,
  approval: approvalApi,
  log: logApi,
  product: productApi,
  authV2: authApiV2,
}
