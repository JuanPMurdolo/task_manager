"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Edit, Trash2, Calendar, Clock, AlertCircle, CheckCircle2, User } from "lucide-react"

interface Task {
  id: number
  title: string
  description: string
  status: "pending" | "hold" | "in_progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  due_date: string | null
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
  assigned_to: string | null
}

interface TaskListProps {
  tasks: Task[]
  users: any[]
  currentUser: any | null
  onTaskUpdated: (task: Task) => void
  onTaskDeleted: (taskId: number) => void
  onEditTask: (task: Task) => void
  onViewTask: (task: Task) => void
}

export function TaskList({
  tasks,
  users,
  currentUser,
  onTaskUpdated,
  onTaskDeleted,
  onEditTask,
  onViewTask,
}: TaskListProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async (task: Task, newStatus: string) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8000/tasks/${task.id}/status?status=${newStatus}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const updatedTask = await response.json()
        onTaskUpdated(updatedTask)
      } else {
        const errorData = await response.json()
        console.error("Error updating status:", errorData)
      }
    } catch (error) {
      console.error("Failed to update task status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8000/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        onTaskDeleted(taskId)
      }
    } catch (error) {
      console.error("Failed to delete task:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "in_progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "hold":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "cancelled":
        return "bg-red-500/20 text-gray-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-3 w-3" />
      case "in_progress":
        return <Clock className="h-3 w-3" />
      case "pending":
        return <AlertCircle className="h-3 w-3" />
      case "hold":
        return <Clock className="h-3 w-3" /> // o PauseCircle si usás otro ícono
      case "cancelled":
        return <AlertCircle className="h-3 w-3" /> // o XCircle si tenés instalado
      default:
        return <AlertCircle className="h-3 w-3" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getAssignedUser = (username: string | null) => {
    if (!username) return null
    return users.find((user: any) => user.username === username)
  }

  const getInitials = (name: string, username: string) => {
    if (name && name.trim()) {
      return name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return username.slice(0, 2).toUpperCase()
  }

  if (tasks.length === 0) {
    return (
      <Card className="card-gradient border-white/10">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No tasks found</h3>
          <p className="text-gray-400 text-center">
            No tasks match your current filters. Try adjusting your search criteria.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const assignedUser = getAssignedUser(task.assigned_to)
        const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed"

        return (
          <Card
            key={task.id}
            className="card-gradient border-white/10 hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => onViewTask(task)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-white text-lg mb-2 truncate">{task.title}</CardTitle>
                  <p className="text-gray-400 text-sm line-clamp-2">{task.description}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditTask(task)
                    }}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteTask(task.id)
                    }}
                    disabled={isLoading}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status and Priority */}
              <div className="flex items-center space-x-3">
                <Badge className={getStatusColor(task.status)}>
                  {getStatusIcon(task.status)}
                  <span className="ml-1 capitalize">{task.status.replace("_", " ")}</span>
                </Badge>
                <Badge className={getPriorityColor(task.priority)}>
                  <span className="capitalize">{task.priority}</span>
                </Badge>
                {isOverdue && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>

              {/* Assignment and Due Date */}
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-4">
                  {assignedUser ? (
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {getInitials(assignedUser.full_name, assignedUser.username)}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {assignedUser.full_name || assignedUser.username}
                        {assignedUser.username === currentUser?.username && " (You)"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Unassigned</span>
                    </div>
                  )}
                </div>

                {task.due_date && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span className={isOverdue ? "text-red-400" : ""}>{formatDate(task.due_date)}</span>
                  </div>
                )}
              </div>

              {/* Quick Status Actions */}
              <div className="flex items-center space-x-2 pt-2">
                <span className="text-xs text-gray-400">Quick actions:</span>
                {["pending", "hold", "in_progress", "completed", "cancelled"]
                  .filter((s) => s !== task.status)
                  .map((status) => (
                    <Button
                      key={status}
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStatusChange(task, status)
                      }}
                      disabled={isLoading}
                      className={`h-6 px-2 text-xs ${
                        status === "pending"
                          ? "border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                          : status === "hold"
                            ? "border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                            : status === "in_progress"
                              ? "border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                              : status === "completed"
                                ? "border-green-500/30 text-green-400 hover:bg-green-500/10"
                                : "border-gray-500/30 text-gray-400 hover:bg-gray-500/10"
                      }`}
                    >
                      {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Button>
                  ))}
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-white/10">
                <span>Created: {formatDate(task.created_at)}</span>
                <span>Updated: {formatDate(task.updated_at)}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
