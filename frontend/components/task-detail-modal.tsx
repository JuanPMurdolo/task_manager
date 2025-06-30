"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { X, Edit, Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { TaskComments } from "@/components/task-comments"

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

interface TaskDetailModalProps {
  task: Task
  users: any[]
  currentUser: any | null
  onClose: () => void
  onEditTask: (task: Task) => void
  onTaskUpdated: (task: Task) => void
  onTaskDeleted: (taskId: number) => void
}

export function TaskDetailModal({
  task,
  users,
  currentUser,
  onClose,
  onEditTask,
  onTaskUpdated,
  onTaskDeleted,
}: TaskDetailModalProps) {
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
        return <CheckCircle2 className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "pending":
        return <AlertCircle className="h-4 w-4" />
      case "hold":
        return <Clock className="h-4 w-4" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getAssignedUser = (username: string | null) => {
    if (!username) return null
    return users.find((user: any) => user.username === username)
  }

  const getInitials = (name: string | null, username: string) => {
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

  const assignedUser = getAssignedUser(task.assigned_to)
  const createdByUser = getAssignedUser(task.created_by)
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed"

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <Card
        className="card-gradient border-white/10 w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 border-b border-white/10">
          <div>
            <CardTitle className="text-white text-2xl">{task.title}</CardTitle>
            <div className="flex items-center space-x-4 mt-2">
              <Badge className={getStatusColor(task.status)}>
                {getStatusIcon(task.status)}
                <span className="ml-2 capitalize">{task.status.replace("_", " ")}</span>
              </Badge>
              <Badge className={getPriorityColor(task.priority)}>
                <span className="capitalize">{task.priority} Priority</span>
              </Badge>
              {isOverdue && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditTask(task)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onTaskDeleted(task.id)
                onClose()
              }}
              className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">Description</h4>
              <p className="text-gray-400 whitespace-pre-wrap">{task.description || "No description provided."}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">Comments</h4>
              <TaskComments taskId={task.id} currentUser={currentUser} users={users} />
            </div>
          </div>
          <div className="md:col-span-1 space-y-4">
            <Card className="card-gradient border-white/10 p-4">
              <h4 className="font-semibold text-gray-300 mb-3">Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Assignee</span>
                  {assignedUser ? (
                    <div className="flex items-center space-x-2 text-white">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {getInitials(assignedUser.full_name, assignedUser.username)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{assignedUser.full_name || assignedUser.username}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Unassigned</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Due Date</span>
                  <span className={`text-white ${isOverdue ? "text-red-400" : ""}`}>{formatDate(task.due_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created By</span>
                  {createdByUser ? (
                    <div className="flex items-center space-x-2 text-white">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="bg-gray-700 text-gray-300 text-xs">
                          {getInitials(createdByUser.full_name, createdByUser.username)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{createdByUser.full_name || createdByUser.username}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">{task.created_by}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created At</span>
                  <span className="text-white">{formatDate(task.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Updated</span>
                  <span className="text-white">{formatDate(task.updated_at)}</span>
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
