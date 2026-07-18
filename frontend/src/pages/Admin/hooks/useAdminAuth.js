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
  const [mfaChallengeToken, setMfaChallengeToken] = useState('')
  const [mfaCode, setMfaCode] = useState('')

  const storeAdminSession = useCallback((data) => {
    if (!data?.token) throw new Error('Missing token')
    sessionStorage.setItem('isAdminAuthenticated', 'true')
    sessionStorage.setItem('loginTime', `${Date.now()}`)
    sessionStorage.setItem('adminToken', data.token)
    sessionStorage.setItem('adminExpiresAt', `${Number(data.expiresAt) || (Date.now() + ADMIN_SESSION_MS)}`)
    setIsAuth(true)
    setMfaChallengeToken('')
    setMfaCode('')
    onAuthenticated()
  }, [onAuthenticated])

  const clearAdminSession = useCallback(() => {
    sessionStorage.removeItem('isAdminAuthenticated')
    sessionStorage.removeItem('loginTime')
    sessionStorage.removeItem('adminExpiresAt')
    sessionStorage.removeItem('adminToken')
    setMfaChallengeToken('')
    setMfaCode('')
    setIsAuth(false)
  }, [])

  useEffect(() => {
    const restore = async () => {
      const auth = sessionStorage.getItem('isAdminAuthenticated')
      const time = sessionStorage.getItem('loginTime')
      const token = sessionStorage.getItem('adminToken')
      const expiresAt = Number(sessionStorage.getItem('adminExpiresAt')) || (Number(time) + ADMIN_SESSION_MS)

      if (auth && time && token && Date.now() < expiresAt) {
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

    const expiresAt = Number(sessionStorage.getItem('adminExpiresAt')) || (time + ADMIN_SESSION_MS)
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
      if (data?.mfaRequired && data?.challengeToken) {
        setMfaChallengeToken(data.challengeToken)
        setPassword('')
        return
      }
      storeAdminSession(data)
      setPassword('')
      setUsername('')
    } catch (error) {
      reportAdminError(error)
      toaster.create({ title: 'Unable to sign in', description: 'Check your credentials and try again.', type: 'error', closable: true })
    } finally {
      setIsLoggingIn(false)
    }
  }, [isLoggingIn, password, storeAdminSession, username])

  const handleMfaLogin = useCallback(async () => {
    if (isLoggingIn || !mfaChallengeToken) return
    if (!mfaCode.trim()) {
      toaster.create({ title: 'Verification code required', type: 'error', closable: true })
      return
    }
    setIsLoggingIn(true)
    try {
      const { data } = await apiClient.post('/api/admin/login/mfa', {
        challengeToken: mfaChallengeToken,
        code: mfaCode.trim(),
      })
      storeAdminSession(data)
      setUsername('')
    } catch (error) {
      reportAdminError(error)
      toaster.create({ title: 'Invalid or expired verification code', type: 'error', closable: true })
    } finally {
      setIsLoggingIn(false)
    }
  }, [isLoggingIn, mfaChallengeToken, mfaCode, storeAdminSession])

  return {
    isAuth,
    username,
    setUsername,
    password,
    setPassword,
    isLoggingIn,
    mfaRequired: Boolean(mfaChallengeToken),
    mfaCode,
    setMfaCode,
    handleLogin,
    handleMfaLogin,
    cancelMfaLogin: () => {
      setMfaChallengeToken('')
      setMfaCode('')
    },
    handleUnauthorized,
    logout: clearAdminSession,
  }
}
