"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Filter, X } from "lucide-react"

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

interface TaskFiltersProps {
  tasks: Task[]
  onFiltersChange: (filteredTasks: Task[]) => void
}

export function TaskFilters({ tasks, onFiltersChange }: TaskFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  useEffect(() => {
    applyFilters()
  }, [searchTerm, statusFilter, priorityFilter, dateFilter, tasks])

  const applyFilters = () => {
    let filtered = [...tasks]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter)
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)

      filtered = filtered.filter((task) => {
        if (!task.due_date) return dateFilter === "no_date"
        const dueDate = new Date(task.due_date)

        switch (dateFilter) {
          case "today":
            return dueDate >= today && dueDate < tomorrow
          case "tomorrow":
            return dueDate >= tomorrow && dueDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
          case "this_week":
            return dueDate >= today && dueDate < nextWeek
          case "overdue":
            return dueDate < today
          case "no_date":
            return false
          default:
            return true
        }
      })
    }

    onFiltersChange(filtered)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setPriorityFilter("all")
    setDateFilter("all")
  }

  const hasActiveFilters = searchTerm || statusFilter !== "all" || priorityFilter !== "all" || dateFilter !== "all"

  return (
    <Card className="card-gradient border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-gray-300">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-primary"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label className="text-gray-300">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="space-y-2">
          <Label className="text-gray-300">Priority</Label>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20">
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Filter */}
        <div className="space-y-2">
          <Label className="text-gray-300">Due Date</Label>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20">
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="no_date">No Due Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}

        {/* Results Count */}
        <div className="text-sm text-gray-400 text-center pt-2 border-t border-white/10">
          Showing {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </div>
      </CardContent>
    </Card>
  )
}
