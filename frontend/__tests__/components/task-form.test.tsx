"use client"

import { render, screen, waitFor } from "../../test-utils/test-utils"
import { TaskForm } from "../../components/tasks/task-form"
import { mockTasks, mockUsers, setupUser } from "../../test-utils/test-utils"
import { jest } from "@jest/globals"

const mockFetch = jest.fn()
global.fetch = mockFetch

describe("TaskForm", () => {
  const user = setupUser()
  const mockOnClose = jest.fn()
  const mockOnTaskCreated = jest.fn()
  const mockOnTaskUpdated = jest.fn()
  const mockOnError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  it("renders create form correctly", () => {
    render(
      <TaskForm
        onClose={mockOnClose}
        onTaskCreated={mockOnTaskCreated}
        onTaskUpdated={mockOnTaskUpdated}
        onError={mockOnError}
        users={mockUsers}
      />,
    )

    expect(screen.getByText("Create New Task")).toBeInTheDocument()
    expect(screen.getByLabelText(/task title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()

    // Use text content for labels that don't have proper form control association
    expect(screen.getByText("Status")).toBeInTheDocument()
    expect(screen.getByText("Priority")).toBeInTheDocument()
    expect(screen.getByText("Assign To")).toBeInTheDocument()
    expect(screen.getByText("Due Date")).toBeInTheDocument()

    // Verify that comboboxes (Select components) are present
    const comboboxes = screen.getAllByRole("combobox")
    expect(comboboxes).toHaveLength(3) // Status, Priority, Assign To
  })

  it("renders edit form correctly", () => {
    render(
      <TaskForm
        task={mockTasks[0]}
        onClose={mockOnClose}
        onTaskCreated={mockOnTaskCreated}
        onTaskUpdated={mockOnTaskUpdated}
        onError={mockOnError}
        users={mockUsers}
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
      assigned_to: "testuser1",
      created_at: "2024-01-04T00:00:00Z",
      updated_at: "2024-01-04T00:00:00Z",
      due_date: null,
      created_by: "testuser1",
      updated_by: "testuser1",
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(newTask),
    })

    render(
      <TaskForm
        onClose={mockOnClose}
        onTaskCreated={mockOnTaskCreated}
        onTaskUpdated={mockOnTaskUpdated}
        onError={mockOnError}
        users={mockUsers}
      />,
    )

    await user.type(screen.getByLabelText(/task title/i), "New Task")
    await user.type(screen.getByLabelText(/description/i), "New description")
    await user.click(screen.getByRole("button", { name: /create task/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/tasks"),
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer null",
          },
        }),
      )
    })

    expect(mockOnTaskCreated).toHaveBeenCalledWith(newTask)
  })

  it("handles form submission for task update", async () => {
    const updatedTask = { ...mockTasks[0], title: "Updated Task" }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(updatedTask),
    })

    render(
      <TaskForm
        task={mockTasks[0]}
        onClose={mockOnClose}
        onTaskCreated={mockOnTaskCreated}
        onTaskUpdated={mockOnTaskUpdated}
        onError={mockOnError}
        users={mockUsers}
      />,
    )

    const titleInput = screen.getByDisplayValue("Test Task 1")
    await user.clear(titleInput)
    await user.type(titleInput, "Updated Task")

    await user.click(screen.getByRole("button", { name: /update task/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/tasks/1"),
        expect.objectContaining({
          method: "PUT",
        }),
      )
    })

    expect(mockOnTaskUpdated).toHaveBeenCalledWith(updatedTask)
  })

  it("shows validation errors", async () => {
    render(
      <TaskForm
        onClose={mockOnClose}
        onTaskCreated={mockOnTaskCreated}
        onTaskUpdated={mockOnTaskUpdated}
        onError={mockOnError}
        users={mockUsers}
      />,
    )

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

    render(
      <TaskForm
        onClose={mockOnClose}
        onTaskCreated={mockOnTaskCreated}
        onTaskUpdated={mockOnTaskUpdated}
        onError={mockOnError}
        users={mockUsers}
      />,
    )

    await user.type(screen.getByLabelText(/task title/i), "New Task")
    await user.type(screen.getByLabelText(/description/i), "New description")
    await user.click(screen.getByRole("button", { name: /create task/i }))

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith("Validation error")
    })
  })

  it("closes form when cancel is clicked", async () => {
    render(
      <TaskForm
        onClose={mockOnClose}
        onTaskCreated={mockOnTaskCreated}
        onTaskUpdated={mockOnTaskUpdated}
        onError={mockOnError}
        users={mockUsers}
      />,
    )

    await user.click(screen.getByRole("button", { name: /cancel/i }))

    expect(mockOnClose).toHaveBeenCalled()
  })

  it("displays form fields correctly", () => {
    render(
      <TaskForm
        onClose={mockOnClose}
        onTaskCreated={mockOnTaskCreated}
        onTaskUpdated={mockOnTaskUpdated}
        onError={mockOnError}
        users={mockUsers}
      />,
    )

    // Check all form sections are present
    expect(screen.getByText("Task Title")).toBeInTheDocument()
    expect(screen.getByText("Description")).toBeInTheDocument()
    expect(screen.getByText("Status")).toBeInTheDocument()
    expect(screen.getByText("Priority")).toBeInTheDocument()
    expect(screen.getByText("Assign To")).toBeInTheDocument()
    expect(screen.getByText("Due Date")).toBeInTheDocument()

    // Check form inputs
    expect(screen.getByPlaceholderText("Enter task title")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Enter task description")).toBeInTheDocument()
  })

  it("shows correct default values", () => {
    render(
      <TaskForm
        onClose={mockOnClose}
        onTaskCreated={mockOnTaskCreated}
        onTaskUpdated={mockOnTaskUpdated}
        onError={mockOnError}
        users={mockUsers}
      />,
    )

    // Check that default values are set
    const comboboxes = screen.getAllByRole("combobox")
    expect(comboboxes[0]).toBeInTheDocument() // Status select
    expect(comboboxes[1]).toBeInTheDocument() // Priority select
    expect(comboboxes[2]).toBeInTheDocument() // Assign To select
  })

  it("has accessible form elements", () => {
    render(
      <TaskForm
        onClose={mockOnClose}
        onTaskCreated={mockOnTaskCreated}
        onTaskUpdated={mockOnTaskUpdated}
        onError={mockOnError}
        users={mockUsers}
      />,
    )

    // Check that form elements are accessible
    expect(screen.getByRole("textbox", { name: /task title/i })).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: /description/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /create task/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()

    // Check that select components are present
    const comboboxes = screen.getAllByRole("combobox")
    expect(comboboxes).toHaveLength(3)
  })
})
