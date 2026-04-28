import { useCallback, useEffect, useState } from 'react'
import apiClient from '@/utils/axiosConfig'
import { toaster } from '@/components/ui/toaster'

const ADMIN_SESSION_MS = 30 * 60_000

const reportAdminError = (error) => {
  if (import.meta.env.DEV) {
    console.error(error)
  }
}

export function useAdminAuth({ onAuthenticated }) {
  const [isAuth, setIsAuth] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const clearAdminSession = useCallback(() => {
    sessionStorage.removeItem('isAdminAuthenticated')
    sessionStorage.removeItem('loginTime')
    sessionStorage.removeItem('adminToken')
    setIsAuth(false)
  }, [])

  useEffect(() => {
    const restore = async () => {
      const auth = sessionStorage.getItem('isAdminAuthenticated')
      const time = sessionStorage.getItem('loginTime')
      const token = sessionStorage.getItem('adminToken')

      if (auth && time && token && Date.now() - Number(time) < ADMIN_SESSION_MS) {
        try {
          await apiClient.get('/api/admin/verify', {
            headers: { Authorization: `Bearer ${token}` },
          })
          setIsAuth(true)
          onAuthenticated()
        } catch {
          clearAdminSession()
        }
      } else {
        clearAdminSession()
      }
    }

    restore()
  }, [clearAdminSession, onAuthenticated])

  useEffect(() => {
    if (!isAuth) return undefined

    const time = Number(sessionStorage.getItem('loginTime'))
    if (!time) {
      clearAdminSession()
      return undefined
    }

    const expiresAt = time + ADMIN_SESSION_MS
    const msUntilExpiry = expiresAt - Date.now()
    if (msUntilExpiry <= 0) {
      clearAdminSession()
      return undefined
    }

    const timeout = window.setTimeout(() => {
      clearAdminSession()
      toaster.create({
        title: 'Admin session expired',
        description: 'Please log in again before making changes.',
        type: 'warning',
        closable: true,
      })
    }, msUntilExpiry)

    return () => window.clearTimeout(timeout)
  }, [clearAdminSession, isAuth])

  const handleUnauthorized = useCallback((error) => {
    if (error?.response?.status !== 401) return false

    clearAdminSession()
    toaster.create({
      title: 'Admin session expired',
      description: 'Please log in again before making changes.',
      type: 'warning',
      closable: true,
    })
    return true
  }, [clearAdminSession])

  const handleLogin = useCallback(async () => {
    if (isLoggingIn) return
    if (!username.trim() || !password.trim()) {
      toaster.create({ title: 'Username and password required', type: 'error', closable: true })
      return
    }

    setIsLoggingIn(true)
    try {
      const { data } = await apiClient.post('/api/admin/login', {
        username: username.trim(),
        password,
      })
      if (!data?.token) throw new Error('Missing token')
      sessionStorage.setItem('isAdminAuthenticated', 'true')
      sessionStorage.setItem('loginTime', `${Date.now()}`)
      sessionStorage.setItem('adminToken', data.token)
      setIsAuth(true)
      onAuthenticated()
      setPassword('')
      setUsername('')
    } catch (error) {
      reportAdminError(error)
      toaster.create({ title: 'Wrong password', type: 'error', closable: true })
    } finally {
      setIsLoggingIn(false)
    }
  }, [isLoggingIn, onAuthenticated, password, username])

  return {
    isAuth,
    username,
    setUsername,
    password,
    setPassword,
    isLoggingIn,
    handleLogin,
    handleUnauthorized,
  }
}
