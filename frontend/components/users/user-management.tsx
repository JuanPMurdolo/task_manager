"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserForm } from "@/components/users/user-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Edit, Trash2, Shield, Mail, AlertCircle, CheckCircle } from 'lucide-react'

interface User {
  id: number
  username: string
  email: string
  full_name: string
  type: string
  is_active?: boolean
}

interface UserManagementProps {
  users: User[]
  currentUser: User | null
  onUserCreated: (user: User) => void
  onUserUpdated: (user: User) => void
  onUserDeleted: (userId: number) => void
}

export function UserManagement({
  users,
  currentUser,
  onUserCreated,
  onUserUpdated,
  onUserDeleted,
}: UserManagementProps) {
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleCreateUser = () => {
    setEditingUser(null)
    setShowUserForm(true)
    setError("")
    setSuccess("")
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowUserForm(true)
    setError("")
    setSuccess("")
  }

  const handleDeleteUser = async (userId: number) => {
    if (userId === currentUser?.id) {
      setError("You cannot delete your own account")
      return
    }

    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8000/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        onUserDeleted(userId)
        setSuccess("User deleted successfully")
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Failed to delete user")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserFormSubmit = (user: User) => {
    if (editingUser) {
      onUserUpdated(user)
      setSuccess("User updated successfully")
    } else {
      onUserCreated(user)
      setSuccess("User created successfully")
    }
    setShowUserForm(false)
    setEditingUser(null)
  }

  const handleUserFormError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const getInitials = (name: string, username: string) => {
    if (name && name.trim()) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return username.slice(0, 2).toUpperCase()
  }

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case "admin":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "user":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-gray-400">Manage system users and their permissions</p>
        </div>
        <Button
          onClick={handleCreateUser}
          className="neon-green-bg text-black font-semibold hover:bg-primary/90 glow-effect"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="border-red-500/30 bg-red-500/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500/30 bg-green-500/10">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-400">{success}</AlertDescription>
        </Alert>
      )}

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-gradient border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
            <Mail className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{users.length}</div>
          </CardContent>
        </Card>

        <Card className="card-gradient border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {users.filter((user) => user.type === "admin").length}
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Regular Users</CardTitle>
            <Mail className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {users.filter((user) => user.type === "user").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id} className="card-gradient border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {getInitials(user.full_name, user.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-medium truncate">{user.full_name || user.username}</h3>
                    {user.id === currentUser?.id && (
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                        You
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm truncate">@{user.username}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Mail className="h-3 w-3" />
                <span className="truncate">{user.email}</span>
              </div>

              <div className="flex items-center justify-between">
                <Badge className={getUserTypeColor(user.type)}>
                  {user.type === "admin" ? (
                    <>
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </>
                  ) : (
                    <>
                      <Mail className="h-3 w-3 mr-1" />
                      User
                    </>
                  )}
                </Badge>

                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  {user.id !== currentUser?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={isLoading}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card className="card-gradient border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
            <p className="text-gray-400 text-center mb-4">Get started by creating your first user account.</p>
            <Button
              onClick={handleCreateUser}
              className="neon-green-bg text-black font-semibold hover:bg-primary/90 glow-effect"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add First User
            </Button>
          </CardContent>
        </Card>
      )}

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          user={editingUser}
          onUserCreated={handleUserFormSubmit}
          onUserUpdated={handleUserFormSubmit}
          onClose={() => {
            setShowUserForm(false)
            setEditingUser(null)
          }}
        />
      )}
    </div>
  )
}
