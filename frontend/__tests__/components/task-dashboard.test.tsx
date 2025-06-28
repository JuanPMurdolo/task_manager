import { render, screen, waitFor } from "../test-utils/test-utils"
import userEvent from "@testing-library/user-event"
import { TaskDashboard } from "../../components/task-dashboard"
import { mockTasks, mockUsers, mockCurrentUser, setupUser } from "../test-utils/test-utils"

// Mock fetch globally
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

  it("renders dashboard correctly", async () => {
    render(<TaskDashboard onLogout={mockOnLogout} />)

    await waitFor(() => {
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
      expect(screen.getByText("Total Tasks")).toBeInTheDocument()
      expect(screen.getAllByText("Completed")[0]).toBeInTheDocument()
      expect(screen.getByText("In Progress")).toBeInTheDocument()
      expect(screen.getByText("Pending")).toBeInTheDocument()
      expect(screen.getByText("High Priority")).toBeInTheDocument()
    })
  })

  it("switches between tabs", async () => {
    render(<TaskDashboard onLogout={mockOnLogout} />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /tasks/i })).toBeInTheDocument()
    })

    // Switch to Users tab
    await userEvent.click(screen.getByRole("tab", { name: /user management/i }))

    await waitFor(() => {
      expect(screen.getAllByText("User Management")[1]).toBeInTheDocument()
    })
  })

  it("opens task form when create button is clicked", async () => {
    render(<TaskDashboard onLogout={mockOnLogout} />)

    await waitFor(() => {
      expect(screen.getByText("New Task")).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText("New Task"))

    await waitFor(() => {
      expect(screen.getByText("Create New Task")).toBeInTheDocument()
    })
  })

  it("handles logout", async () => {
    render(<TaskDashboard onLogout={mockOnLogout} />)

    await waitFor(() => {
      expect(screen.getByText("Logout")).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText("Logout"))

    expect(mockOnLogout).toHaveBeenCalled()
  })

  it("shows loading state initially", () => {
    render(<TaskDashboard onLogout={mockOnLogout} />)

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })
})
