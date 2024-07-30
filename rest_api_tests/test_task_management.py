"""Tests for task management operations in the backend"""

# pylint: disable=unused-import
# pylint: disable=redefined-outer-name
from . import Task, Tag, db, client, app, pytest, delete_db_records, couch_db
from .test_task_view_create import create_tasks
from .test_user_endpoints import set_user_role


def test_delete_task_success(client, app):
    """Test successful deletion of a task."""
    with app.app_context():
        set_user_role(client, "Data Engineer")
        postgres_task = create_tasks(app, 1)[0][0]
        token_id = postgres_task["token_id"]
        # check there is a task
        stored_tasks = db.session.query(Task).filter_by().first()
        assert stored_tasks is not None
        assert token_id in couch_db

        response = client.delete("/api/tasks/" + token_id)
        # check that there is no task anymore
        stored_tasks = db.session.query(Task).filter_by().first()

        assert response.status_code == 200
        assert response.json == {"success": True, "message": "Task has been deleted."}
        assert stored_tasks is None
        assert token_id not in couch_db


def test_delete_nonexisting_task(client, app):
    """Test unsuccessful deletion of a task when the task doesn"t exist."""
    with app.app_context():
        token_id = "token_1"

        set_user_role(client, "Data Engineer")
        response = client.delete("/api/tasks/" + token_id)
        assert response.status_code == 404
        assert response.json == {"success": False, "message": "Task does not exist."}


def test_delete_task_not_in_couch(client, app):
    """Test successful deletion of a task from PostgreSQL if it doesn't exist in CouchDB."""
    with app.app_context():
        set_user_role(client, "Data Engineer")
        new_tag = Tag(name="admin@gmail.com", type="user")
        db.session.add(new_tag)
        db.session.commit()
        task_name = "task_0"
        postgres_task = Task(token_id="1", name=task_name)
        postgres_task.tags.append(new_tag)
        db.session.add(postgres_task)
        db.session.commit()

        response = client.delete("/api/tasks/1")

        stored_tasks = db.session.query(Task).filter_by().first()

        assert response.status_code == 200
        assert response.json == {"success": True, "message": "Task has been deleted."}
        assert stored_tasks is None


def test_delete_task_others_stay(client, app):
    """Test successful deletion of a task while other tasks are present."""
    with app.app_context():
        postgres_tasks = create_tasks(app, 4)[0]
        # test for Data Engineer role
        set_user_role(client, "Data Engineer")
        task = postgres_tasks.pop()
        token_id = task["token_id"]
        response = client.delete(f"/api/tasks/{token_id}")

        stored_task_objs = Task.query.all()
        stored_tasks = []
        for t in stored_task_objs:
            tags = []
            for tag in t.tags:
                tags += [{"id": tag.id, "name": tag.name, "type": tag.type}]
            stored_tasks += [
                {"id": t.id, "token_id": t.token_id, "name": t.name, "tags": tags}
            ]

        assert response.status_code == 200
        assert response.json == {"success": True, "message": "Task has been deleted."}
        assert stored_tasks == postgres_tasks
        assert token_id not in couch_db
        for t in stored_tasks:
            assert t["token_id"] in couch_db


def test_add_single_tag_success(client, app):
    """Test that a tag is successfully added to a task."""
    with app.app_context():
        set_user_role(client, "Data Engineer")
        postgres_tasks = create_tasks(app, 1)[0]
        token_id = postgres_tasks[0]["token_id"]
        tags_added = create_tags(app, 1)
        tag_name = tags_added[0]["name"]

        response = client.patch(
            "/api/tasks/" + token_id, json={"tags": [tag_name]}
        )
        user_tag = Tag.query.filter_by(name="admin@gmail.com").first()
        tags_added = [user_tag]
        tags_added += [Tag.query.filter_by(name=tag_name).first()]
        task = Task.query.filter_by(token_id=token_id).first()
        tags_for_task = task.tags

        assert response.status_code == 200
        assert len(tags_added) == len(tags_for_task)
        for tag in tags_added:
            assert tag in tags_for_task
        assert response.json == {"success": True, "message": "Token tags updated."}


def test_update_multiple_tags_success(client, app):
    """Test that multiple tags are successfully added to a task."""
    with app.app_context():
        set_user_role(client, "Data Engineer")
        postgres_tasks = create_tasks(app, 2)[0]
        token_id = postgres_tasks[0]["token_id"]
        user_tag = Tag.query.filter_by(name="admin@gmail.com").first()
        tags_added = [{"id": user_tag.id, "name": user_tag.name}]

        tags_added += create_tags(app, 3)
        tag_names = []
        for i in range(1, 4):
            tag_names += [tags_added[i]["name"]]

        response = client.patch(
            "/api/tasks/" + token_id, json={"tags": tag_names}
        )
        task_tags = []
        task = Task.query.filter_by(token_id=token_id).first()
        tags = task.tags
        for tag in tags:
            task_tags += [{"id": tag.id, "name": tag.name}]

        assert response.status_code == 200
        assert len(tags_added) == len(task_tags)
        for tag in tags_added:
            assert tag in task_tags
        assert response.json == {"success": True, "message": "Token tags updated."}


def test_remove_all_tags_success(client, app):
    """Test that all tags except the user tag are removed when providing an empty tag list"""
    with app.app_context():
        set_user_role(client, "Data Engineer")
        postgres_tasks = create_tasks(app, 1)[0]
        token_id = postgres_tasks[0]["token_id"]
        t = Task.query.filter_by(token_id = token_id).first()

        response = client.patch("/api/tasks/" + token_id, json={"tags": []})

        assert response.status_code == 200
        assert response.json == {
            "success": True,
            "message": "Token tags updated.",
        }
        assert Tag.query.filter_by(name = "admin@gmail.com").first() in t.tags

def test_update_nonexistant_tags(client, app):
    """Test that adding nonexistant tags doesn"t do anything"""
    with app.app_context():
        set_user_role(client, "Data Engineer")
        postgres_tasks = create_tasks(app, 1)[0]
        token_id = postgres_tasks[0]["token_id"]
        tags = ["fake_1", "fake_2"]
        response = client.patch("/api/tasks/" + token_id, json={"tags": tags})

        task = Task.query.filter_by(token_id=token_id).first()
        tags = task.tags
        user_tag = Tag.query.filter_by(name="admin@gmail.com").first()

        assert response.status_code == 200
        assert tags == [user_tag]


def test_update_tags_nonexisting_task(client, app):
    """Test unsuccesful adding tags to a new task, as the task doesn't exist."""
    with app.app_context():
        set_user_role(client, "Data Engineer")
        response = client.patch("/api/tasks/token_0", json={"tags": "tag"})

        assert response.status_code == 404
        assert response.json == {"success": False, "message": "Task does not exist."}


def test_update_tags_invalid_data(client, app):
    """Test unsuccesful adding tags to a new task, as the data provided is invalid."""
    with app.app_context():
        set_user_role(client, "Data Engineer")
        response = client.post("/api/tasks", json={"token_id": "a"})
        assert response.status_code == 406
        assert response.json == {
            "success": False,
            "message": "Data provided is invalid.",
        }


def create_tags(app, num):
    """
    Create num dummy tags and add them.
    """
    with app.app_context():
        tags_added = []
        for i in range(num):
            tag_name = "tag_" + str(i)
            new_tag = Tag(name=tag_name, type="custom")
            db.session.add(new_tag)
            db.session.commit()
            tag = [{"id": new_tag.id, "name": tag_name}]
            tags_added += tag
        return tags_added
