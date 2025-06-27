import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime, timezone
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskBulkUpdate
from app.repositories import task as task_repo

def mock_result_scalars_all(items):
    scalars_mock = MagicMock()
    scalars_mock.all.return_value = items
    result_mock = MagicMock()
    result_mock.scalars.return_value = scalars_mock
    return result_mock

@pytest.mark.asyncio
async def test_enrich_tasks_with_usernames():
    db = AsyncMock()
    user1 = User(id=1, username="alice")
    user2 = User(id=2, username="bob")
    task1 = Task(id=1, title="T1", description="D1", status="pending", priority="low",
                 due_date=None, created_by=1, updated_by=2, assigned_to=2,
                 created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc))
    task2 = Task(id=2, title="T2", description="D2", status="done", priority="medium",
                 due_date=None, created_by=2, updated_by=1, assigned_to=None,
                 created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc))
    db.execute.return_value = mock_result_scalars_all([user1, user2])
    result = await task_repo.enrich_tasks_with_usernames([task1, task2], db)
    assert result[0].created_by == "alice"
    assert result[0].updated_by == "bob"
    assert result[1].created_by == "bob"
    assert result[1].updated_by == "alice"

@pytest.mark.asyncio
async def test_create_task_in_db():
    db = AsyncMock()
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    task_data = TaskCreate(title="T", description="D", status="pending", priority="high", due_date=None)
    await task_repo.create_task_in_db(db, task_data, user_id=1)

@pytest.mark.asyncio
async def test_update_task_in_db_found_and_not_found():
    db = AsyncMock()
    task = Task(id=1, title="T", description="D", status="pending", priority="low", due_date=None,
                assigned_to=None, created_by=1, updated_by=1,
                created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc))
    db.get = AsyncMock(return_value=task)
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    update = TaskUpdate(title="New", description="New", status="done", priority="medium",
                        due_date=datetime.now(timezone.utc), assigned_to=2)
    result = await task_repo.update_task_in_db(db, 1, update, user_id=1)
    assert result.title == "New"
    assert result.priority == "medium"

@pytest.mark.asyncio
async def test_bulk_update_tasks_in_db():
    db = AsyncMock()
    task1 = Task(id=1, title="T1", description="D1", status="pending", priority="low", due_date=None,
                 assigned_to=None, created_by=1, updated_by=1,
                 created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc))
    task2 = Task(id=2, title="T2", description="D2", status="pending", priority="low", due_date=None,
                 assigned_to=None, created_by=1, updated_by=1,
                 created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc))
    db.execute.return_value = mock_result_scalars_all([task1, task2])
    db.commit = AsyncMock()
    task_ids=[1, 2]
    update = TaskBulkUpdate(
        task_ids=task_ids,
        status="done",
        priority="high",
        due_date=datetime.now(timezone.utc),
        assigned_to=2
    )
    result = await task_repo.bulk_update_tasks_in_db(db, task_ids, update, user_id=1)
    assert all(t.status == "done" for t in result)
    assert all(t.priority == "high" for t in result)

@pytest.mark.asyncio
@pytest.mark.parametrize("repo_func,args", [
    (task_repo.get_all_tasks_in_db, ()),
    (task_repo.get_tasks_created_by_user_in_db, (1,)),
    (task_repo.get_tasks_updated_by_user_in_db, (1,)),
    (task_repo.get_tasks_assigned_to_user_in_db, (2,)),
    (task_repo.get_overdue_tasks_in_db, ()),
    (task_repo.get_tasks_by_priority_in_db, ("medium",)),
    (task_repo.search_tasks_by_title_in_db, ("FindMe",)),
    (task_repo.get_tasks_created_by_specific_user_in_db, (1,))
])
async def test_read_queries(repo_func, args):
    db = AsyncMock()
    task = Task(id=1, title="T", description="D", status="pending", priority="medium", due_date=datetime.now(timezone.utc),
                assigned_to=None, created_by=1, updated_by=1,
                created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc))
    db.execute.return_value = mock_result_scalars_all([task])
    result = await repo_func(db, *args)
    assert result[0].id == 1
