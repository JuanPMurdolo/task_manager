import type React from "react"
import { render, type RenderOptions } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { jest } from "@jest/globals"

// Mock data for testing
export const mockTasks = [
  {
    id: 1,
    title: "Test Task 1",
    description: "Description 1",
    status: "pending",
    priority: "high",
    assigned_to: 1,
    created_at: "2023-01-01",
    updated_at: "2023-01-02",
    due_date: "2023-01-10",
    created_by: 1,
    updated_by: 1
  },
  {
    id: 2,
    title: "Test Task 2",
    description: "Description 2",
    status: "completed",
    priority: "low",
    assigned_to: 2,
    created_at: "2023-01-03",
    updated_at: "2023-01-04",
    due_date: "2023-01-15",
    created_by: 2,
    updated_by: 2
  },
  {
    id: 3,
    title: "Test Task 3",
    description: "Test description 3",
    status: "completed",
    priority: "low",
    assigned_to: 1,
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z",
  },
]

export const mockUsers = [
  {
    id: 1,
    username: "testuser1",
    email: "test1@example.com",
    full_name: "Test User 1",
    role: "admin",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    username: "testuser2",
    email: "test2@example.com",
    full_name: "Test User 2",
    role: "user",
    is_active: true,
    created_at: "2024-01-02T00:00:00Z",
  },
]

export const mockCurrentUser = {
  id: 1,
  username: "testuser",
  email: "test@example.com",
  full_name: "Test User",
  role: "admin",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
}

// Mock fetch responses
export const mockFetchSuccess = (data: any) => {
  return jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => data,
  })
}

export const mockFetchError = (status = 400, message = "Error") => {
  return jest.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ detail: message }),
  })
}

export const mockFetchReject = (error = "Network error") => {
  return jest.fn().mockRejectedValue(new Error(error))
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
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key])
    }),
  }
}

// Re-export everything
export * from "@testing-library/react"
export { customRender as render }
