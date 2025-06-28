import { render, screen, waitFor, within } from "../test-utils/test-utils"
import userEvent from "@testing-library/user-event"
import { TaskFilters } from "../../components/task-filters"
import { mockUsers, mockTasks, setupUser } from "../test-utils/test-utils"
describe("TaskFilters", () => {
  const user = setupUser()
  const mockOnFiltersChange = jest.fn()

  beforeEach(() => {
    const portalRoot = document.createElement("div")
    portalRoot.setAttribute("id", "radix-portal")
    document.body.appendChild(portalRoot)
  })
  
  afterEach(() => {
    const portal = document.getElementById("radix-portal")
    if (portal) {
      portal.remove()
    }
  })

  it("renders all filter controls", async () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} tasks={mockTasks} />)

    expect(await screen.findByPlaceholderText("Search tasks...")).toBeInTheDocument()
    expect(await screen.findByText("Filters")).toBeInTheDocument()
    expect(await screen.findByText("Status")).toBeInTheDocument()
    expect(await screen.findByText("Priority")).toBeInTheDocument()
    expect(await screen.findByText("Assigned To")).toBeInTheDocument()
    expect(await screen.findByText("Created By")).toBeInTheDocument()
  })

  it("handles search input", async () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} tasks={mockTasks} />)

    const searchInput = await screen.findByPlaceholderText("Search tasks...")
    await user.type(searchInput, "Test Task 1")

    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalled()
      const call = mockOnFiltersChange.mock.calls.at(-1)[0]
      expect(call.every((task: any) => task.title.includes("Test Task 1"))).toBe(true)
    })
  })

  it("handles status filter change", async () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} tasks={mockTasks} />)

    const trigger = screen.getAllByText("All statuses")[0]
    await user.click(trigger)
    await user.click(await screen.findByText("Pending"))

    await waitFor(() => {
      const call = mockOnFiltersChange.mock.calls.at(-1)[0]
      expect(call.every((task: any) => task.status === "pending")).toBe(true)
    })
  })

  it("handles priority filter change", async () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} tasks={mockTasks} />)

    const priorityTrigger = screen.getAllByRole("combobox").find((el) =>
      el.textContent?.includes("All priorities")
    )!
    await user.click(priorityTrigger)

    await waitFor(() => {
      const call = mockOnFiltersChange.mock.calls.at(-1)[0]
      expect(call.every((task: any) => task.priority === "high")).toBe(true)
    })
  })

  it("handles assigned user filter change", async () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} tasks={mockTasks} />)

    const trigger = screen.getAllByText("All assignments")[0]
    await user.click(trigger)
    await user.click(await screen.findByText("Test User 1"))

    await waitFor(() => {
      const call = mockOnFiltersChange.mock.calls.at(-1)[0]
      expect(call.every((task: any) => task.assigned_to === "1")).toBe(true)
    })
  })

  it("clears all filters", async () => {
    render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} tasks={mockTasks} />)

    const searchInput = await screen.findByPlaceholderText("Search tasks...")
    await user.type(searchInput, "test")

    const statusTrigger = screen.getAllByText("All statuses")[0]
    await user.click(await screen.findByText("Pending"))

    await user.click(await screen.findByRole("button", { name: /clear/i }))

    await waitFor(() => {
      const call = mockOnFiltersChange.mock.calls.at(-1)[0]
      expect(call.length).toBeGreaterThan(0) // todos los tasks, sin filtros
    })
  })

it("shows active filter count", async () => {
  render(<TaskFilters onFiltersChange={mockOnFiltersChange} users={mockUsers} tasks={mockTasks} />)

  const searchInput = await screen.findByPlaceholderText("Search tasks...")
  await user.type(searchInput, "Test")

  // Abrimos el dropdown de Status
  const statusCombobox = screen.getAllByRole("combobox")[0]
  await user.click(statusCombobox)

  // Esperamos a que aparezca alguna opción con el texto Pending
  const pendingOption = await screen.findByText((content, element) =>
    content.trim().toLowerCase() === "pending" ||
    element?.textContent?.trim().toLowerCase() === "pending"
  , {}, { timeout: 3000 })

  await user.click(pendingOption)

  // Ahora validamos que se actualicen los filtros activos
  await waitFor(() => {
    expect(screen.getByText(/Active filters:/i)).toBeInTheDocument()
    expect(screen.getByText(/Search: Test/i)).toBeInTheDocument()
    expect(screen.getByText(/Status: pending/i)).toBeInTheDocument()
  })
})
})
