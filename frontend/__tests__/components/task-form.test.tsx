"use client"
import { render, screen, waitFor } from "../test-utils/test-utils"
import { TaskForm } from "../../components/task-form"
import { mockTasks, mockUsers, setupUser } from "../test-utils/test-utils"
import '@testing-library/jest-dom'

const mockFetch = jest.fn()
global.fetch = mockFetch

describe("TaskForm", () => {
  const user = setupUser()
  const mockOnClose = jest.fn()
  const mockOnTaskCreated = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  it("renders create form rorrectly", () => {
    render(
  <TaskForm
    isOpen={true}
    onClose={mockOnClose}
    onTaskCreated={mockOnTaskCreated}
    users={mockUsers}
    onError={mockOnError}
  />
)

    expect(screen.getByText("Create New Task")).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/assigned to/i)).toBeInTheDocument()
  })

  it("renders edit form correctly", () => {
    render(
      <TaskForm
        isOpen={true}
        onClose={mockOnClose}
        onTaskCreated={mockOnTaskCreated}
        users={mockUsers}
        task={mockTasks[0]}
      />,
    )

    expect(screen.getByText("Edit Task")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Test Task 1")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Test description 1")).toBeInTheDocument()
  })

  it("handles form submission for new task", async () => {
    const newTask = {
      id: 4,
      title: "New Task",
      description: "New description",
      status: "pending",
      priority: "medium",
      assigned_to: 1,
      created_at: "2024-01-04T00:00:00Z",
      updated_at: "2024-01-04T00:00:00Z",
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(newTask),
    })

    render(<TaskForm isOpen={true} onClose={mockOnClose} onTaskCreated={mockOnTaskCreated} users={mockUsers} />)

    await user.type(screen.getByLabelText(/title/i), "New Task")
    await user.type(screen.getByLabelText(/description/i), "New description")
    await user.selectOptions(screen.getByLabelText(/priority/i), "medium")
    await user.selectOptions(screen.getByLabelText(/assigned to/i), "1")

    await user.click(screen.getByRole("button", { name: /create task/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/tasks"),
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "New Task",
            description: "New description",
            priority: "medium",
            assigned_to: 1,
          }),
        }),
      )
    })

    expect(mockOnTaskCreated).toHaveBeenCalledWith(newTask)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it("handles form submission for task update", async () => {
    const updatedTask = { ...mockTasks[0], title: "Updated Task" }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(updatedTask),
    })

    render(
      <TaskForm
        isOpen={true}
        onClose={mockOnClose}
        onTaskCreated={mockOnTaskCreated}
        users={mockUsers}
        task={mockTasks[0]}
      />,
    )

    const titleInput = screen.getByDisplayValue("Test Task 1")
    await user.clear(titleInput)
    await user.type(titleInput, "Updated Task")

    await user.click(screen.getByRole("button", { name: /update task/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/tasks/1"),
        expect.objectContaining({
          method: "PUT",
        }),
      )
    })
  })

  it("shows validation errors", async () => {
    render(<TaskForm isOpen={true} onClose={mockOnClose} onTaskCreated={mockOnTaskCreated} users={mockUsers} />)

    await user.click(screen.getByRole("button", { name: /create task/i }))

    // Should not submit without required fields
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("handles API errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({ detail: "Validation error" }),
    })

    render(<TaskForm isOpen={true} onClose={mockOnClose} onTaskCreated={mockOnTaskCreated} users={mockUsers} />)

    await user.type(screen.getByLabelText(/title/i), "New Task")
    await user.type(screen.getByLabelText(/description/i), "New description")
    await user.click(screen.getByRole("button", { name: /create task/i }))

    await waitFor(() => {
      expect(screen.getByText("Validation error")).toBeInTheDocument()
    })
  })

  it("shows loading state during submission", async () => {
    mockFetch.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

    render(<TaskForm isOpen={true} onClose={mockOnClose} onTaskCreated={mockOnTaskCreated} users={mockUsers} />)

    await user.type(screen.getByLabelText(/title/i), "New Task")
    await user.type(screen.getByLabelText(/description/i), "New description")
    await user.click(screen.getByRole("button", { name: /create task/i }))

    expect(screen.getByText("Creating...")).toBeInTheDocument()
  })

  it("closes form when cancel is clicked", async () => {
    render(<TaskForm isOpen={true} onClose={mockOnClose} onTaskCreated={mockOnTaskCreated} users={mockUsers} />)

    await user.click(screen.getByRole("button", { name: /cancel/i }))

    expect(mockOnClose).toHaveBeenCalled()
  })
})
function mockOnError(error: string): void {
    throw new Error("Function not implemented.")
}

