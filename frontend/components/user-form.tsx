"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Shield, Eye, EyeOff } from "lucide-react"

interface User {
  id: number
  username: string
  email: string
  full_name: string
  type: string
}

interface UserFormProps {
  user?: User | null
  onUserCreated: (user: User) => void
  onUserUpdated: (user: User) => void
  onError: (error: string) => void
  onClose: () => void
}

export function UserForm({ user, onUserCreated, onUserUpdated, onError, onClose }: UserFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
    confirmPassword: "",
    type: "user",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        full_name: user.full_name || "",
        password: "",
        confirmPassword: "",
        type: user.type,
      })
    }
  }, [user])

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsLoading(true)
      const newErrors: { [key: string]: string } = {}
      
      // Validaciones
      if (!user && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    
      if (!user && formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters long"
      }
    
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        setIsLoading(false)
        return
      }
    
      setErrors({}) // limpiar errores si pasa la validación

    try {
      const token = localStorage.getItem("token")
      const url = user ? `http://localhost:8000/users/${user.id}` : "http://localhost:8000/auth/register"
      const method = user ? "PUT" : "POST"

      const requestBody: any = {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        type: formData.type,
      }

      // Only include password for new users or when updating password
      if (!user || formData.password) {
        requestBody.password = formData.password
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const userData = await response.json()
        if (user) {
          onUserUpdated(userData)
        } else {
          onUserCreated(userData)
        }
        onClose()
      } else {
          const errorData = await response.json()
          const message = errorData.detail || `Failed to ${user ? "update" : "create"} user`
          if (message.includes("Email already registered")) {
            setErrors({ email: "This email is already in use" })
          } else if (message.includes("Username already registered")) {
            setErrors({ username: "This username is already in use" })
          } else {
            onError(message)
          }
        }
    } catch (error) {
      onError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="card-gradient border-white/10 w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-white">{user ? "Edit User" : "Create New User"}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
           <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                {errors.username && <p className="text-red-500 text-sm -mt-1">{errors.username}</p>}
                <div className="relative">
                  <X className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <div className="relative">
                <X className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    handleInputChange("email", e.target.value)
                    setErrors(prev => ({ ...prev, email: "" })) // Limpia error al escribir
                  }}
                  className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  placeholder="Enter email address"
                  required
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-white">
                Full Name
              </Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                placeholder="Enter full name (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-white">
                User Type
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="Select user type" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20">
                  <SelectItem value="user" className="text-white hover:bg-white/10">
                    <div className="flex items-center">
                      <X className="h-4 w-4 mr-2" />
                      Regular User
                    </div>
                  </SelectItem>
                  <SelectItem value="admin" className="text-white hover:bg-white/10">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Administrator
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!user && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  {errors.password && <p className="text-red-500 text-sm -mt-1">{errors.password}</p>}
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                      placeholder="Enter password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>


                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">
                    Confirm Password
                  </Label>
                  {errors.confirmPassword && <p className="text-red-500 text-sm -mt-1">{errors.confirmPassword}</p>}
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                      placeholder="Confirm password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {user && (
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white">
                  New Password (optional)
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                    placeholder="Leave blank to keep current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 neon-green-bg text-black font-semibold hover:bg-primary/90 glow-effect"
              >
                {isLoading ? "Saving..." : user ? "Update User" : "Create User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
