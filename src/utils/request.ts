import axios from 'axios'
import { ElMessage } from 'element-plus'
import type { AxiosRequestConfig } from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 5000
})

// Custom request method that returns response.data directly
const customRequest = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  return request(config).then((response) => response as T)
}

// Add HTTP method shortcuts
customRequest.get = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return request.get<T>(url, config).then((response) => response as T)
}
customRequest.post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return request.post<T>(url, data, config).then((response) => response as T)
}
customRequest.put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return request.put<T>(url, data, config).then((response) => response as T)
}
customRequest.delete = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return request.delete<T>(url, config).then((response) => response as T)
}

// Request interceptor
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElMessage.error('Unauthorized, please login again')
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('Access forbidden')
          break
        case 500:
          ElMessage.error('Server error')
          break
        default:
          ElMessage.error(error.response.data?.message || 'Request failed')
      }
    }
    return Promise.reject(error)
  }
)

export default customRequest
