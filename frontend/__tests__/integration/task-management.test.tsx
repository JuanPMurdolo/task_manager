import { render, screen, waitFor, act } from "../test-utils/test-utils"
import { TaskDashboard } from "../../components/task-dashboard"
import { mockTasks, mockUsers, mockCurrentUser, setupUser } from "../test-utils/test-utils"
import jest from "jest" // Import jest to fix the undeclared variable error

const mockFetch = jest.fn()
global.fetch = mockFetch

describe("Task Management Integration", () => {
  const user = setupUser()
  const mockOnLogout = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => JSON.stringify(mockCurrentUser)),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    })

    // Default successful API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTasks),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUsers),
      })
  })

  it("handles complete task creation workflow", async () => {
    const newTask = {
      id: 4,
      title: "Integration Test Task",
      description: "Created via integration test",
      status: "pending",
      priority: "high",
      assigned_to: 1,
      created_at: "2024-01-04T00:00:00Z",
      updated_at: "2024-01-04T00:00:00Z",
    }

    // Mock task creation API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(newTask),
    })

    await act(async () => {
      render(<TaskDashboard onLogout={mockOnLogout} />)
    })

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText("New Task")).toBeInTheDocument()
    })

    // Click New Task button
    await user.click(screen.getByText("New Task"))

    // Wait for form to open
    await waitFor(() => {
      expect(screen.getByText("Create New Task")).toBeInTheDocument()
    })

    // Fill out the form
    await user.type(screen.getByLabelText(/title/i), "Integration Test Task")
    await user.type(screen.getByLabelText(/description/i), "Created via integration test")
    await user.selectOptions(screen.getByLabelText(/priority/i), "high")
    await user.selectOptions(screen.getByLabelText(/assigned to/i), "1")

    // Submit the form
    await user.click(screen.getByRole("button", { name: /create task/i }))

    // Verify API call was made
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/tasks"),
        expect.objectContaining({
          method: "POST",
        }),
      )
    })
  })

  it("handles task filtering and search workflow", async () => {
    await act(async () => {
      render(<TaskDashboard onLogout={mockOnLogout} />)
    })

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search tasks/i)).toBeInTheDocument()
    })

    // Search for tasks
    await user.type(screen.getByPlaceholderText(/search tasks/i), "Test Task 1")

    // Filter by status
    await user.click(screen.getByText("All Statuses"))
    await user.click(screen.getByText("Pending"))

    // Filter by priority
    await user.click(screen.getByText("All Priorities"))
    await user.click(screen.getByText("High"))

    // Verify filters are applied
    await waitFor(() => {
      expect(screen.getByDisplayValue("Test Task 1")).toBeInTheDocument()
    })
  })

  it("handles task status update workflow", async () => {
    const updatedTask = { ...mockTasks[0], status: "completed" }

    // Mock task update API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(updatedTask),
    })

    await act(async () => {
      render(<TaskDashboard onLogout={mockOnLogout} />)
    })

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText("Test Task 1")).toBeInTheDocument()
    })

    // Click on status to change it
    const statusButtons = screen.getAllByText("Pending")
    await user.click(statusButtons[0])

    // Verify API call was made
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/tasks/1"),
        expect.objectContaining({
          method: "PUT",
        }),
      )
    })
  })

  it("handles user management workflow", async () => {
    await act(async () => {
      render(<TaskDashboard onLogout={mockOnLogout} />)
    })

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /user management/i })).toBeInTheDocument()
    })

    // Switch to Users tab
    await user.click(screen.getByRole("tab", { name: /user management/i }))

    await waitFor(() => {
      expect(screen.getAllByText("User Management")[1]).toBeInTheDocument()
    })

    // Verify users are displayed
    expect(screen.getByText("testuser1")).toBeInTheDocument()
    expect(screen.getByText("testuser2")).toBeInTheDocument()
  })

  it("handles task editing workflow", async () => {
    const updatedTask = { ...mockTasks[0], title: "Updated Task Title" }

    // Mock task update API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(updatedTask),
    })

    await act(async () => {
      render(<TaskDashboard onLogout={mockOnLogout} />)
    })

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText("Test Task 1")).toBeInTheDocument()
    })

    // Click edit button
    const editButtons = screen.getAllByText("Edit")
    await user.click(editButtons[0])

    // Wait for edit form to open
    await waitFor(() => {
      expect(screen.getByText("Edit Task")).toBeInTheDocument()
    })

    // Update the title
    const titleInput = screen.getByDisplayValue("Test Task 1")
    await user.clear(titleInput)
    await user.type(titleInput, "Updated Task Title")

    // Submit the form
    await user.click(screen.getByRole("button", { name: /update task/i }))

    // Verify API call was made
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/tasks/1"),
        expect.objectContaining({
          method: "PUT",
        }),
      )
    })
  })

  it("handles error states gracefully", async () => {
    // Mock API error
    mockFetch.mockRejectedValueOnce(new Error("Network error"))

    await act(async () => {
      render(<TaskDashboard onLogout={mockOnLogout} />)
    })

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument()
    })
  })
})
