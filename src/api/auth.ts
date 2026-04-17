import request from '@/utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  userInfo: {
    username: string
    avatar: string
    role: string
  }
}

export const loginApi = (data: LoginParams) => {
  return request<LoginResult>({
    url: '/auth/login',
    method: 'post',
    data
  })
}

export const logoutApi = () => {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

export const getUserInfo = () => {
  return request({
    url: '/auth/user-info',
    method: 'get'
  })
}
