import { render, screen, waitFor } from "../test-utils/test-utils"
import { TaskList } from "../../components/task-list"
import { mockTasks, mockUsers, setupUser } from "../test-utils/test-utils"

const mockFetch = jest.fn()
global.fetch = mockFetch

describe("TaskList", () => {
  const user = setupUser()

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  it("renders task list correctly", () => {
    render(<TaskList tasks={mockTasks} users={mockUsers} onTaskUpdate={jest.fn()} />)

    expect(screen.getByText("Test Task 1")).toBeInTheDocument()
    expect(screen.getByText("Test Task 2")).toBeInTheDocument()
    expect(screen.getByText("Test Task 3")).toBeInTheDocument()
  })

  it("displays task details correctly", () => {
    render(<TaskList tasks={mockTasks} users={mockUsers} onTaskUpdate={jest.fn()} />)

    expect(screen.getByText("Test description 1")).toBeInTheDocument()
    expect(screen.getByText("HIGH")).toBeInTheDocument()
    expect(screen.getByText("MEDIUM")).toBeInTheDocument()
    expect(screen.getByText("LOW")).toBeInTheDocument()
  })

  it("shows correct status badges", () => {
    render(<TaskList tasks={mockTasks} users={mockUsers} onTaskUpdate={jest.fn()} />)

    expect(screen.getByText("Pending")).toBeInTheDocument()
    expect(screen.getByText("In Progress")).toBeInTheDocument()
    expect(screen.getByText("Completed")).toBeInTheDocument()
  })

  it("handles task editing", async () => {
    const mockOnTaskUpdate = jest.fn()
    render(<TaskList tasks={mockTasks} users={mockUsers} onTaskUpdate={mockOnTaskUpdate} />)

    const editButtons = screen.getAllByText("Edit")
    await user.click(editButtons[0])

    await waitFor(() => {
      expect(screen.getByText("Edit Task")).toBeInTheDocument()
    })
  })

  it("handles task deletion", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    })

    const mockOnTaskUpdate = jest.fn()
    render(<TaskList tasks={mockTasks} users={mockUsers} onTaskUpdate={mockOnTaskUpdate} />)

    const deleteButtons = screen.getAllByText("Delete")
    await user.click(deleteButtons[0])

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/tasks/1"),
        expect.objectContaining({
          method: "DELETE",
        }),
      )
    })
  })

  it("handles status change", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ ...mockTasks[0], status: "completed" }),
    })

    const mockOnTaskUpdate = jest.fn()
    render(<TaskList tasks={mockTasks} users={mockUsers} onTaskUpdate={mockOnTaskUpdate} />)

    const statusButtons = screen.getAllByText("Pending")
    await user.click(statusButtons[0])

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/tasks/1"),
        expect.objectContaining({
          method: "PUT",
        }),
      )
    })
  })

  it("shows empty state when no tasks", () => {
    render(<TaskList tasks={[]} users={mockUsers} onTaskUpdate={jest.fn()} />)

    expect(screen.getByText("No tasks found")).toBeInTheDocument()
    expect(screen.getByText("Create your first task to get started")).toBeInTheDocument()
  })

  it("displays assigned user names", () => {
    render(<TaskList tasks={mockTasks} users={mockUsers} onTaskUpdate={jest.fn()} />)

    expect(screen.getByText("Test User 1")).toBeInTheDocument()
    expect(screen.getByText("Test User 2")).toBeInTheDocument()
  })
})
