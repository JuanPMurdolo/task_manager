import { render, screen, waitFor } from "../test-utils/test-utils"
import { TaskFilters } from "../../components/task-filters"
import { mockUsers, setupUser } from "../test-utils/test-utils"

describe("TaskFilters", () => {
  const user = setupUser()
  const mockOnFiltersChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders all filter controls", () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} />)

    expect(screen.getByPlaceholderText(/search tasks/i)).toBeInTheDocument()
    expect(screen.getByText("All Statuses")).toBeInTheDocument()
    expect(screen.getByText("All Priorities")).toBeInTheDocument()
    expect(screen.getByText("All Users")).toBeInTheDocument()
  })

  it("handles search input", async () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} />)

    const searchInput = screen.getByPlaceholderText(/search tasks/i)
    await user.type(searchInput, "test search")

    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        search: "test search",
        status: "",
        priority: "",
        assignedTo: "",
      })
    })
  })

  it("handles status filter change", async () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} />)

    await user.click(screen.getByText("All Statuses"))
    await user.click(screen.getByText("Pending"))

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      search: "",
      status: "pending",
      priority: "",
      assignedTo: "",
    })
  })

  it("handles priority filter change", async () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} />)

    await user.click(screen.getByText("All Priorities"))
    await user.click(screen.getByText("High"))

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      search: "",
      status: "",
      priority: "high",
      assignedTo: "",
    })
  })

  it("handles assigned user filter change", async () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} />)

    await user.click(screen.getByText("All Users"))
    await user.click(screen.getByText("Test User 1"))

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      search: "",
      status: "",
      priority: "",
      assignedTo: "1",
    })
  })

  it("clears all filters", async () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} />)

    // Set some filters first
    await user.type(screen.getByPlaceholderText(/search tasks/i), "test")
    await user.click(screen.getByText("All Statuses"))
    await user.click(screen.getByText("Pending"))

    // Clear filters
    await user.click(screen.getByText("Clear Filters"))

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      search: "",
      status: "",
      priority: "",
      assignedTo: "",
    })
  })

  it("shows active filter count", async () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} />)

    await user.type(screen.getByPlaceholderText(/search tasks/i), "test")
    await user.click(screen.getByText("All Statuses"))
    await user.click(screen.getByText("Pending"))

    await waitFor(() => {
      expect(screen.getByText("Clear Filters (2)")).toBeInTheDocument()
    })
  })
})
