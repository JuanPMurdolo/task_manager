"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Calendar, Clock } from "lucide-react"

interface Task {
  id: number
  title: string
  description: string
  status: "pending" | "in_progress" | "completed"
  priority: 1 | 2 | 3 | 4 | 5 
  due_date: string | null
  created_at: string
  updated_at: string
}

interface TaskListProps {
  tasks: Task[]
  onTaskUpdated: (task: Task) => void
  onTaskDeleted: (taskId: number) => void
  onEditTask: (task: Task) => void
}

export function TaskList({ tasks, onTaskUpdated, onTaskDeleted, onEditTask }: TaskListProps) {
  const [updatingTasks, setUpdatingTasks] = useState<Set<number>>(new Set())

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    setUpdatingTasks((prev) => new Set(prev).add(taskId))

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8000/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        onTaskUpdated(updatedTask)
      }
    } catch (error) {
      console.error("Failed to update task:", error)
    } finally {
      setUpdatingTasks((prev) => {
        const newSet = new Set(prev)
        newSet.delete(taskId)
        return newSet
      })
    }
  }

  const deleteTask = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return

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
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (tasks.length === 0) {
    return (
      <Card className="card-gradient border-white/10">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-400 text-lg">No tasks found</p>
          <p className="text-gray-500 text-sm">Create your first task to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="card-gradient border-white/10 hover:border-primary/30 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg text-white mb-2">{task.title}</CardTitle>
                <p className="text-gray-300 text-sm">{task.description}</p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditTask(task)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteTask(task.id)}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Status:</span>
                <Select
                  value={task.status}
                  onValueChange={(value) => updateTaskStatus(task.id, value)}
                  disabled={updatingTasks.has(task.id)}
                >
                  <SelectTrigger className="w-32 h-8 bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
              <Badge className={getStatusColor(task.status)}>{task.status.replace("_", " ")}</Badge>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center space-x-4">
                {task.due_date && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {formatDate(task.due_date)}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Created: {formatDate(task.created_at)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
