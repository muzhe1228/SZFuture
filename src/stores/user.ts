import { defineStore } from 'pinia'
import { ref } from 'vue'

interface UserInfo {
  userName: string
  avatar: string
  role: string
  lastLoginTime: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const storedUserInfo = localStorage.getItem('userInfo')
  const userInfo = ref<UserInfo | null>(storedUserInfo ? JSON.parse(storedUserInfo) : null)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUserInfo(info: Omit<UserInfo, 'lastLoginTime'>) {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19)
    console.log(now)
    console.log(info)
    userInfo.value = {
      ...info,
      lastLoginTime: now,
    }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    logout,
  }
})
