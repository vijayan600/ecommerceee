import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function UserRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!user) return <Navigate to="/login" replace />

  // Allow both user and admin to access user routes (e.g. /profile)
  return <>{children}</>
}

export function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!user) return <Navigate to="/login" replace />

  if (user.role !== 'admin') return <Navigate to="/" replace />

  return <>{children}</>
}

export function OwnerRoute({ children }) {
  const { isOwnerLoggedIn } = useAuth()

  if (!isOwnerLoggedIn) return <Navigate to="/owner-login" replace />

  return <>{children}</>
}