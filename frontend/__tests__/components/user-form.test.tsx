"use client"
import { render, screen, waitFor } from "../test-utils/test-utils"
import { UserForm } from "../../components/user-form"
import { mockUsers, setupUser } from "../test-utils/test-utils"

const mockFetch = jest.fn()
global.fetch = mockFetch

describe("UserForm", () => {
  const user = setupUser()
  const mockOnClose = jest.fn()
  const mockOnUserCreated = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  it("renders create form correctly", () => {
    render(<UserForm isOpen={true} onClose={mockOnClose} onUserCreated={mockOnUserCreated} />)

    expect(screen.getByText("Create New User")).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument()
  })

  it("renders edit form correctly", () => {
    render(<UserForm isOpen={true} onClose={mockOnClose} onUserCreated={mockOnUserCreated} user={mockUsers[0]} />)

    expect(screen.getByText("Edit User")).toBeInTheDocument()
    expect(screen.getByDisplayValue("testuser1")).toBeInTheDocument()
    expect(screen.getByDisplayValue("test1@example.com")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Test User 1")).toBeInTheDocument()
  })

  it("handles form submission for new user", async () => {
    const newUser = {
      id: 3,
      username: "newuser",
      email: "new@example.com",
      full_name: "New User",
      role: "user",
      is_active: true,
      created_at: "2024-01-03T00:00:00Z",
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(newUser),
    })

    render(<UserForm isOpen={true} onClose={mockOnClose} onUserCreated={mockOnUserCreated} />)

    await user.type(screen.getByLabelText(/username/i), "newuser")
    await user.type(screen.getByLabelText(/email/i), "new@example.com")
    await user.type(screen.getByLabelText(/full name/i), "New User")
    await user.type(screen.getByLabelText(/password/i), "password123")
    await user.selectOptions(screen.getByLabelText(/role/i), "user")

    await user.click(screen.getByRole("button", { name: /create user/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/users"),
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "newuser",
            email: "new@example.com",
            full_name: "New User",
            password: "password123",
            role: "user",
          }),
        }),
      )
    })

    expect(mockOnUserCreated).toHaveBeenCalledWith(newUser)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it("handles form submission for user update", async () => {
    const updatedUser = { ...mockUsers[0], full_name: "Updated User" }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(updatedUser),
    })

    render(<UserForm isOpen={true} onClose={mockOnClose} onUserCreated={mockOnUserCreated} user={mockUsers[0]} />)

    const nameInput = screen.getByDisplayValue("Test User 1")
    await user.clear(nameInput)
    await user.type(nameInput, "Updated User")

    await user.click(screen.getByRole("button", { name: /update user/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/users/1"),
        expect.objectContaining({
          method: "PUT",
        }),
      )
    })
  })

  it("shows validation errors", async () => {
    render(<UserForm isOpen={true} onClose={mockOnClose} onUserCreated={mockOnUserCreated} />)

    await user.click(screen.getByRole("button", { name: /create user/i }))

    // Should not submit without required fields
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("handles API errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({ detail: "Username already exists" }),
    })

    render(<UserForm isOpen={true} onClose={mockOnClose} onUserCreated={mockOnUserCreated} />)

    await user.type(screen.getByLabelText(/username/i), "existinguser")
    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/full name/i), "Test User")
    await user.type(screen.getByLabelText(/password/i), "password123")
    await user.click(screen.getByRole("button", { name: /create user/i }))

    await waitFor(() => {
      expect(screen.getByText("Username already exists")).toBeInTheDocument()
    })
  })

  it("shows loading state during submission", async () => {
    mockFetch.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

    render(<UserForm isOpen={true} onClose={mockOnClose} onUserCreated={mockOnUserCreated} />)

    await user.type(screen.getByLabelText(/username/i), "newuser")
    await user.type(screen.getByLabelText(/email/i), "new@example.com")
    await user.type(screen.getByLabelText(/full name/i), "New User")
    await user.type(screen.getByLabelText(/password/i), "password123")
    await user.click(screen.getByRole("button", { name: /create user/i }))

    expect(screen.getByText("Creating...")).toBeInTheDocument()
  })

  it("closes form when cancel is clicked", async () => {
    render(<UserForm isOpen={true} onClose={mockOnClose} onUserCreated={mockOnUserCreated} />)

    await user.click(screen.getByRole("button", { name: /cancel/i }))

    expect(mockOnClose).toHaveBeenCalled()
  })

  it("hides password field in edit mode", () => {
    render(<UserForm isOpen={true} onClose={mockOnClose} onUserCreated={mockOnUserCreated} user={mockUsers[0]} />)

    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument()
  })
})
