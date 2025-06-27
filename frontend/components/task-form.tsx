import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Flag, FileText } from "lucide-react"

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

interface TaskFormProps {
  task?: Task | null
  users: any[]
  onTaskCreated: (task: Task) => void
  onTaskUpdated: (task: Task) => void
  onError: (error: string) => void
  onClose: () => void
  currentUser?: { id: number }
}
export function TaskForm({ task, users, onTaskCreated, onTaskUpdated, onError, onClose, currentUser }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    due_date: "",
    assigned_to: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date ? task.due_date.split("T")[0] : "",
        assigned_to: task.assigned_to || "",
      })
    }
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const url = task ? `http://localhost:8000/tasks/${task.id}` : "http://localhost:8000/tasks"
      const method = task ? "PUT" : "POST"

      const assignedUser = users.find(u => u.username === formData.assigned_to)
      const assignedUserId = assignedUser ? assignedUser.id : null

      const requestBody = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date ? formData.due_date : null,
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
        updated_by: currentUser?.id
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
        const taskData = await response.json()
        if (task) {
          onTaskUpdated(taskData)
        } else {
          onTaskCreated(taskData)
        }
        onClose()
      } else {
        const errorData = await response.json()
        onError(errorData.detail || `Failed to ${task ? "update" : "create"} task`)
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
      <Card className="card-gradient border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-white">{task ? "Edit Task" : "Create New Task"}</CardTitle>
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">
                Task Title
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                  placeholder="Enter task title"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                placeholder="Enter task description"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-white">
                  Status
                </Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20">
                    <SelectItem value="pending" className="text-white hover:bg-white/10">
                      Pending
                    </SelectItem>
                    <SelectItem value="in_progress" className="text-white hover:bg-white/10">
                      In Progress
                    </SelectItem>
                    <SelectItem value="completed" className="text-white hover:bg-white/10">
                      Completed
                    </SelectItem>
                    <SelectItem value="hold" className="text-white hover:bg-white/10">
                      On Hold
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-white">
                  Priority
                </Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <div className="flex items-center">
                      <Flag className="h-4 w-4 mr-2 text-gray-400" />
                      <SelectValue placeholder="Select priority" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20">
                    <SelectItem value="low" className="text-white hover:bg-white/10">
                      Low
                    </SelectItem>
                    <SelectItem value="medium" className="text-white hover:bg-white/10">
                      Medium
                    </SelectItem>
                    <SelectItem value="high" className="text-white hover:bg-white/10">
                      High
                    </SelectItem>
                    <SelectItem value="urgent" className="text-white hover:bg-white/10">
                      Urgent
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assigned_to" className="text-white">
                  Assign To
                </Label>
                <Select value={formData.assigned_to} onValueChange={(value) => handleInputChange("assigned_to", value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <div className="flex items-center">
                      <Flag className="h-4 w-4 mr-2 text-gray-400" />
                      <SelectValue placeholder="Select assignee" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20">
                    <SelectItem value="unassigned" className="text-white hover:bg-white/10">
                      Unassigned
                    </SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()} className="text-white hover:bg-white/10">
                        {user.full_name || user.username} (@{user.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date" className="text-white">
                  Due Date
                </Label>
                <div className="relative">
                  <Flag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleInputChange("due_date", e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                  />
                </div>
              </div>
            </div>

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
                {isLoading ? "Saving..." : task ? "Update Task" : "Create Task"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
