"use client"

import { useState, useEffect } from "react"
import { AdminLoginForm } from "@/components/auth/AdminLoginForm"
import { isAdminAuthenticated } from "@/lib/auth"
import { AdminDashboard } from "@/components/admin/AdminDashboard"

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    // Проверяем авторизацию при загрузке
    const authStatus = isAdminAuthenticated()
    setAuthenticated(authStatus)
    setCheckingAuth(false)
  }, [])

  const handleLoginSuccess = () => {
    setAuthenticated(true)
  }

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!authenticated) {
    return <AdminLoginForm onSuccess={handleLoginSuccess} />
  }

  return <AdminDashboard />
}

