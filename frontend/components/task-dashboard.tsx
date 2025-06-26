"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskList } from "@/components/task-list"
import { TaskFilters } from "@/components/task-filters"
import { TaskForm } from "@/components/task-form"
import { LogOut, Plus, CheckSquare, Clock, AlertCircle } from "lucide-react"

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

interface TaskDashboardProps {
  onLogout: () => void
}

export function TaskDashboard({ onLogout }: TaskDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8000/tasks/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTasks(data)
        setFilteredTasks(data)
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTaskCreated = (newTask: Task) => {
    setTasks([...tasks, newTask])
    setFilteredTasks([...filteredTasks, newTask])
    setShowTaskForm(false)
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    const updatedTasks = tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    setTasks(updatedTasks)
    setFilteredTasks(updatedTasks)
    setEditingTask(null)
    setShowTaskForm(false)
  }

  const handleTaskDeleted = (taskId: number) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId)
    setTasks(updatedTasks)
    setFilteredTasks(updatedTasks)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleFiltersChange = (filtered: Task[]) => {
    setFilteredTasks(filtered)
  }

  const stats = {
    total: tasks.length,
    completed: tasks.filter((task) => task.status === "completed").length,
    pending: tasks.filter((task) => task.status === "pending").length,
    inProgress: tasks.filter((task) => task.status === "in_progress").length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckSquare className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">
              <span className="neon-green">TASK</span> MANAGER
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setShowTaskForm(true)}
              className="neon-green-bg text-black font-semibold hover:bg-primary/90 glow-effect"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
            <Button variant="outline" onClick={onLogout} className="border-white/20 text-white hover:bg-white/10">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="card-gradient border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="card-gradient border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Completed</CardTitle>
              <CheckSquare className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card className="card-gradient border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card className="card-gradient border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <TaskFilters tasks={tasks} onFiltersChange={handleFiltersChange} />
          </div>

          {/* Task List */}
          <div className="lg:col-span-3">
            <TaskList
              tasks={filteredTasks}
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
              onEditTask={handleEditTask}
            />
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onTaskCreated={handleTaskCreated}
          onTaskUpdated={handleTaskUpdated}
          onClose={() => {
            setShowTaskForm(false)
            setEditingTask(null)
          }}
        />
      )}
    </div>
  )
}
