"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Shield, Eye, EyeOff, Mail, AlertCircle } from "lucide-react"
import { SafeErrorDisplay } from "@/utils/safe-error-display"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  onClose: () => void
}

export function UserForm({ user, onUserCreated, onUserUpdated, onClose }: UserFormProps) {
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
  const [errors, setErrors] = useState<{ [key: string]: any }>({})
  const [formError, setFormError] = useState<any>(null)

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

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    if (formError) {
      setFormError(null)
    }
  }

  const validate = () => {
    const validationErrors: { [key: string]: string } = {}

    if (!formData.username.trim()) {
      validationErrors.username = "Username is required."
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.email = "Please enter a valid email address."
    }

    // Password validation logic
    if (!user) {
      // Case 1: Creating a new user
      if (!formData.password) {
        validationErrors.password = "Password is required."
      } else if (formData.password.length < 6) {
        validationErrors.password = "Password must be at least 6 characters."
      }
      if (formData.password !== formData.confirmPassword) {
        validationErrors.confirmPassword = "Passwords do not match."
      }
    } 

    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!validate()) {
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const url = user ? `http://localhost:8000/users/${user.id}` : "http://localhost:8000/users/"
      const method = user ? "PUT" : "POST"

      const requestBody: any = {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
        type: formData.type,
      }
      // Only include password if it's a new user or if a new password has been entered for an existing user
      if (!user || formData.password) {
        requestBody.password = formData.password
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(requestBody),
      })

      const responseData = await response.json()

      if (response.ok) {
        if (user) onUserUpdated(responseData)
        else onUserCreated(responseData)
        onClose()
      } else {
        if (response.status === 422 && responseData.detail && Array.isArray(responseData.detail)) {
          const apiErrors: { [key: string]: any } = {}
          responseData.detail.forEach((err: any) => {
            if (err.loc && err.loc.length > 1) {
              const field = err.loc[err.loc.length - 1]
              apiErrors[field] = err
            }
          })
          setErrors(apiErrors)
        } else {
          setFormError(responseData.detail || "An unknown error occurred.")
        }
      }
    } catch (error) {
      setFormError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10 ${
                    errors.username ? "border-red-500" : ""
                  }`}
                  placeholder="Enter username"
                  required
                />
              </div>
              <SafeErrorDisplay error={errors.username} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <SafeErrorDisplay error={errors.email} />
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
              <SafeErrorDisplay error={errors.full_name} />
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
                      <Mail className="h-4 w-4 mr-2" />
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
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10 ${
                        errors.password ? "border-red-500" : ""
                      }`}
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
                  <SafeErrorDisplay error={errors.password} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10 ${
                        errors.confirmPassword ? "border-red-500" : ""
                      }`}
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
                  <SafeErrorDisplay error={errors.confirmPassword} />
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
                    className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10 ${
                      errors.password ? "border-red-500" : ""
                    }`}
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
                <SafeErrorDisplay error={errors.password} />
              </div>
            )}

            {formError && (
              <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <SafeErrorDisplay error={formError} className="text-red-400" />
                </AlertDescription>
              </Alert>
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
