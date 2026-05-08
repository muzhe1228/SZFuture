import axios, { AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

interface RetryConfig {
  maxRetries?: number
  retryDelay?: number
  retryOnStatusCodes?: number[]
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryOnStatusCodes: [429, 500, 502, 503, 504],
}

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 5000,
})

const shouldRetry = (error: AxiosError, retryConfig: RetryConfig): boolean => {
  if (error.response) {
    const { status } = error.response
    return retryConfig.retryOnStatusCodes?.includes(status) ?? false
  }
  return !!error.code && ['ECONNABORTED', 'ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND', 'ENETUNREACH'].includes(error.code)
}

const getRetryDelay = (retryCount: number, retryDelay: number): number => {
  return retryDelay * Math.pow(2, retryCount - 1)
}

const customRequest = async <T = any>(config: AxiosRequestConfig & { retryConfig?: RetryConfig }): Promise<T> => {
  const retryConfig = { ...defaultRetryConfig, ...config.retryConfig }
  let retries = 0

  const executeRequest = async (): Promise<AxiosResponse> => {
    try {
      return await request(config)
    } catch (error) {
      const axiosError = error as AxiosError

      if (retries < (retryConfig.maxRetries ?? 3) && shouldRetry(axiosError, retryConfig)) {
        retries++
        const delay = getRetryDelay(retries, retryConfig.retryDelay ?? 1000)

        await new Promise((resolve) => setTimeout(resolve, delay))

        return executeRequest()
      }

      throw error
    }
  }

  const response = await executeRequest()
  return response as T
}

customRequest.get = <T = any>(url: string, config?: AxiosRequestConfig & { retryConfig?: RetryConfig }): Promise<T> => {
  return customRequest({ method: 'get', url, ...config })
}

customRequest.post = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig & { retryConfig?: RetryConfig }
): Promise<T> => {
  return customRequest({ method: 'post', url, data, ...config })
}

customRequest.put = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig & { retryConfig?: RetryConfig }
): Promise<T> => {
  return customRequest({ method: 'put', url, data, ...config })
}

customRequest.delete = <T = any>(
  url: string,
  config?: AxiosRequestConfig & { retryConfig?: RetryConfig }
): Promise<T> => {
  return customRequest({ method: 'delete', url, ...config })
}

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
    } else if (error.code) {
      ElMessage.error(`Network error: ${error.code}`)
    }
    return Promise.reject(error)
  }
)

export default customRequest

export type { RetryConfig }
