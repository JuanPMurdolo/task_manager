import { render, screen, waitFor } from "../test-utils/test-utils"
import { UserManagement } from "../../components/user-management"
import { mockUsers, setupUser } from "../test-utils/test-utils"


const mockFetch = jest.fn()
global.fetch = mockFetch

describe("UserManagement", () => {
  const user = setupUser()

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  it("renders user management correctly", () => {
    render(<UserManagement users={mockUsers} onUsersUpdate={jest.fn()} />)

    expect(screen.getByText("User Management")).toBeInTheDocument()
    expect(screen.getByText("Add New User")).toBeInTheDocument()
    expect(screen.getByText("testuser1")).toBeInTheDocument()
    expect(screen.getByText("testuser2")).toBeInTheDocument()
  })

  it("displays user information correctly", () => {
    render(<UserManagement users={mockUsers} onUsersUpdate={jest.fn()} />)

    expect(screen.getByText("test1@example.com")).toBeInTheDocument()
    expect(screen.getByText("test2@example.com")).toBeInTheDocument()
    expect(screen.getByText("Test User 1")).toBeInTheDocument()
    expect(screen.getByText("Test User 2")).toBeInTheDocument()
    expect(screen.getByText("ADMIN")).toBeInTheDocument()
    expect(screen.getByText("USER")).toBeInTheDocument()
  })

  it("opens user form when add button is clicked", async () => {
    render(<UserManagement users={mockUsers} onUsersUpdate={jest.fn()} />)

    await user.click(screen.getByText("Add New User"))

    await waitFor(() => {
      expect(screen.getByText("Create New User")).toBeInTheDocument()
    })
  })

  it("opens edit form when edit button is clicked", async () => {
    render(<UserManagement users={mockUsers} onUsersUpdate={jest.fn()} />)

    const editButtons = screen.getAllByText("Edit")
    await user.click(editButtons[0])

    await waitFor(() => {
      expect(screen.getByText("Edit User")).toBeInTheDocument()
    })
  })

  it("handles user deletion", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    })

    const mockOnUsersUpdate = jest.fn()
    render(<UserManagement users={mockUsers} onUsersUpdate={mockOnUsersUpdate} />)

    const deleteButtons = screen.getAllByText("Delete")
    await user.click(deleteButtons[0])

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/users/1"),
        expect.objectContaining({
          method: "DELETE",
        }),
      )
    })
  })

  it("shows empty state when no users", () => {
    render(<UserManagement users={[]} onUsersUpdate={jest.fn()} />)

    expect(screen.getByText("No users found")).toBeInTheDocument()
    expect(screen.getByText("Add your first user to get started")).toBeInTheDocument()
  })
})
