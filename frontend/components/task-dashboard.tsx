"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskList } from "@/components/task-list"
import { TaskFilters } from "@/components/task-filters"
import { TaskForm } from "@/components/task-form"
import { UserManagement } from "@/components/user-management"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Plus, CheckSquare, Clock, AlertCircle, Users, Shield, UserPlus } from "lucide-react"
import { TaskDetailModal } from "@/components/task-detail-modal"

interface User {
  id: number
  username: string
  email: string
  full_name: string
  type: string
}

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

interface TaskDashboardProps {
  onLogout: () => void
}

export function TaskDashboard({ onLogout }: TaskDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("tasks")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
    fetchTasks()
    fetchUsers()
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
      } else if (response.status === 404) {
        // No tasks found
        setTasks([])
        setFilteredTasks([])
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
      setError("Failed to fetch tasks")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8000/users/getall", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    }
  }

  const handleTaskCreated = (newTask: Task) => {
    setTasks([...tasks, newTask])
    setFilteredTasks([...tasks, newTask])
    setShowTaskForm(false)
    setError("")
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    const updatedTasks = tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    setTasks(updatedTasks)
    setFilteredTasks(updatedTasks)
    if (selectedTask && selectedTask.id === updatedTask.id) {
      setSelectedTask(updatedTask)
    }
    setEditingTask(null)
    setShowTaskForm(false)
    setError("")
  }

  const handleTaskDeleted = (taskId: number) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId)
    setTasks(updatedTasks)
    setFilteredTasks(updatedTasks)
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(null)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
    setSelectedTask(null)
  }

  const handleViewTask = (task: Task) => {
    setSelectedTask(task)
  }

  const handleFiltersChange = (filtered: Task[]) => {
    setFilteredTasks(filtered)
  }

  const handleTaskFormError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const handleUserCreated = (newUser: User) => {
    setUsers([...users, newUser])
  }

  const handleUserUpdated = (updatedUser: User) => {
    const updatedUsers = users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    setUsers(updatedUsers)
  }

  const handleUserDeleted = (userId: number) => {
    const updatedUsers = users.filter((user) => user.id !== userId)
    setUsers(updatedUsers)
  }

  const stats = {
    total: tasks.length,
    completed: tasks.filter((task) => task.status === "completed").length,
    pending: tasks.filter((task) => task.status === "pending").length,
    inProgress: tasks.filter((task) => task.status === "in_progress").length,
    assignedToMe: tasks.filter((task) => task.assigned_to === currentUser?.username).length,
  }

  const isAdmin = currentUser?.type === "admin"

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div
          data-testid="loading-spinner"
          className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"
        ></div>
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
            <div>
              <h1 className="text-2xl font-bold">
                <span className="neon-green">TASK</span> MANAGER
              </h1>
              {currentUser && (
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-400">
                    Welcome back, <span className="text-primary">{currentUser.full_name || currentUser.username}</span>
                  </p>
                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      <Shield className="h-3 w-3 text-yellow-400" />
                      <span className="text-xs text-yellow-400 font-medium">ADMIN</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setShowTaskForm(true)}
              className="neon-green-bg text-black font-semibold hover:bg-primary/90 glow-effect"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
            <Button
              variant="outline"
              onClick={onLogout}
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="container mx-auto px-4 pt-4">
          <Alert className="border-red-500/30 bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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

          <Card className="card-gradient border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Assigned to Me</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.assignedToMe}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 mb-6">
            <TabsTrigger value="tasks" className="text-white data-[state=active]:bg-primary">
              <CheckSquare className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="users" className="text-white data-[state=active]:bg-primary">
              <UserPlus className="h-4 w-4 mr-2" />
              User Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <TaskFilters tasks={tasks} onFiltersChange={handleFiltersChange} users={users} />
              </div>

              {/* Task List */}
              <div className="lg:col-span-3">
                <TaskList
                  tasks={filteredTasks}
                  users={users}
                  currentUser={currentUser}
                  onTaskUpdated={handleTaskUpdated}
                  onTaskDeleted={handleTaskDeleted}
                  onEditTask={handleEditTask}
                  onViewTask={handleViewTask}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement
              users={users}
              currentUser={currentUser}
              onUserCreated={handleUserCreated}
              onUserUpdated={handleUserUpdated}
              onUserDeleted={handleUserDeleted}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          users={users}
          onTaskCreated={handleTaskCreated}
          onTaskUpdated={handleTaskUpdated}
          onError={handleTaskFormError}
          onClose={() => {
            setShowTaskForm(false)
            setEditingTask(null)
          }}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          users={users}
          currentUser={currentUser}
          onClose={() => setSelectedTask(null)}
          onEditTask={handleEditTask}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </div>
  )
}
