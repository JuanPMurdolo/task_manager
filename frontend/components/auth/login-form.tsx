"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckSquare, AlertCircle } from "lucide-react"

interface LoginFormProps {
  onLogin: (user: any) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [success, setSuccess] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

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
        localStorage.setItem("user", JSON.stringify(data.user))
        onLogin(data.user)
      } else {
        const errorData = await response.json()
        setErrors({ form: errorData.detail || "Login failed" })
      }
    } catch (error) {
      setErrors({ form: "Network error. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    setSuccess("")

    const validationErrors: { [key: string]: string } = {}
    if (!registerData.username) {
      validationErrors.username = "Username is required."
    }
    if (!registerData.email) {
      validationErrors.email = "Email is required."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      validationErrors.email = "Please enter a valid email address."
    }
    if (!registerData.password) {
      validationErrors.password = "Password is required."
    } else if (registerData.password.length < 6) {
      validationErrors.password = "Password must be at least 6 characters."
    }
    if (registerData.password !== registerData.confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match."
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          full_name: registerData.full_name,
          password: registerData.password,
        }),
      })

      if (response.ok) {
        setSuccess("Registration successful! Please login with your credentials.")
        setRegisterData({
          username: "",
          email: "",
          full_name: "",
          password: "",
          confirmPassword: "",
        })
      } else {
        const errorData = await response.json()
        const apiErrors: { [key: string]: string } = {}

        if (response.status === 422 && errorData.detail && Array.isArray(errorData.detail)) {
          errorData.detail.forEach((err: any) => {
            if (err.loc && err.loc.length > 1 && typeof err.msg === "string") {
              const field = err.loc[1]
              apiErrors[field] = err.msg
            }
          })
          setErrors(apiErrors)
        } else if (errorData.detail && typeof errorData.detail === "string") {
          setErrors({ form: errorData.detail })
        } else {
          setErrors({ form: "An unknown registration error occurred." })
        }
      }
    } catch (error) {
      setErrors({ form: "Network error. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (form: "login" | "register", field: string, value: string) => {
    if (form === "login") {
      setLoginData((prev) => ({ ...prev, [field]: value }))
    } else {
      setRegisterData((prev) => ({ ...prev, [field]: value }))
    }
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <CheckSquare className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold">
              <span className="neon-green">TASK</span> MANAGER
            </h1>
          </div>
          <p className="text-gray-400">Manage your tasks efficiently</p>
        </div>

        <Card className="card-gradient border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Welcome</CardTitle>
            <CardDescription className="text-gray-400">Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5">
                <TabsTrigger value="login" className="text-white data-[state=active]:bg-primary">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="text-white data-[state=active]:bg-primary">
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      value={loginData.username}
                      onChange={(e) => handleInputChange("login", "username", e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => handleInputChange("login", "password", e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full neon-green-bg text-black font-semibold hover:bg-primary/90 glow-effect"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-username" className="text-white">
                      Username
                    </Label>
                    <Input
                      id="reg-username"
                      type="text"
                      value={registerData.username}
                      onChange={(e) => handleInputChange("register", "username", e.target.value)}
                      className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 ${
                        errors.username ? "border-red-500" : ""
                      }`}
                      placeholder="Choose a username"
                      required
                      aria-invalid={!!errors.username}
                    />
                    {errors.username && <p className="text-sm text-red-400 mt-1">{errors.username}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => handleInputChange("register", "email", e.target.value)}
                      className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 ${
                        errors.email ? "border-red-500" : ""
                      }`}
                      placeholder="Enter your email"
                      required
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full-name" className="text-white">
                      Full Name
                    </Label>
                    <Input
                      id="full-name"
                      type="text"
                      value={registerData.full_name}
                      onChange={(e) => handleInputChange("register", "full_name", e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-white">
                      Password
                    </Label>
                    <Input
                      id="reg-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => handleInputChange("register", "password", e.target.value)}
                      className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 ${
                        errors.password ? "border-red-500" : ""
                      }`}
                      placeholder="Create a password"
                      required
                      aria-invalid={!!errors.password}
                    />
                    {errors.password && <p className="text-sm text-red-400 mt-1">{errors.password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-white">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => handleInputChange("register", "confirmPassword", e.target.value)}
                      className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 ${
                        errors.confirmPassword ? "border-red-500" : ""
                      }`}
                      placeholder="Confirm your password"
                      required
                      aria-invalid={!!errors.confirmPassword}
                    />
                    {errors.confirmPassword && <p className="text-sm text-red-400 mt-1">{errors.confirmPassword}</p>}
                  </div>
                  <Button
                    type="submit"
                    className="w-full neon-green-bg text-black font-semibold hover:bg-primary/90 glow-effect"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {errors.form && (
              <Alert className="mt-4 border-red-500/30 bg-red-500/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-400">{errors.form}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4 border-green-500/30 bg-green-500/10">
                <CheckSquare className="h-4 w-4" />
                <AlertDescription className="text-green-400">{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
