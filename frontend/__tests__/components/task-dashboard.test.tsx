import { render, screen, waitFor } from "../../test-utils/test-utils"
import userEvent from "@testing-library/user-event"
import { TaskDashboard } from "../../components/task-dashboard"
import { mockTasks, mockUsers, mockCurrentUser, setupUser } from "../../test-utils/test-utils"
import { jest } from "@jest/globals"

// Mock fetch global
const mockFetch = jest.fn()
global.fetch = mockFetch

describe("TaskDashboard", () => {
  const mockOnLogout = jest.fn()
  const user = setupUser()

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key: string) => {
          if (key === "user") return JSON.stringify(mockCurrentUser)
          if (key === "token") return "fake-token"
          return null
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    })

    // Mock tasks and users fetch
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

  it("renders dashboard correctly", async () => {
    render(<TaskDashboard onLogout={mockOnLogout} />)

    await waitFor(() => {
      // Use a function matcher to handle split text
      expect(
        screen.getByText((content, element) => {
          return element?.textContent === "TASK MANAGER"
        }),
      ).toBeInTheDocument()
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
    })
  })

  it("displays task statistics", async () => {
    render(<TaskDashboard onLogout={mockOnLogout} />)

    await waitFor(() => {
      // Look for statistics card headings specifically
      expect(screen.getByRole("heading", { name: "Total Tasks" })).toBeInTheDocument()
      expect(screen.getByRole("heading", { name: "Completed" })).toBeInTheDocument()
      expect(screen.getByRole("heading", { name: "In Progress" })).toBeInTheDocument()
      expect(screen.getByRole("heading", { name: "Pending" })).toBeInTheDocument()
      expect(screen.getByRole("heading", { name: "Assigned to Me" })).toBeInTheDocument()
    })
  })

  it("switches between tabs", async () => {
    render(<TaskDashboard onLogout={mockOnLogout} />)

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /tasks/i })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole("tab", { name: /user management/i }))

    await waitFor(() => {
      // Look for the heading specifically, not just any "User Management" text
      expect(screen.getByRole("heading", { name: "User Management" })).toBeInTheDocument()
    })
  })

  it("opens task form when create button is clicked", async () => {
    render(<TaskDashboard onLogout={mockOnLogout} />)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /new task/i })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole("button", { name: /new task/i }))

    await waitFor(() => {
      expect(screen.getByText("Create New Task")).toBeInTheDocument()
    })
  })

  it("shows loading state initially", () => {
    render(<TaskDashboard onLogout={mockOnLogout} />)
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })

  it("handles logout", async () => {
    render(<TaskDashboard onLogout={mockOnLogout} />)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole("button", { name: /logout/i }))

    expect(mockOnLogout).toHaveBeenCalled()
  })
})
