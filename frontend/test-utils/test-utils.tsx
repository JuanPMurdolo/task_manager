import type React from "react"
import { render, type RenderOptions } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

// Mock data for testing
export const mockTasks = [
  {
    id: 1,
    title: "Test Task 1",
    description: "Test description 1",
    status: "pending" as const,
    priority: "high" as const,
    assigned_to: "testuser1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    due_date: "2024-01-10T00:00:00Z",
    created_by: "testuser1",
    updated_by: "testuser1",
  },
  {
    id: 2,
    title: "Test Task 2",
    description: "Test description 2",
    status: "in_progress" as const,
    priority: "medium" as const,
    assigned_to: "testuser2",
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-04T00:00:00Z",
    due_date: "2024-01-15T00:00:00Z",
    created_by: "testuser2",
    updated_by: "testuser2",
  },
  {
    id: 3,
    title: "Test Task 3",
    description: "Test description 3",
    status: "completed" as const,
    priority: "low" as const,
    assigned_to: "testuser1",
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z",
    due_date: null,
    created_by: "testuser1",
    updated_by: "testuser1",
  },
]

export const mockUsers = [
  {
    id: 1,
    username: "testuser1",
    email: "test1@example.com",
    full_name: "Test User 1",
    type: "admin",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    username: "testuser2",
    email: "test2@example.com",
    full_name: "Test User 2",
    type: "user",
    is_active: true,
    created_at: "2024-01-02T00:00:00Z",
  },
]

export const mockCurrentUser = {
  id: 1,
  username: "testuser1",
  email: "test1@example.com",
  full_name: "Test User 1",
  type: "admin",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
}

// Mock fetch responses
export const mockFetchSuccess = (data: any) => {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => data,
  })
}

export const mockFetchError = (status = 400, message = "Error") => {
  return Promise.resolve({
    ok: false,
    status,
    json: async () => ({ detail: message }),
  })
}

export const mockFetchReject = (error = "Network error") => {
  return Promise.reject(new Error(error))
}

// Custom render function
const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) => {
  return render(ui, {
    container: document.body,
    ...options,
  })
}

// Setup user event
export const setupUser = () => userEvent.setup()

// Helper functions
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

export const mockLocalStorage = () => {
  const store: { [key: string]: string } = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key])
    },
  }
}

// Re-export everything
export * from "@testing-library/react"
export { customRender as render }
