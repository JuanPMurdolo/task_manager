"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Filter, X, Users } from "lucide-react"

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

interface TaskFiltersProps {
  tasks: Task[]
  users: any[]
  onFiltersChange: (filteredTasks: Task[]) => void
}

export function TaskFilters({ tasks, users, onFiltersChange }: TaskFiltersProps) {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    assignedTo: "",
    createdBy: "",
    dateFrom: "",
    dateTo: "",
  })

  useEffect(() => {
    applyFilters()
  }, [filters, tasks])

  const applyFilters = () => {
    let filtered = [...tasks]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) || task.description.toLowerCase().includes(searchLower),
      )
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((task) => task.status === filters.status)
    }

    // Priority filter
    if (filters.priority && filters.priority !== "all") {
      filtered = filtered.filter((task) => task.priority === filters.priority)
    }

    // Assigned to filter
    if (filters.assignedTo && filters.assignedTo !== "all") {
      if (filters.assignedTo === "unassigned") {
        filtered = filtered.filter((task) => !task.assigned_to)
      } else {
        filtered = filtered.filter((task) => task.assigned_to === filters.assignedTo)
      }
    }

    // Created by filter
    if (filters.createdBy && filters.createdBy !== "all") {
      filtered = filtered.filter((task) => task.created_by === filters.createdBy)
    }

    // Date range filters
    if (filters.dateFrom) {
      filtered = filtered.filter((task) => {
        if (!task.due_date) return false
        return new Date(task.due_date) >= new Date(filters.dateFrom)
      })
    }

    if (filters.dateTo) {
      filtered = filtered.filter((task) => {
        if (!task.due_date) return false
        return new Date(task.due_date) <= new Date(filters.dateTo)
      })
    }

    onFiltersChange(filtered)
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      priority: "",
      assignedTo: "",
      createdBy: "",
      dateFrom: "",
      dateTo: "",
    })
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== "")

  const getUserInitials = (user: any) => {
    if (user.full_name) {
      return user.full_name
        .split(" ")
        .map((n: any[]) => n[0])
        .join("")
        .toUpperCase()
    }
    return user.username.substring(0, 2).toUpperCase()
  }

  // Get unique users who have created tasks
  const taskCreators = Array.from(new Set(tasks.map((task) => task.created_by))).map(
    (username) => users.find((user) => user.username === username) || { username, full_name: username },
  )

  // Get unique users who have been assigned tasks
  const assignedUsers = Array.from(new Set(tasks.map((task) => task.assigned_to).filter(Boolean))).map(
    (username) => users.find((user) => user.username === username) || { username, full_name: username },
  )

  return (
    <Card className="card-gradient border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-primary" />
            <span>Filters</span>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label className="text-gray-300 flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Search</span>
          </Label>
          <Input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-primary"
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label className="text-gray-300">Status</Label>
          <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="hold">Hold</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label className="text-gray-300">Priority</Label>
          <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20">
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assigned To */}
        <div className="space-y-2">
          <Label className="text-gray-300 flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Assigned To</span>
          </Label>
          <Select value={filters.assignedTo} onValueChange={(value) => setFilters({ ...filters, assignedTo: value })}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="All assignments" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20">
              <SelectItem value="all">All assignments</SelectItem>
              <SelectItem value="unassigned">
                <div className="flex items-center space-x-2">
                  <span className="h-4 w-4 text-gray-400">U</span>
                  <span>Unassigned</span>
                </div>
              </SelectItem>
              {assignedUsers.map((user) => (
                <SelectItem key={user.username} value={user.username}>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.full_name || user.username}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Created By */}
        <div className="space-y-2">
          <Label className="text-gray-300 flex items-center space-x-2">
            <span className="h-4 w-4">C</span>
            <span>Created By</span>
          </Label>
          <Select value={filters.createdBy} onValueChange={(value) => setFilters({ ...filters, createdBy: value })}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="All creators" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20">
              <SelectItem value="all">All creators</SelectItem>
              {taskCreators.map((user) => (
                <SelectItem key={user.username} value={user.username}>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs bg-gray-700 text-gray-300">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.full_name || user.username}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-gray-300">Due Date Range</Label>
          <div className="space-y-2">
            <Input
              type="date"
              placeholder="From date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="bg-white/5 border-white/20 text-white focus:border-primary"
            />
            <Input
              type="date"
              placeholder="To date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="bg-white/5 border-white/20 text-white focus:border-primary"
            />
          </div>
        </div>

        {/* Filter Summary */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-gray-400 mb-2">Active filters:</p>
            <div className="flex flex-wrap gap-1">
              {filters.search && (
                <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded border border-primary/30">
                  Search: {filters.search}
                </span>
              )}
              {filters.status && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                  Status: {filters.status}
                </span>
              )}
              {filters.priority && (
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded border border-orange-500/30">
                  Priority: {filters.priority}
                </span>
              )}
              {filters.assignedTo && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded border border-purple-500/30">
                  Assigned: {filters.assignedTo === "unassigned" ? "Unassigned" : filters.assignedTo}
                </span>
              )}
              {filters.createdBy && (
                <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded border border-gray-500/30">
                  Creator: {filters.createdBy}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
