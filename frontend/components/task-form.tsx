"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Save } from "lucide-react"

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

interface TaskFormProps {
  task?: Task | null
  onTaskCreated: (task: Task) => void
  onTaskUpdated: (task: Task) => void
  onClose: () => void
}

export function TaskForm({ task, onTaskCreated, onTaskUpdated, onClose }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending" as const,
    priority: "medium" as const,
    due_date: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date ? task.due_date.split("T")[0] : "",
      })
    }
  }, [task])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const url = task ? `http://localhost:8000/tasks/${task.id}` : "http://localhost:8000/tasks/"
      const method = task ? "PUT" : "POST"

      const payload = {
        ...formData,
        due_date: formData.due_date || null,
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const responseData = await response.json()
        if (task) {
          onTaskUpdated(responseData)
        } else {
          onTaskCreated(responseData)
        }
      } else {
        const errorData = await response.json()
        console.error("Failed to save task:", errorData)
      }
    } catch (error) {
      console.error("Failed to save task:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md card-gradient border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">{task ? "Edit Task" : "Create New Task"}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-primary"
                placeholder="Enter task title"
              />
              {errors.title && <p className="text-sm text-red-400">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-primary"
                placeholder="Enter task description"
                rows={3}
              />
              {errors.description && <p className="text-sm text-red-400">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date" className="text-gray-300">
                Due Date (Optional)
              </Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="bg-white/5 border-white/20 text-white focus:border-primary"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 neon-green-bg text-black font-semibold hover:bg-primary/90 glow-effect"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : task ? "Update Task" : "Create Task"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
