import pytest
from datetime import datetime, timedelta
from app.schemas.task import TaskCreate, TaskUpdate, TaskBulkUpdate
from app.repositories.task import TaskRepository

@pytest.mark.asyncio
async def test_create_task_in_db(db_session, create_test_user):
    """Test creating a task in database."""
    user = await create_test_user("task_creator", "password123")
    repo = TaskRepository(db_session))
    task_data = TaskCreate(
        title="Test Task Creation",
        description="Test task description",
        priority="medium",
        status="pending"
    )
    
    task = await repo.create_task_in_db(task_data, user.id)
    
    assert task.id is not None
    assert task.title == "Test Task Creation"
    assert task.description == "Test task description"
    assert task.priority == "medium"
    assert task.status == "pending"
    assert task.created_by == user.id
    assert task.updated_by == user.id

@pytest.mark.asyncio
async def test_get_task_by_id_in_db(db_session, create_test_user):
    """Test getting task by ID."""
    user = await create_test_user("task_getter", "password123")
    repo = TaskRepository(db_session)
    
    # Create task first
    task_data = TaskCreate(
        title="Task to Get",
        description="Task for retrieval test",
        priority="low",
        status="pending"
    )
    created_task = await repo.create_task_in_db(task_data, user.id)
    
    # Get task by ID
    retrieved_task = await repo.get_task_by_id_in_db(created_task.id)
    
    assert retrieved_task is not None
    assert retrieved_task.id == created_task.id
    assert retrieved_task.title == "Task to Get"

@pytest.mark.asyncio
async def test_get_task_by_id_not_found(db_session):
    """Test getting non-existent task by ID."""
    repo = TaskRepository(db_session)
    
    task = await repo.get_task_by_id_in_db(99999)
    assert task is None

@pytest.mark.asyncio
async def test_update_task_in_db_success(db_session, create_test_user):
    """Test updating a task successfully."""
    user = await create_test_user("task_updater", "password123")
    repo = TaskRepository(db_session)
    
    # Create initial task
    task_data = TaskCreate(
        title="Original Task",
        description="Original Description",
        priority="low",
        status="pending"
    )
    task = await repo.create_task_in_db(task_data, user.id)
    
    # Update task
    update_data = TaskUpdate(
        title="Updated Task",
        description="Updated Description",
        priority="high",
        status="in_progress"
    )
    
    updated_task = await repo.update_task_in_db(task.id, update_data, user.id)
    
    assert updated_task is not None
    assert updated_task.title == "Updated Task"
    assert updated_task.description == "Updated Description"
    assert updated_task.priority == "high"
    assert updated_task.status == "in_progress"
    assert updated_task.updated_by == user.id

@pytest.mark.asyncio
async def test_update_task_in_db_not_found(db_session, create_test_user):
    """Test updating a non-existent task."""
    user = await create_test_user("task_updater", "password123")
    repo = TaskRepository(db_session)
    
    update_data = TaskUpdate(title="Non-existent Task")
    result = await repo.update_task_in_db(99999, update_data, user.id)
    
    assert result is None

@pytest.mark.asyncio
async def test_update_task_partial_update(db_session, create_test_user):
    """Test partial task update."""
    user = await create_test_user("partial_updater", "password123")
    repo = TaskRepository(db_session)
    
    # Create initial task
    task_data = TaskCreate(
        title="Original Task",
        description="Original Description",
        priority="low",
        status="pending"
    )
    task = await repo.create_task_in_db(task_data, user.id)
    
    # Partial update - only title
    update_data = TaskUpdate(title="Partially Updated Task")
    updated_task = await repo.update_task_in_db(task.id, update_data, user.id)
    
    assert updated_task is not None
    assert updated_task.title == "Partially Updated Task"
    assert updated_task.description == "Original Description"  # Should remain unchanged
    assert updated_task.priority == "low"  # Should remain unchanged
    assert updated_task.status == "pending"  # Should remain unchanged

@pytest.mark.asyncio
async def test_bulk_update_tasks_in_db(db_session, create_test_user):
    """Test bulk updating tasks."""
    user = await create_test_user("bulk_updater", "password123")
    repo = TaskRepository(db_session)
    
    # Create multiple tasks
    tasks = []
    for i in range(3):
        task_data = TaskCreate(
            title=f"Bulk Task {i+1}",
            description=f"Description {i+1}",
            priority="low",
            status="pending"
        )
        task = await repo.create_task_in_db(task_data, user.id)
        tasks.append(task)
    
    # Bulk update
    task_ids = [task.id for task in tasks]
    update_data = TaskBulkUpdate(task_ids = task_ids, status="completed", priority="high")
    
    updated_tasks = await repo.bulk_update_tasks_in_db(task_ids, update_data, user.id)
    
    assert len(updated_tasks) == 3
    for task in updated_tasks:
        assert task.status == "completed"
        assert task.priority == "high"
        assert task.updated_by == user.id

@pytest.mark.asyncio
async def test_get_all_tasks_in_db(db_session, create_test_user):
    """Test getting all tasks with pagination."""
    user = await create_test_user("task_lister", "password123")
    repo = TaskRepository(db_session)
    
    # Create multiple tasks
    for i in range(5):
        task_data = TaskCreate(
            title=f"List Task {i+1}",
            description=f"Description {i+1}",
            priority="medium",
            status="pending"
        )
        await repo.create_task_in_db(task_data, user.id)
    
    # Get all tasks
    tasks = await repo.get_all_tasks_in_db(skip=0, limit=10)
    
    assert len(tasks) >= 5  # At least the 5 we created
    
    # Test pagination
    first_page = await repo.get_all_tasks_in_db(skip=0, limit=2)
    second_page = await repo.get_all_tasks_in_db(skip=2, limit=2)
    
    assert len(first_page) == 2
    assert len(second_page) >= 1
    assert first_page[0].id != second_page[0].id

@pytest.mark.asyncio
async def test_get_tasks_created_by_user_in_db(db_session, create_test_user):
    """Test getting tasks created by specific user."""
    creator = await create_test_user("task_creator", "password123")
    other_user = await create_test_user("other_user", "password456")
    repo = TaskRepository(db_session)
    
    # Create tasks by different users
    creator_task_data = TaskCreate(
        title="Creator Task",
        description="Task by creator",
        priority="high",
        status="pending"
    )
    await repo.create_task_in_db(creator_task_data, creator.id)
    
    other_task_data = TaskCreate(
        title="Other User Task",
        description="Task by other user",
        priority="low",
        status="pending"
    )
    await repo.create_task_in_db(other_task_data, other_user.id)
    
    # Get tasks created by specific user
    creator_tasks = await repo.get_tasks_created_by_user_in_db(creator.id)
    
    assert len(creator_tasks) >= 1
    for task in creator_tasks:
        assert task.created_by == creator.id

@pytest.mark.asyncio
async def test_get_tasks_assigned_to_user_in_db(db_session, create_test_user):
    """Test getting tasks assigned to specific user."""
    creator = await create_test_user("task_creator", "password123")
    assignee = await create_test_user("task_assignee", "password456")
    repo = TaskRepository(db_session)
    
    # Create task assigned to specific user
    task_data = TaskCreate(
        title="Assigned Task",
        description="Task assigned to user",
        priority="medium",
        status="pending",
        assigned_to=assignee.id
    )
    await repo.create_task_in_db(task_data, creator.id)
    
    # Get tasks assigned to specific user
    assigned_tasks = await repo.get_tasks_assigned_to_user_in_db(assignee.id)
    
    assert len(assigned_tasks) >= 1
    for task in assigned_tasks:
        assert task.assigned_to == assignee.id

@pytest.mark.asyncio
async def test_get_overdue_tasks_in_db(db_session, create_test_user):
    """Test getting overdue tasks."""
    user = await create_test_user("overdue_creator", "password123")
    repo = TaskRepository(db_session)
    
    # Create overdue task
    overdue_task_data = TaskCreate(
        title="Overdue Task",
        description="This task is overdue",
        priority="high",
        status="pending",
        due_date=datetime.utcnow() - timedelta(days=1)  # Yesterday
    )
    await repo.create_task_in_db(overdue_task_data, user.id)
    
    # Create future task
    future_task_data = TaskCreate(
        title="Future Task",
        description="This task is not overdue",
        priority="low",
        status="pending",
        due_date=datetime.utcnow() + timedelta(days=1)  # Tomorrow
    )
    await repo.create_task_in_db(future_task_data, user.id)
    
    # Get overdue tasks
    overdue_tasks = await repo.get_overdue_tasks_in_db()
    
    assert len(overdue_tasks) >= 1
    overdue_titles = [task.title for task in overdue_tasks]
    assert "Overdue Task" in overdue_titles

@pytest.mark.asyncio
async def test_get_tasks_by_priority_in_db(db_session, create_test_user):
    """Test getting tasks by priority."""
    user = await create_test_user("priority_creator", "password123")
    repo = TaskRepository(db_session)
    
    # Create tasks with different priorities
    priorities = ["low", "medium", "high"]
    for priority in priorities:
        task_data = TaskCreate(
            title=f"{priority.title()} Priority Task",
            description=f"Task with {priority} priority",
            priority=priority,
            status="pending"
        )
        await repo.create_task_in_db(task_data, user.id)
    
    # Get high priority tasks
    high_priority_tasks = await repo.get_tasks_by_priority_in_db("high")
    
    assert len(high_priority_tasks) >= 1
    for task in high_priority_tasks:
        assert task.priority == "high"

@pytest.mark.asyncio
async def test_search_tasks_by_title_in_db(db_session, create_test_user):
    """Test searching tasks by title."""
    user = await create_test_user("search_creator", "password123")
    repo = TaskRepository(db_session)
    
    # Create tasks with searchable titles
    search_tasks = [
        "Important Meeting Preparation",
        "Code Review Session",
        "Database Migration Task",
        "User Interface Design",
        "API Documentation Update"
    ]
    
    for title in search_tasks:
        task_data = TaskCreate(
            title=title,
            description=f"Description for {title}",
            priority="medium",
            status="pending"
        )
        await repo.create_task_in_db(task_data, user.id)
    
    # Search for tasks containing "Meeting"
    meeting_tasks = await repo.search_tasks_by_title_in_db("Meeting")
    assert len(meeting_tasks) >= 1
    meeting_titles = [task.title for task in meeting_tasks]
    assert any("Meeting" in title for title in meeting_titles)
    
    # Search for tasks containing "Code"
    code_tasks = await repo.search_tasks_by_title_in_db("Code")
    assert len(code_tasks) >= 1
    code_titles = [task.title for task in code_tasks]
    assert any("Code" in title for title in code_titles)

@pytest.mark.asyncio
async def test_update_task_status_in_db(db_session, create_test_user):
    """Test updating task status."""
    user = await create_test_user("status_updater", "password123")
    repo = TaskRepository(db_session)
    
    # Create task
    task_data = TaskCreate(
        title="Status Update Task",
        description="Task for status update test",
        priority="medium",
        status="pending"
    )
    task = await repo.create_task_in_db(task_data, user.id)
    
    # Update status
    updated_task = await repo.update_task_status_in_db(task.id, "completed", user.id)
    
    assert updated_task is not None
    assert updated_task.status == "completed"
    assert updated_task.updated_by == user.id

@pytest.mark.asyncio
async def test_update_task_status_not_found(db_session, create_test_user):
    """Test updating status of non-existent task."""
    user = await create_test_user("status_updater", "password123")
    repo = TaskRepository(db_session)
    
    result = await repo.update_task_status_in_db(99999, "completed", user.id)
    assert result is None

@pytest.mark.asyncio
async def test_enrich_tasks_with_usernames(db_session, create_test_user):
    """Test enriching tasks with usernames."""
    creator = await create_test_user("creator_user", "password123")
    assignee = await create_test_user("assignee_user", "password456")
    repo = TaskRepository(db_session)
    
    # Create task with all user relationships
    task_data = TaskCreate(
        title="Full User Task",
        description="Task with all user relationships",
        priority="high",
        status="in_progress",
        assigned_to=assignee.id
    )
    task = await repo.create_task_in_db(task_data, creator.id)
    
    # Get task and enrich with usernames
    tasks = [await repo.get_task_by_id_in_db(task.id)]
    enriched_tasks = await repo.enrich_tasks_with_usernames(tasks)
    
    assert len(enriched_tasks) == 1
    enriched_task = enriched_tasks[0]
    
    assert enriched_task.created_by == creator.username
    assert enriched_task.updated_by == creator.username
    assert enriched_task.assigned_to == assignee.username

@pytest.mark.asyncio
async def test_enrich_tasks_with_missing_users(db_session, create_test_user):
    """Test enriching tasks when some users are missing."""
    user = await create_test_user("test_user", "password123")
    repo = TaskRepository(db_session)
    
    # Create task with only creator
    task_data = TaskCreate(
        title="Minimal User Task",
        description="Task with minimal user relationships",
        priority="low",
        status="pending"
    )
    task = await repo.create_task_in_db(task_data, user.id)
    
    # Get task and enrich with usernames
    tasks = [await repo.get_task_by_id_in_db(task.id)]
    enriched_tasks = await repo.enrich_tasks_with_usernames(tasks)
    
    assert len(enriched_tasks) == 1
    enriched_task = enriched_tasks[0]
    
    assert enriched_task.created_by == user.username
    assert enriched_task.updated_by == user.username
    assert enriched_task.assigned_to is None
