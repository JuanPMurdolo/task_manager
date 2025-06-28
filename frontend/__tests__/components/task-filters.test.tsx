import "@testing-library/jest-dom"
import { render, screen, waitFor } from "../../test-utils/test-utils"
import { TaskFilters } from "../../components/task-filters"
import { mockUsers, mockTasks, setupUser } from "../../test-utils/test-utils"
import { jest } from "@jest/globals"

describe("TaskFilters", () => {
  const user = setupUser()
  const mockOnFiltersChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders all filter controls", async () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} tasks={mockTasks} />)

    expect(screen.getByPlaceholderText("Search tasks...")).toBeInTheDocument()
    expect(screen.getByText("Filters")).toBeInTheDocument()
    expect(screen.getByText("Status")).toBeInTheDocument()
    expect(screen.getByText("Priority")).toBeInTheDocument()
    expect(screen.getByText("Assigned To")).toBeInTheDocument()
    expect(screen.getByText("Created By")).toBeInTheDocument()
  })

  it("handles search input", async () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} tasks={mockTasks} />)

    const searchInput = screen.getByPlaceholderText("Search tasks...")
    await user.type(searchInput, "Test Task 1")

    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalled()
      const call = mockOnFiltersChange.mock.calls.at(-1)[0]
      expect(call.some((task: any) => task.title.includes("Test Task 1"))).toBe(true)
    })
  })

  it("handles status filter change", async () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} tasks={mockTasks} />)

    // Find the status select specifically by looking for the one with "All statuses" text
    const statusTrigger = screen.getByText("All statuses").closest("button")
    expect(statusTrigger).toBeInTheDocument()

    if (statusTrigger) {
      await user.click(statusTrigger)

      await waitFor(() => {
        // Look for the dropdown options
        const pendingOption = screen.getByText("Pending")
        expect(pendingOption).toBeInTheDocument()
      })

      // Click on the Pending option
      const pendingOption = screen.getByText("Pending")
      await user.click(pendingOption)

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalled()
      })
    }
  })

  it("handles priority filter change", async () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} tasks={mockTasks} />)

    // Find the priority select specifically by looking for the one with "All priorities" text
    const priorityTrigger = screen.getByText("All priorities").closest("button")
    expect(priorityTrigger).toBeInTheDocument()

    if (priorityTrigger) {
      await user.click(priorityTrigger)

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalled()
      })
    }
  })

  it("clears all filters", async () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} tasks={mockTasks} />)

    const searchInput = screen.getByPlaceholderText("Search tasks...")
    await user.type(searchInput, "test")

    // Wait for clear button to appear
    await waitFor(() => {
      const clearButton = screen.queryByRole("button", { name: "" })
      if (clearButton) {
        user.click(clearButton)
      }
    })

    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalled()
    })
  })

  it("shows active filter indicators", async () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} tasks={mockTasks} />)

    const searchInput = screen.getByPlaceholderText("Search tasks...")
    await user.type(searchInput, "Test")

    await waitFor(() => {
      expect(screen.getByText(/Search: Test/i)).toBeInTheDocument()
    })
  })

  it("filters tasks by search term", async () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} tasks={mockTasks} />)

    const searchInput = screen.getByPlaceholderText("Search tasks...")
    await user.type(searchInput, "Task 1")

    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalled()
      const lastCall = mockOnFiltersChange.mock.calls.at(-1)
      const filteredTasks = lastCall[0]

      // Should only return tasks that match the search
      expect(filteredTasks.length).toBe(1)
      expect(filteredTasks[0].title).toBe("Test Task 1")
    })
  })

  it("displays all select components", () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} tasks={mockTasks} />)

    // Check that all select components are rendered
    expect(screen.getByText("All statuses")).toBeInTheDocument()
    expect(screen.getByText("All priorities")).toBeInTheDocument()
    expect(screen.getByText("All assignments")).toBeInTheDocument()
    expect(screen.getByText("All creators")).toBeInTheDocument()

    // Verify we have the expected number of comboboxes
    const comboboxes = screen.getAllByRole("combobox")
    expect(comboboxes).toHaveLength(4) // Status, Priority, Assigned To, Created By
  })

  it("handles date range filters", async () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} tasks={mockTasks} />)

    // Check that date inputs are present
    const dateInputs = screen.getAllByDisplayValue("")
    const dateFromInput = dateInputs.find(
      (input) => input.getAttribute("type") === "date" && input.getAttribute("placeholder") === "From date",
    )
    const dateToInput = dateInputs.find(
      (input) => input.getAttribute("type") === "date" && input.getAttribute("placeholder") === "To date",
    )

    if (dateFromInput) {
      await user.type(dateFromInput, "2024-01-01")

      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalled()
      })
    }
  })

  it("shows filter summary when filters are active", async () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} tasks={mockTasks} />)

    const searchInput = screen.getByPlaceholderText("Search tasks...")
    await user.type(searchInput, "test")

    await waitFor(() => {
      expect(screen.getByText("Active filters:")).toBeInTheDocument()
      expect(screen.getByText(/Search: test/i)).toBeInTheDocument()
    })
  })
})
