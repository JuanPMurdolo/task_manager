/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "../../test-utils/test-utils"
import { LoginForm } from "../../components/auth/login-form"
import { setupUser } from "../../test-utils/test-utils"

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe("LoginForm", () => {
  const mockOnLogin = jest.fn()
  const user = setupUser()

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  it("renders login form correctly", () => {
    render(<LoginForm onLogin={mockOnLogin} />)

    expect(screen.getByText("Welcome")).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("renders register form when switching tabs", async () => {
    render(<LoginForm onLogin={mockOnLogin} />)

    await user.click(screen.getByRole("tab", { name: /register/i }))

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
  })

  it("handles successful login", async () => {
    const mockResponse = {
      access_token: "test-token",
      token_type: "bearer",
      user: {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        full_name: "Test User",
        type: "admin",
      },
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    })

    render(<LoginForm onLogin={mockOnLogin} />)

    await user.type(screen.getByLabelText(/username/i), "testuser")
    await user.type(screen.getByLabelText(/password/i), "password123")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith(mockResponse.user)
    })
  })

  it("handles login error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({ detail: "Invalid credentials" }),
    })

    render(<LoginForm onLogin={mockOnLogin} />)

    await user.type(screen.getByLabelText(/username/i), "wronguser")
    await user.type(screen.getByLabelText(/password/i), "wrongpass")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument()
    })
    expect(mockOnLogin).not.toHaveBeenCalled()
  })

  it("handles successful registration", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ message: "User created successfully" }),
    })

    render(<LoginForm onLogin={mockOnLogin} />)

    await user.click(screen.getByRole("tab", { name: /register/i }))

    await user.type(screen.getByLabelText(/username/i), "newuser")
    await user.type(screen.getByLabelText(/email/i), "new@example.com")
    await user.type(screen.getByLabelText(/full name/i), "New User")
    await user.type(screen.getAllByLabelText(/password/i)[0], "password123")
    await user.type(screen.getByLabelText(/confirm password/i), "password123")
    await user.click(screen.getByRole("button", { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText("Registration successful! Please login with your credentials.")).toBeInTheDocument()
    })
  })

  it("shows loading state during login", async () => {
    mockFetch.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

    render(<LoginForm onLogin={mockOnLogin} />)

    await user.type(screen.getByLabelText(/username/i), "testuser")
    await user.type(screen.getByLabelText(/password/i), "password123")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    expect(screen.getByText("Signing in...")).toBeInTheDocument()
  })

  it("validates password confirmation in registration", async () => {
    render(<LoginForm onLogin={mockOnLogin} />)

    await user.click(screen.getByRole("tab", { name: /register/i }))

    await user.type(screen.getByLabelText(/username/i), "newuser")
    await user.type(screen.getByLabelText(/email/i), "new@example.com")
    await user.type(screen.getByLabelText(/full name/i), "New User")
    await user.type(screen.getAllByLabelText(/password/i)[0], "password123")
    await user.type(screen.getByLabelText(/confirm password/i), "different")
    await user.click(screen.getByRole("button", { name: /create account/i }))

    await waitFor(() => {
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      // This will now pass because the component has aria-invalid
      expect(confirmPasswordInput).toBeInvalid()
      // This will also pass because the error message is displayed
      expect(screen.getByText("Passwords do not match.")).toBeInTheDocument()
    })

    // Verify no API call was made
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
