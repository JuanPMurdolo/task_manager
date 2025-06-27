/* eslint-env jest */
import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { TaskForm } from "../components/task-form"

const mockUsers = [
    { id: 1, username: "alice", full_name: "Alice Smith" },
    { id: 2, username: "bob", full_name: "Bob Jones" },
]

const mockTask = {
    id: 123,
    title: "Test Task",
    description: "Test Description",
    status: "pending" as "pending",
    priority: "low" as "low",
    due_date: "2024-06-01T00:00:00Z",
    created_at: "2024-05-01T00:00:00Z",
    updated_at: "2024-05-02T00:00:00Z",
    created_by: "alice",
    updated_by: "bob",
    assigned_to: "1",
}

describe("TaskForm", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // @ts-ignore
        global.fetch = jest.fn()
        window.localStorage.setItem("token", "test-token")
    })

    it("renders create form with empty fields", () => {
        render(
            <TaskForm
                users={mockUsers}
                onTaskCreated={jest.fn()}
                onTaskUpdated={jest.fn()}
                onError={jest.fn()}
                onClose={jest.fn()}
            />
        )
        expect(screen.getByText("Create New Task")).toBeInTheDocument()
        expect(screen.getByLabelText("Task Title")).toHaveValue("")
        expect(screen.getByLabelText("Description")).toHaveValue("")
        expect(screen.getByText("Create Task")).toBeInTheDocument()
    })

    it("renders edit form with task data", () => {
        render(
            <TaskForm
                task={mockTask}
                users={mockUsers}
                onTaskCreated={jest.fn()}
                onTaskUpdated={jest.fn()}
                onError={jest.fn()}
                onClose={jest.fn()}
            />
        )
        expect(screen.getByText("Edit Task")).toBeInTheDocument()
        expect(screen.getByLabelText("Task Title")).toHaveValue(mockTask.title)
        expect(screen.getByLabelText("Description")).toHaveValue(mockTask.description)
        expect(screen.getByText("Update Task")).toBeInTheDocument()
    })

    it("calls onClose when Cancel button is clicked", () => {
        const onClose = jest.fn()
        render(
            <TaskForm
                users={mockUsers}
                onTaskCreated={jest.fn()}
                onTaskUpdated={jest.fn()}
                onError={jest.fn()}
                onClose={onClose}
            />
        )
        fireEvent.click(screen.getByText("Cancel"))
        expect(onClose).toHaveBeenCalled()
    })

    it("calls onClose when X button is clicked", () => {
        const onClose = jest.fn()
        render(
            <TaskForm
                users={mockUsers}
                onTaskCreated={jest.fn()}
                onTaskUpdated={jest.fn()}
                onError={jest.fn()}
                onClose={onClose}
            />
        )
        fireEvent.click(screen.getByRole("button", { name: "" }))
        expect(onClose).toHaveBeenCalled()
    })

    it("submits new task and calls onTaskCreated", async () => {
        const onTaskCreated = jest.fn()
        // @ts-ignore
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ ...mockTask, id: 999 }),
        })
        render(
            <TaskForm
                users={mockUsers}
                onTaskCreated={onTaskCreated}
                onTaskUpdated={jest.fn()}
                onError={jest.fn()}
                onClose={jest.fn()}
                currentUser={{ id: 42 }}
            />
        )
        fireEvent.change(screen.getByLabelText("Task Title"), { target: { value: "New Task" } })
        fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Some description" } })
        fireEvent.click(screen.getByText("Create Task"))
        await waitFor(() => expect(onTaskCreated).toHaveBeenCalled())
        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:8000/tasks",
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({
                    Authorization: "Bearer test-token",
                }),
            })
        )
    })

    it("submits edit and calls onTaskUpdated", async () => {
        const onTaskUpdated = jest.fn()
        // @ts-ignore
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockTask,
        })
        render(
            <TaskForm
                task={mockTask}
                users={mockUsers}
                onTaskCreated={jest.fn()}
                onTaskUpdated={onTaskUpdated}
                onError={jest.fn()}
                onClose={jest.fn()}
                currentUser={{ id: 42 }}
            />
        )
        fireEvent.change(screen.getByLabelText("Task Title"), { target: { value: "Updated Task" } })
        fireEvent.click(screen.getByText("Update Task"))
        await waitFor(() => expect(onTaskUpdated).toHaveBeenCalled())
        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:8000/tasks/123",
            expect.objectContaining({
                method: "PUT",
            })
        )
    })

    it("calls onError on failed fetch", async () => {
        const onError = jest.fn()
        // @ts-ignore
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ detail: "Some error" }),
        })
        render(
            <TaskForm
                users={mockUsers}
                onTaskCreated={jest.fn()}
                onTaskUpdated={jest.fn()}
                onError={onError}
                onClose={jest.fn()}
            />
        )
        fireEvent.change(screen.getByLabelText("Task Title"), { target: { value: "Fail Task" } })
        fireEvent.change(screen.getByLabelText("Description"), { target: { value: "desc" } })
        fireEvent.click(screen.getByText("Create Task"))
        await waitFor(() => expect(onError).toHaveBeenCalledWith("Some error"))
    })

    it("calls onError on network error", async () => {
        const onError = jest.fn()
        // @ts-ignore
        global.fetch.mockRejectedValueOnce(new Error("Network error"))
        render(
            <TaskForm
                users={mockUsers}
                onTaskCreated={jest.fn()}
                onTaskUpdated={jest.fn()}
                onError={onError}
                onClose={jest.fn()}
            />
        )
        fireEvent.change(screen.getByLabelText("Task Title"), { target: { value: "Fail Task" } })
        fireEvent.change(screen.getByLabelText("Description"), { target: { value: "desc" } })
        fireEvent.click(screen.getByText("Create Task"))
        await waitFor(() => expect(onError).toHaveBeenCalledWith("Network error. Please try again."))
    })
})