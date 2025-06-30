"use client"

import { render, screen, waitFor } from "../../test-utils/test-utils"
import { UserForm } from "../../components/users/user-form"
import { mockUsers, setupUser } from "../../test-utils/test-utils"
import { jest } from "@jest/globals"

const mockFetch = jest.fn()
global.fetch = mockFetch

describe("UserForm", () => {
  const user = setupUser()
  const mockOnClose = jest.fn()
  const mockOnUserCreated = jest.fn()
  const mockOnUserUpdated = jest.fn()
  const mockOnError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  it("renders create form correctly", () => {
    render(
      <UserForm
        onClose={mockOnClose}
        onUserCreated={mockOnUserCreated}
        onUserUpdated={mockOnUserUpdated}
        onError={mockOnError}
      />,
    )

    expect(screen.getByText("Create New User")).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()

    // Use specific selectors for password fields instead of getByLabelText
    expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Confirm password")).toBeInTheDocument()

    // Use text content instead of getByLabelText for User Type since it's a Select component
    expect(screen.getByText("User Type")).toBeInTheDocument()
  })

  it("renders edit form correctly", () => {
    render(
      <UserForm
        user={mockUsers[0]}
        onClose={mockOnClose}
        onUserCreated={mockOnUserCreated}
        onUserUpdated={mockOnUserUpdated}
        onError={mockOnError}
      />,
    )

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
      type: "user",
      is_active: true,
      created_at: "2024-01-03T00:00:00Z",
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(newUser),
    })

    render(
      <UserForm
        onClose={mockOnClose}
        onUserCreated={mockOnUserCreated}
        onUserUpdated={mockOnUserUpdated}
        onError={mockOnError}
      />,
    )

    await user.type(screen.getByLabelText(/username/i), "newuser")
    await user.type(screen.getByLabelText(/email/i), "new@example.com")
    await user.type(screen.getByLabelText(/full name/i), "New User")

    // Use more specific selectors for password fields
    const passwordInput = screen.getByPlaceholderText("Enter password")
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm password")

    await user.type(passwordInput, "password123")
    await user.type(confirmPasswordInput, "password123")

    await user.click(screen.getByRole("button", { name: /create user/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/register"),
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer null",
          },
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

    render(
      <UserForm
        user={mockUsers[0]}
        onClose={mockOnClose}
        onUserCreated={mockOnUserCreated}
        onUserUpdated={mockOnUserUpdated}
        onError={mockOnError}
      />,
    )

    const nameInput = screen.getByDisplayValue("Test User 1")
    await user.clear(nameInput)
    await user.type(nameInput, "Updated User")

    await user.click(screen.getByRole("button", { name: /update user/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/1"),
        expect.objectContaining({
          method: "PUT",
        }),
      )
    })

    expect(mockOnUserUpdated).toHaveBeenCalledWith(updatedUser)
  })

  it("shows validation errors for password mismatch", async () => {
    render(
      <UserForm
        onClose={mockOnClose}
        onUserCreated={mockOnUserCreated}
        onUserUpdated={mockOnUserUpdated}
        onError={mockOnError}
      />,
    )

    await user.type(screen.getByLabelText(/username/i), "newuser")
    await user.type(screen.getByLabelText(/email/i), "new@example.com")

    // Use more specific selectors for password fields
    const passwordInput = screen.getByPlaceholderText("Enter password")
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm password")

    await user.type(passwordInput, "password123")
    await user.type(confirmPasswordInput, "different")

    await user.click(screen.getByRole("button", { name: /create user/i }))

    // Should not submit with mismatched passwords
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("handles API errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({ detail: "Username already exists" }),
    })

    render(
      <UserForm
        onClose={mockOnClose}
        onUserCreated={mockOnUserCreated}
        onUserUpdated={mockOnUserUpdated}
        onError={mockOnError}
      />,
    )

    await user.type(screen.getByLabelText(/username/i), "existinguser")
    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/full name/i), "Test User")

    // Use more specific selectors for password fields
    const passwordInput = screen.getByPlaceholderText("Enter password")
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm password")

    await user.type(passwordInput, "password123")
    await user.type(confirmPasswordInput, "password123")
    await user.click(screen.getByRole("button", { name: /create user/i }))

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith("Username already exists")
    })
  })

  it("closes form when cancel is clicked", async () => {
    render(
      <UserForm
        onClose={mockOnClose}
        onUserCreated={mockOnUserCreated}
        onUserUpdated={mockOnUserUpdated}
        onError={mockOnError}
      />,
    )

    await user.click(screen.getByRole("button", { name: /cancel/i }))

    expect(mockOnClose).toHaveBeenCalled()
  })

  it("shows password fields only in create mode", () => {
    render(
      <UserForm
        onClose={mockOnClose}
        onUserCreated={mockOnUserCreated}
        onUserUpdated={mockOnUserUpdated}
        onError={mockOnError}
      />,
    )

    // In create mode, both password fields should be present
    expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Confirm password")).toBeInTheDocument()
  })

  it("shows optional password field in edit mode", () => {
    render(
      <UserForm
        user={mockUsers[0]}
        onClose={mockOnClose}
        onUserCreated={mockOnUserCreated}
        onUserUpdated={mockOnUserUpdated}
        onError={mockOnError}
      />,
    )

    // In edit mode, only optional new password field should be present
    expect(screen.getByPlaceholderText("Leave blank to keep current password")).toBeInTheDocument()
    expect(screen.queryByPlaceholderText("Confirm password")).not.toBeInTheDocument()
  })

  it("displays user type selection", () => {
    render(
      <UserForm
        onClose={mockOnClose}
        onUserCreated={mockOnUserCreated}
        onUserUpdated={mockOnUserUpdated}
        onError={mockOnError}
      />,
    )

    // Check that the user type section is rendered
    expect(screen.getByText("User Type")).toBeInTheDocument()
  })
})
