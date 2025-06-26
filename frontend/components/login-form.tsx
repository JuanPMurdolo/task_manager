"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckSquare, LogIn, UserPlus, AlertCircle } from "lucide-react"

interface LoginFormProps {
  onLogin: () => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("username", loginData.username)
      formData.append("password", loginData.password)

      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("token", data.access_token)

        // Fetch user info and store it
        const userResponse = await fetch("http://localhost:8000/auth/me", {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          localStorage.setItem("user", JSON.stringify(userData))
        }

        onLogin()
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Login failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      })

      if (response.ok) {
        // Auto-login after successful registration
        setLoginData({
          username: registerData.username,
          password: registerData.password,
        })

        // Trigger login
        const formData = new FormData()
        formData.append("username", registerData.username)
        formData.append("password", registerData.password)

        const loginResponse = await fetch("http://localhost:8000/auth/login", {
          method: "POST",
          body: formData,
        })

        if (loginResponse.ok) {
          const data = await loginResponse.json()
          localStorage.setItem("token", data.access_token)

          // Fetch user info and store it
          const userResponse = await fetch("http://localhost:8000/auth/me", {
            headers: {
              Authorization: `Bearer ${data.access_token}`,
            },
          })

          if (userResponse.ok) {
            const userData = await userResponse.json()
            localStorage.setItem("user", JSON.stringify(userData))
          }

          onLogin()
        }
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Registration failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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

      <Card className="w-full max-w-md card-gradient border-white/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <CheckSquare className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">
              <span className="neon-green">TASK</span> MANAGER
            </h1>
          </div>
          <CardTitle className="text-white">Welcome</CardTitle>
          <CardDescription className="text-gray-400">Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/10">
              <TabsTrigger
                value="login"
                className="text-white data-[state=active]:bg-primary data-[state=active]:text-black"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="text-white data-[state=active]:bg-primary data-[state=active]:text-black"
              >
                Register
              </TabsTrigger>
            </TabsList>

            {error && (
              <Alert className="mt-4 border-red-500/50 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username" className="text-gray-300">
                    Username
                  </Label>
                  <Input
                    id="login-username"
                    type="text"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-primary"
                    placeholder="Enter your username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-gray-300">
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-primary"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full neon-green-bg text-black font-semibold hover:bg-primary/90 glow-effect"
                  disabled={isLoading}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username" className="text-gray-300">
                    Username
                  </Label>
                  <Input
                    id="register-username"
                    type="text"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-primary"
                    placeholder="Choose a username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-primary"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-fullname" className="text-gray-300">
                    Full Name
                  </Label>
                  <Input
                    id="register-fullname"
                    type="text"
                    value={registerData.full_name}
                    onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-primary"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-gray-300">
                    Password
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-primary"
                    placeholder="Create a password"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full neon-green-bg text-black font-semibold hover:bg-primary/90 glow-effect"
                  disabled={isLoading}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
