import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta

@pytest.mark.asyncio
async def test_create_task(test_client, get_token_headers):
    headers = await get_token_headers("alice")
    response = await test_client.post(
        "/tasks",
        json={
            "title": "Test Task",
            "description": "Test Desc",
            "status": "pending",
            "priority": "medium"
        },
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["description"] == "Test Desc"
    assert data["status"] == "pending" 
    
@pytest.mark.asyncio
async def test_create_task_invalid_status(test_client: AsyncClient, get_token_headers):
    headers = await get_token_headers("admin", "adminpass")

    payload = {
        "title": "Bad Task",
        "description": "Bad data",
        "status": "not_a_status",  # <- inválido
        "priority": "medium"
    }

    response = await test_client.post("/tasks", json=payload, headers=headers)
    assert response.status_code == 422  # FastAPI validation
    
@pytest.mark.asyncio
async def test_update_task(test_client, create_test_user, get_token_headers):
    user = await create_test_user("bob", "test123")
    headers = await get_token_headers("bob", "test123")

    # Crear una tarea
    create_payload = {
        "title": "Original Task",
        "description": "Original Description",
        "status": "pending",
        "priority": "low",
    }
    create_response = await test_client.post("/tasks", json=create_payload, headers=headers)
    task_id = create_response.json()["id"]

    # Actualizar la tarea
    update_payload = {
        "status": "in_progress",
        "priority": "high"
    }
    update_response = await test_client.put(f"/tasks/{task_id}", json=update_payload, headers=headers)
    assert update_response.status_code == 200
    updated_data = update_response.json()
    assert updated_data["status"] == "in_progress"
    assert updated_data["priority"] == "high"
    
@pytest.mark.asyncio
async def test_list_tasks_pagination(test_client, create_test_user, get_token_headers):
    user = await create_test_user("alice", "1234")
    headers = await get_token_headers("alice", "1234")

    # Crear varias tareas
    for i in range(15):
        await test_client.post("/tasks", json={
            "title": f"Task {i}",
            "description": "Desc",
            "status": "pending",
            "priority": "medium"
        }, headers=headers)

    # Obtener primeras 10
    response = await test_client.get("/tasks?skip=0&limit=10", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 10

    # Obtener las siguientes
    response = await test_client.get("/tasks?skip=10&limit=10", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 5
    
@pytest.mark.asyncio
async def test_bulk_update_tasks(test_client, create_test_user, get_token_headers):
    user = await create_test_user("admin", "1234")
    headers = await get_token_headers("admin", "1234")

    # Crear tareas
    task_ids = []
    for i in range(3):
        res = await test_client.post("/tasks", json={
            "title": f"Bulk {i}",
            "description": "Desc",
            "status": "pending",
            "priority": "low"
        }, headers=headers)
        task_ids.append(res.json()["id"])

    # Hacer bulk update
    bulk_payload = {
        "task_ids": task_ids,
        "status": "completed",
        "priority": "high"
    }
    response = await test_client.post("/tasks/bulk_update", json=bulk_payload, headers=headers)
    assert response.status_code == 200
    for task in response.json():
        assert task["status"] == "completed"
        assert task["priority"] == "high"
        
@pytest.mark.asyncio
async def test_get_tasks_by_priority(test_client, create_test_user, get_token_headers):
    user = await create_test_user("user1", "pass")
    headers = await get_token_headers("user1", "pass")

    # Crear tareas con distintas prioridades
    await test_client.post("/tasks", json={
        "title": "P1",
        "description": "desc",
        "status": "pending",
        "priority": "low"
    }, headers=headers)

    await test_client.post("/tasks", json={
        "title": "P2",
        "description": "desc",
        "status": "pending",
        "priority": "medium"
    }, headers=headers)

    await test_client.post("/tasks", json={
        "title": "P3",
        "description": "desc",
        "status": "pending",
        "priority": "medium"
    }, headers=headers)

    # Buscar las medium
    response = await test_client.get("/tasks/priority/medium", headers=headers)
    assert response.status_code == 200
    tasks = response.json()
    assert all(task["priority"] == "medium" for task in tasks)

from datetime import datetime, timedelta

@pytest.mark.asyncio
async def test_get_overdue_tasks(test_client, create_test_user, get_token_headers):
    user = await create_test_user("juan", "clave")
    headers = await get_token_headers("juan", "clave")

    past_due_date = (datetime.utcnow() - timedelta(days=2)).isoformat()
    future_due_date = (datetime.utcnow() + timedelta(days=2)).isoformat()

    # Tarea vencida
    await test_client.post("/tasks", json={
        "title": "Overdue",
        "description": "Late",
        "status": "pending",
        "priority": "low",
        "due_date": past_due_date
    }, headers=headers)

    # Tarea futura
    await test_client.post("/tasks", json={
        "title": "Not Overdue",
        "description": "On time",
        "status": "pending",
        "priority": "low",
        "due_date": future_due_date
    }, headers=headers)

    # Buscar vencidas
    response = await test_client.get("/tasks/overdue", headers=headers)
    assert response.status_code == 200
    tasks = response.json()
    assert any("Overdue" in task["title"] for task in tasks)
    assert all(task["status"] != "completed" for task in tasks)
    
@pytest.mark.asyncio
async def test_create_task_unauthorized(test_client):
    payload = {
        "title": "Unauthorized Task",
        "description": "No auth",
        "status": "pending",
        "priority": "low"
    }
    response = await test_client.post("/tasks", json=payload)
    assert response.status_code == 401