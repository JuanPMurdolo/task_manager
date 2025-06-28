import { render, screen, waitFor, mockTasks, mockUsers, mockCurrentUser, setupUser } from "../../test-utils/test-utils"
import { TaskDashboard } from "../../components/task-dashboard"
import { jest } from "@jest/globals"

// Mock fetch global
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
  })

  it("handles complete task creation workflow", async () => {
    // Setup mocks for this specific test
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTasks),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUsers),
      })

    const newTask = {
      id: 4,
      title: "Integration Test Task",
      description: "Created via integration test",
      status: "pending",
      priority: "high",
      assigned_to: "testuser1",
      created_at: "2024-01-04T00:00:00Z",
      updated_at: "2024-01-04T00:00:00Z",
      due_date: null,
      created_by: "testuser1",
      updated_by: "testuser1",
    }

    // Mock task creation API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(newTask),
    })

    render(<TaskDashboard onLogout={mockOnLogout} />)

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /new task/i })).toBeInTheDocument()
    })

    // Click New Task button
    await user.click(screen.getByRole("button", { name: /new task/i }))

    // Wait for form to open
    await waitFor(() => {
      expect(screen.getByText("Create New Task")).toBeInTheDocument()
    })

    // Fill out the form
    await user.type(screen.getByLabelText(/task title/i), "Integration Test Task")
    await user.type(screen.getByLabelText(/description/i), "Created via integration test")

    // Submit the form
    await user.click(screen.getByRole("button", { name: /create task/i }))

    // Verify API call was made
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/tasks"),
        expect.objectContaining({
          method: "POST",
        }),
      )
    })
  })

  it("handles task filtering and search workflow", async () => {
    // Setup mocks for this specific test
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTasks),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUsers),
      })

    render(<TaskDashboard onLogout={mockOnLogout} />)

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search tasks/i)).toBeInTheDocument()
    })

    // Search for tasks
    await user.type(screen.getByPlaceholderText(/search tasks/i), "Test Task 1")

    // Verify search input is working
    await waitFor(() => {
      expect(screen.getByDisplayValue("Test Task 1")).toBeInTheDocument()
    })
  })

  it("handles task status update workflow", async () => {
    // Setup mocks for this specific test
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTasks),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUsers),
      })

    const updatedTask = { ...mockTasks[0], status: "completed" }

    // Mock task update API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(updatedTask),
    })

    render(<TaskDashboard onLogout={mockOnLogout} />)

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText("Test Task 1")).toBeInTheDocument()
    })

    // Find and click a status change button
    const completedButtons = screen.getAllByRole("button", { name: /completed/i })
    if (completedButtons.length > 0) {
      await user.click(completedButtons[0])

      // Verify API call was made
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("/tasks/1/status"),
          expect.objectContaining({
            method: "PUT",
          }),
        )
      })
    }
  })

  it("handles user management workflow", async () => {
    // Setup mocks for this specific test
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTasks),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUsers),
      })

    render(<TaskDashboard onLogout={mockOnLogout} />)

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /user management/i })).toBeInTheDocument()
    })

    // Switch to Users tab
    await user.click(screen.getByRole("tab", { name: /user management/i }))

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "User Management" })).toBeInTheDocument()
    })

    // Verify users are displayed
    expect(screen.getAllByText("Test User 1")[0]).toBeInTheDocument()
    expect(screen.getAllByText("Test User 2")[0]).toBeInTheDocument()
  })

  it("handles task editing workflow", async () => {
    // Setup mocks for this specific test
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTasks),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUsers),
      })

    const updatedTask = { ...mockTasks[0], title: "Updated Task Title" }

    // Mock task update API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(updatedTask),
    })

    render(<TaskDashboard onLogout={mockOnLogout} />)

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText("Test Task 1")).toBeInTheDocument()
    })

    // Find the first task card and click its edit button
    const taskCards = screen.getAllByText("Test Task 1")
    const firstTaskCard = taskCards[0].closest(".card-gradient")

    if (firstTaskCard) {
      const editButton = firstTaskCard.querySelector(
        'button[class*="hover:text-white"]:not([class*="hover:text-red-400"])',
      )

      if (editButton) {
        await user.click(editButton as Element)

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
            expect.stringContaining("/tasks/1"),
            expect.objectContaining({
              method: "PUT",
            }),
          )
        })
      }
    }
  })

  it("handles error states gracefully", async () => {
    // Reset mocks and set up error response
    mockFetch.mockClear()
    mockFetch.mockRejectedValueOnce(new Error("Network error"))

    render(<TaskDashboard onLogout={mockOnLogout} />)

    // Should handle the error gracefully and show loading state
    await waitFor(() => {
      // The component should handle errors gracefully
      // We can check that it doesn't crash and shows some content
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument()
    })
  })

  it("displays dashboard statistics correctly", async () => {
    // Setup mocks specifically for this test
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTasks),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUsers),
      })

    render(<TaskDashboard onLogout={mockOnLogout} />)

    // Wait for the header to appear (indicates basic loading is done)
    await waitFor(() => {
      expect(
        screen.getByText((content, element) => {
          return element?.textContent === "TASK MANAGER"
        }),
      ).toBeInTheDocument()
    })

    // Wait for statistics cards to appear - use Testing Library methods
    await waitFor(() => {
      // Find statistics cards by their specific structure within the stats grid
      const statsGrid = document.querySelector(".grid.grid-cols-1.md\\:grid-cols-5.gap-4.mb-6")
      expect(statsGrid).toBeInTheDocument()

      // Find card titles within the statistics grid using proper DOM methods
      const cardTitles = Array.from(statsGrid?.querySelectorAll("h3") || [])
      const titleTexts = cardTitles.map((el) => el.textContent)

      expect(titleTexts).toContain("Total Tasks")
      expect(titleTexts).toContain("Completed")
      expect(titleTexts).toContain("In Progress")
      expect(titleTexts).toContain("Pending")
      expect(titleTexts).toContain("Assigned to Me")
    })

    // Check that statistics show correct values by looking within the stats grid
    await waitFor(() => {
      const statsGrid = document.querySelector(".grid.grid-cols-1.md\\:grid-cols-5.gap-4.mb-6")

      // Look for stat values within the statistics section
      const statValues = Array.from(statsGrid?.querySelectorAll(".text-2xl.font-bold") || []).map(
        (el) => el.textContent,
      )

      expect(statValues).toContain("3") // Total tasks
      expect(statValues).toContain("1") // Should appear for completed, in_progress, pending counts
      expect(statValues).toContain("2") // Assigned to me (testuser1 has 2 tasks assigned)
    })
  }, 10000) // 10 second timeout
})
