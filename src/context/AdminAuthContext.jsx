import { createContext, useContext, useState, useCallback } from 'react'
import { adminApi } from '../services/api.js'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try {
      const stored = sessionStorage.getItem('admin_session')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = useCallback(async (username, password) => {
    const data = await adminApi.login(username, password)
    const session = { username: data.username, role: data.role }
    sessionStorage.setItem('admin_session', JSON.stringify(session))
    setAdmin(session)
    return session
  }, [])

  const logout = useCallback(async () => {
    try {
      await adminApi.logout()
    } finally {
      sessionStorage.removeItem('admin_session')
      setAdmin(null)
    }
  }, [])

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
