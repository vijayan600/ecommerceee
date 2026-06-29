import React, { createContext, useContext, useState, useEffect } from 'react'
import { loginUser as apiLoginUser } from '../api/services.js'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

// Owner credentials (hardcoded demo)
const OWNER_CREDENTIALS = {
  username: 'suguna_admin',
  password: 'suguna@2026',
}

export const AuthProvider = ({ children }) => {
  // Owner (store simple flag)
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState(() => {
    return localStorage.getItem('suguna_owner_auth') === 'true'
  })

  // User auth state
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      if (savedToken) setToken(savedToken)
      if (savedUser) setUser(JSON.parse(savedUser))
    } catch (e) {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }, [])

  // Owner functions
  const ownerLogin = (username, password) => {
    if (
      username === OWNER_CREDENTIALS.username &&
      password === OWNER_CREDENTIALS.password
    ) {
      setIsOwnerLoggedIn(true)
      localStorage.setItem('suguna_owner_auth', 'true')
      return { success: true }
    }
    return { success: false, message: 'Invalid username or password' }
  }

  const ownerLogout = () => {
    setIsOwnerLoggedIn(false)
    localStorage.removeItem('suguna_owner_auth')
  }

  // User functions
  async function login(email, password) {
    try {
      const res = await apiLoginUser(email, password)
      const t = res.token
      const u = res.user
      if (!t) throw 'No token returned from server'
      localStorage.setItem('token', t)
      localStorage.setItem('user', JSON.stringify(u))
      setToken(t)
      setUser(u)
      if (u?.role === 'admin') return 'admin'
      return 'user'
    } catch (err) {
      throw typeof err === 'string' ? err : err?.message || err
    }
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    window.location.href = '/login'
  }

  function isAdmin() {
    return user?.role === 'admin'
  }

  function isUser() {
    return user?.role === 'user'
  }

  return (
    <AuthContext.Provider
      value={{
        // owner
        isOwnerLoggedIn,
        ownerLogin,
        ownerLogout,
        // user
        user,
        token,
        loading,
        login,
        logout,
        isAdmin,
        isUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
