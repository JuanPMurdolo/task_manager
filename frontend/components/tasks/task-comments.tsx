"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trash2, Send, MessageSquare, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface User {
  id: number
  username: string
  full_name: string | null
  type: string
}

interface TaskComment {
  id: number
  content: string
  created_at: string
  task_id: number
  created_by_user: {
    id: number
    username: string
    full_name: string | null
  }
}

interface TaskCommentsProps {
  taskId: number
  currentUser: User | null
  users: User[]
}

export function TaskComments({ taskId, currentUser, users }: TaskCommentsProps) {
  const [comments, setComments] = useState<TaskComment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchComments()
  }, [taskId])

  const fetchComments = async () => {
    setIsLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8000/tasks/${taskId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      } else if (response.status !== 404) {
        const errorData = await response.json()
        setError(errorData.detail || "Failed to fetch comments.")
      }
    } catch (err) {
      setError("A network error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUser) return

    setIsSubmitting(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8000/tasks/${taskId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newComment,
          task_id: taskId,
          user_id: currentUser.id,
        }),
      })

      if (response.ok) {
        const addedCommentFromApi = await response.json()

        // Manually construct the new comment object for the UI state
        const newCommentForState: TaskComment = {
          ...addedCommentFromApi,
          created_by_user: {
            id: currentUser.id,
            username: currentUser.username,
            full_name: currentUser.full_name,
          },
        }

        setComments([...comments, newCommentForState])
        setNewComment("")
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Failed to add comment.")
      }
    } catch (err) {
      setError("A network error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    setError("")
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8000/tasks/${taskId}/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setComments(comments.filter((comment) => comment.id !== commentId))
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Failed to delete comment.")
      }
    } catch (err) {
      setError("A network error occurred. Please try again.")
    }
  }

  const getInitials = (name: string | null | undefined, username: string | undefined) => {
    if (name && name.trim()) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (username) {
      return username.slice(0, 2).toUpperCase()
    }
    return "??"
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000)
    const minutes = Math.round(seconds / 60)
    const hours = Math.round(minutes / 60)
    const days = Math.round(hours / 24)

    if (seconds < 60) return `${seconds}s ago`
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
        {isLoading ? (
          <p className="text-gray-400">Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3 group">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {getInitials(comment.created_by_user?.full_name, comment.created_by_user?.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-white/5 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-white">
                    {comment.created_by_user?.full_name || comment.created_by_user?.username || "Unknown User"}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-gray-500">{formatRelativeTime(comment.created_at)}</p>
                    {(currentUser?.id === comment.created_by_user?.id || currentUser?.type === "admin") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="h-6 w-6 p-0 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-300 mt-1">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="mx-auto h-8 w-8 mb-2" />
            <p>No comments yet.</p>
            <p className="text-xs">Be the first to comment!</p>
          </div>
        )}
      </div>

      <form onSubmit={handleAddComment} className="flex items-center space-x-2 pt-4 border-t border-white/10">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gray-700 text-gray-300 text-xs">
            {currentUser ? getInitials(currentUser.full_name, currentUser.username) : "G"}
          </AvatarFallback>
        </Avatar>
        <Input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={isSubmitting}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isSubmitting || !newComment.trim()}
          className="neon-green-bg text-black hover:bg-primary/90 glow-effect"
        >
          {isSubmitting ? <Clock className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  )
}
