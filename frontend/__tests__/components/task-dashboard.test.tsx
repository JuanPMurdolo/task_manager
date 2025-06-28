import { render, screen, waitFor } from "../test-utils/test-utils"
import userEvent from "@testing-library/user-event"
import { TaskDashboard } from "../../components/task-dashboard"
import {
  mockTasks,
  mockUsers,
  mockCurrentUser,
  setupUser,
} from "../test-utils/test-utils"

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
    screen.debug()

    await waitFor(() => {
      expect(
        screen.getByText((_, el) => el?.textContent === "TASK MANAGER")
      ).toBeInTheDocument()
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
    })
  })

  it("displays task statistics", async () => {
    render(<TaskDashboard onLogout={mockOnLogout} />)

    await waitFor(() => {
      expect(screen.getByText("Total Tasks")).toBeInTheDocument()
      expect(screen.getByText("Completed")).toBeInTheDocument()
      expect(screen.getByText("In Progress")).toBeInTheDocument()
      expect(screen.getByText("Pending")).toBeInTheDocument()
      expect(screen.getByText("Assigned to Me")).toBeInTheDocument()
    })
  })

  it("switches between tabs", async () => {
    render(<TaskDashboard onLogout={mockOnLogout} />)

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /tasks/i })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole("tab", { name: /user management/i }))

    await waitFor(() => {
      expect(screen.getAllByText("User Management")[0]).toBeInTheDocument()
    })
  })

  it("opens task form when create button is clicked", async () => {
    render(<TaskDashboard onLogout={mockOnLogout} />)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /new task/i })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole("button", { name: /new task/i }))

    await waitFor(() => {
      expect(screen.getByText(/create/i)).toBeInTheDocument()
    })
  })

  it("shows loading state initially", () => {
    render(<TaskDashboard onLogout={mockOnLogout} />)
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
  })
})
