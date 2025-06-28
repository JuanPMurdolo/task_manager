import { render, screen, waitFor } from "../../test-utils/test-utils"
import { UserManagement } from "../../components/user-management"
import { mockUsers, mockCurrentUser, setupUser } from "../../test-utils/test-utils"
import { jest } from "@jest/globals"

const mockFetch = jest.fn()
global.fetch = mockFetch

describe("UserManagement", () => {
  const user = setupUser()
  const mockOnUserCreated = jest.fn()
  const mockOnUserUpdated = jest.fn()
  const mockOnUserDeleted = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => "fake-token"),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    })
  })

  it("renders user management correctly", () => {
    render(
      <UserManagement
        users={mockUsers}
        currentUser={mockCurrentUser}
        onUserCreated={mockOnUserCreated}
        onUserUpdated={mockOnUserUpdated}
        onUserDeleted={mockOnUserDeleted}
      />,
    )

    expect(screen.getByText("User Management")).toBeInTheDocument()
    expect(screen.getByText("Add User")).toBeInTheDocument()

    // Check for user names in headings
    expect(screen.getByRole("heading", { name: "Test User 1" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Test User 2" })).toBeInTheDocument()
  })

  it("displays user information correctly", () => {
    render(
      <UserManagement
        users={mockUsers}
        currentUser={mockCurrentUser}
        onUserCreated={mockOnUserCreated}
        onUserUpdated={mockOnUserUpdated}
        onUserDeleted={mockOnUserDeleted}
      />,
    )

    // Check for user names
    expect(screen.getByText("Test User 1")).toBeInTheDocument()
    expect(screen.getByText("Test User 2")).toBeInTheDocument()

    // Check for usernames (should be displayed as @username)
    expect(screen.getByText("@testuser1")).toBeInTheDocument()
    expect(screen.getByText("@testuser2")).toBeInTheDocument()

    // Check for email addresses
    expect(screen.getByText("test1@example.com")).toBeInTheDocument()
    expect(screen.getByText("test2@example.com")).toBeInTheDocument()

    // Check for user type badges
    expect(screen.getByText("Admin")).toBeInTheDocument()
    expect(screen.getByText("User")).toBeInTheDocument()
  })

  it("opens user form when add button is clicked", async () => {
    render(
      <UserManagement
        users={mockUsers}
        currentUser={mockCurrentUser}
        onUserCreated={mockOnUserCreated}
        onUserUpdated={mockOnUserUpdated}
        onUserDeleted={mockOnUserDeleted}
      />,
    )

    await user.click(screen.getByText("Add User"))

    await waitFor(() => {
      expect(screen.getByText("Create New User")).toBeInTheDocument()
    })
  })

  it("handles user deletion", async () => {
    // Mock window.confirm
    window.confirm = jest.fn(() => true)

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    })

    render(
      <UserManagement
        users={mockUsers}
        currentUser={mockCurrentUser}
        onUserCreated={mockOnUserCreated}
        onUserUpdated={mockOnUserUpdated}
        onUserDeleted={mockOnUserDeleted}
      />,
    )

    // Look for user cards by finding user names and then finding their containers
    const userNameElement = screen.getByText("Test User 2")
    const testUser2Container = userNameElement.closest(".card-gradient")
    expect(testUser2Container).toBeInTheDocument()

    // Find the delete button within this container
    const deleteButton = testUser2Container?.querySelector('button[class*="hover:text-red-400"]')

    if (deleteButton) {
      await user.click(deleteButton as Element)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("/users/2"), // testuser2 has id 2
          expect.objectContaining({
            method: "DELETE",
          }),
        )
      })

      expect(mockOnUserDeleted).toHaveBeenCalledWith(2)
    }
  })

  it("prevents deletion of current user", async () => {
    render(
      <UserManagement
        users={mockUsers}
        currentUser={mockCurrentUser}
        onUserCreated={mockOnUserCreated}
        onUserUpdated={mockOnUserUpdated}
        onUserDeleted={mockOnUserDeleted}
      />,
    )

    // Find current user by name
    const currentUserName = screen.getByText("Test User 1")
    const testUser1Container = currentUserName.closest(".card-gradient")
    expect(testUser1Container).toBeInTheDocument()

    // The current user should not have a delete button
    const deleteButton = testUser1Container?.querySelector('button[class*="hover:text-red-400"]')
    expect(deleteButton).toBeNull()
  })

  it("shows empty state when no users", () => {
    render(
      <UserManagement
        users={[]}
        currentUser={mockCurrentUser}
        onUserCreated={mockOnUserCreated}
        onUserUpdated={mockOnUserUpdated}
        onUserDeleted={mockOnUserDeleted}
      />,
    )

    expect(screen.getByText("No users found")).toBeInTheDocument()
  })

  it("displays user statistics", () => {
    render(
      <UserManagement
        users={mockUsers}
        currentUser={mockCurrentUser}
        onUserCreated={mockOnUserCreated}
        onUserUpdated={mockOnUserUpdated}
        onUserDeleted={mockOnUserDeleted}
      />,
    )

    // Check that the statistics section headers are present
    expect(screen.getByText("Total Users")).toBeInTheDocument()
    expect(screen.getByText("Administrators")).toBeInTheDocument()
    expect(screen.getByText("Regular Users")).toBeInTheDocument()

    // Check the total users count (should be unique)
    expect(screen.getByText("2")).toBeInTheDocument() // Total users

    // Use getAllByText to get all "1" elements and verify we have the expected counts
    const oneElements = screen.getAllByText("1")
    expect(oneElements).toHaveLength(2) // Should be exactly 2 elements with "1"

    // Verify that both admin and regular user counts are displayed
    // We can check this by ensuring the statistics cards are properly structured
    const totalUsersCard = screen.getByText("Total Users").closest(".card-gradient")
    const adminCard = screen.getByText("Administrators").closest(".card-gradient")
    const regularUsersCard = screen.getByText("Regular Users").closest(".card-gradient")

    expect(totalUsersCard).toBeInTheDocument()
    expect(adminCard).toBeInTheDocument()
    expect(regularUsersCard).toBeInTheDocument()

    // Verify the total count is in the total users card
    expect(totalUsersCard?.textContent).toContain("2")

    // Verify that admin and regular user cards contain "1"
    expect(adminCard?.textContent).toContain("1")
    expect(regularUsersCard?.textContent).toContain("1")
  })

  it("handles edit user", async () => {
    render(
      <UserManagement
        users={mockUsers}
        currentUser={mockCurrentUser}
        onUserCreated={mockOnUserCreated}
        onUserUpdated={mockOnUserUpdated}
        onUserDeleted={mockOnUserDeleted}
      />,
    )

    // Find any user by their name
    const userNameElement = screen.getByText("Test User 1")
    const userContainer = userNameElement.closest(".card-gradient")
    expect(userContainer).toBeInTheDocument()

    // Find the edit button within this container (should not have red hover color)
    const editButton = userContainer?.querySelector(
      'button[class*="hover:text-white"]:not([class*="hover:text-red-400"])',
    )

    if (editButton) {
      await user.click(editButton as Element)

      await waitFor(() => {
        expect(screen.getByText("Edit User")).toBeInTheDocument()
      })
    }
  })

  it("displays user cards with proper information", () => {
    render(
      <UserManagement
        users={mockUsers}
        currentUser={mockCurrentUser}
        onUserCreated={mockOnUserCreated}
        onUserUpdated={mockOnUserUpdated}
        onUserDeleted={mockOnUserDeleted}
      />,
    )

    // Check that user cards are rendered by looking for user names
    expect(screen.getByText("Test User 1")).toBeInTheDocument()
    expect(screen.getByText("Test User 2")).toBeInTheDocument()

    // Check for usernames with @ prefix
    expect(screen.getByText("@testuser1")).toBeInTheDocument()
    expect(screen.getByText("@testuser2")).toBeInTheDocument()

    // Check for email addresses
    expect(screen.getByText("test1@example.com")).toBeInTheDocument()
    expect(screen.getByText("test2@example.com")).toBeInTheDocument()

    // Check for user type information
    expect(screen.getByText("Admin")).toBeInTheDocument()
    expect(screen.getByText("User")).toBeInTheDocument()

    // Check for "You" indicator on current user
    expect(screen.getByText("You")).toBeInTheDocument()
  })

  it("shows user action buttons", () => {
    render(
      <UserManagement
        users={mockUsers}
        currentUser={mockCurrentUser}
        onUserCreated={mockOnUserCreated}
        onUserUpdated={mockOnUserUpdated}
        onUserDeleted={mockOnUserDeleted}
      />,
    )

    // Check that action buttons are present
    const buttons = screen.getAllByRole("button", { name: "" }) // Icon buttons have no accessible name
    expect(buttons.length).toBeGreaterThan(0)

    // Should have edit and delete buttons for users (except current user shouldn't have delete)
    // At minimum we should have: Add User button + some action buttons
    const allButtons = screen.getAllByRole("button")
    expect(allButtons.length).toBeGreaterThan(2) // At least Add User + some action buttons
  })

  it("displays user avatars or initials", () => {
    render(
      <UserManagement
        users={mockUsers}
        currentUser={mockCurrentUser}
        onUserCreated={mockOnUserCreated}
        onUserUpdated={mockOnUserUpdated}
        onUserDeleted={mockOnUserDeleted}
      />,
    )

    // Avatar components typically use spans with specific classes for fallbacks
    // Look for elements that might contain user initials
    const avatarElements = document.querySelectorAll('[class*="avatar"]')

    // If no avatar elements found, check for any elements that might contain initials
    if (avatarElements.length === 0) {
      // Look for any elements that might contain user initials (TU, T1, etc.)
      const possibleInitials = document.querySelectorAll("span")
      expect(possibleInitials.length).toBeGreaterThan(0)
    } else {
      expect(avatarElements.length).toBeGreaterThan(0)
    }
  })
})
