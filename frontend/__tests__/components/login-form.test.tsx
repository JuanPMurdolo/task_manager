/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "../test-utils/test-utils"
import { LoginForm } from "../../components/login-form"
import { setupUser } from "../test-utils/test-utils"

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

    expect(screen.getByText("Welcome Back")).toBeInTheDocument()
    expect(screen.getByText("Sign in to your account")).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("handles successful login", async () => {
    const mockResponse = {
      access_token: "test-token",
      token_type: "bearer",
      user: {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        full_name: "Test Userr",
        role: "admin",
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

  it("shows loading state during login", async () => {
    mockFetch.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

    render(<LoginForm onLogin={mockOnLogin} />)

    await user.type(screen.getByLabelText(/username/i), "testuser")
    await user.type(screen.getByLabelText(/password/i), "password123")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    expect(screen.getByText("Signing in...")).toBeInTheDocument()
  })

  it("validates required fields", async () => {
    render(<LoginForm onLogin={mockOnLogin} />)

    await user.click(screen.getByRole("button", { name: /sign in/i }))

    // Form should not submit without required fields
    expect(mockFetch).not.toHaveBeenCalled()
    expect(mockOnLogin).not.toHaveBeenCalled()
  })
})
