"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { TaskDashboard } from "@/components/task-dashboard"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-20 h-20 bg-primary/10 rounded-full floating"></div>
        <div
          className="absolute top-40 right-32 w-16 h-16 bg-purple-500/10 rounded-full floating"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/4 w-24 h-24 bg-blue-500/10 rounded-full floating"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute bottom-20 right-20 w-18 h-18 bg-primary/10 rounded-full floating"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {!isAuthenticated ? <LoginForm onLogin={handleLogin} /> : <TaskDashboard onLogout={handleLogout} />}
    </div>
  )
}
