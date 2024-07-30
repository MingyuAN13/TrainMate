"""Dynamic middleware tests"""

# pylint: disable=unused-import
# pylint: disable=redefined-outer-name
from . import (
    User,
    Role,
    Session,
    Task,
    Tag,
    db,
    client,
    app,
    pytest,
    datetime,
    timedelta,
    bcrypt,
    delete_db_records,
)
from .test_task_view_create import create_tasks, get_task_status


def test_authorized(client, app):
    """Test that the user is authorized successfully when they have rights to a resource"""
    with app.app_context():
        u = User(email="admin@gmail.com", password_hash="")
        u.roles.append(Role.query.filter_by(name="Data Engineer").first())

        db.session.add(u)
        db.session.commit()

        s = Session(
            session_token="2222",
            user=u,
            expiration_datetime=datetime.now() + timedelta(hours=1),
        )
        db.session.add(s)

        tag = Tag(name="tag_name", type="custom")
        db.session.add(tag)
        db.session.commit()

        client.set_cookie("session-id", "2222")

        # test that the fetch works
        postgres_task = create_tasks(app, 1)[0][0]
        token_id = postgres_task["token_id"]
        response = client.get("/api/tasks/" + token_id)
        assert response.status_code == 200

        response = client.patch(
            "/api/tasks/" + token_id, json={"tags": ["tag_name"]}
        )
        assert response.status_code == 200

        response = client.delete("/api/tasks/" + token_id)
        assert response.status_code == 200


def test_not_authorized_task_does_not_belong_to_user(client, app):
    """Test that the user is not authorized if they do not have access to the task"""
    token_id = "token_1"
    with app.app_context():
        u = User(email="test@test.com", password_hash="")
        u.roles.append(Role.query.filter_by(name="Data Engineer").first())

        db.session.add(u)
        db.session.commit()

        s = Session(
            session_token="2222",
            user=u,
            expiration_datetime=datetime.now() + timedelta(hours=1),
        )

        db.session.add(s)

        test_task = Task(name="whatever", token_id=token_id)
        test_tag = Tag(name="wrong_email@gmail.com", type="user")
        test_task.tags.append(test_tag)

        db.session.add(test_task)
        db.session.commit()

        client.set_cookie("session-id", "2222")
        response = client.get(f"/api/tasks/{token_id}")

        assert response.status_code == 401


def test_not_authorized_invalid_user_role(client, app):
    """Test that the user is not authorized if they do not have the role to access the task"""
    token_id = "token_1"
    with app.app_context():
        u = User(email="test_correct_email@test.com", password_hash="")
        u.roles.append(Role.query.filter_by(name="Admin").first())

        db.session.add(u)
        db.session.commit()

        s = Session(
            session_token="2222",
            user=u,
            expiration_datetime=datetime.now() + timedelta(hours=1),
        )

        db.session.add(s)

        test_task = Task(name="whatever", token_id=token_id)
        test_tag = Tag(name=u.email, type="user")
        test_task.tags.append(test_tag)

        db.session.add(test_task)
        db.session.commit()

        client.set_cookie("session-id", "2222")
        response = client.get(f"/api/tasks/{token_id}")

        assert response.status_code == 401


def test_not_authorized_invalid_url(client, app):
    """Test that user is not authorized upon accessing a bad url"""
    token_id = "token_2"
    with app.app_context():
        u = User(email="correct_email@test.com", password_hash="")
        u.roles.append(Role.query.filter_by(name="Admin").first())

        db.session.add(u)
        db.session.commit()

        s = Session(
            session_token="2222",
            user=u,
            expiration_datetime=datetime.now() + timedelta(hours=1),
        )

        db.session.add(s)

        test_task = Task(name="whatever", token_id=token_id)
        test_tag = Tag(name=u.email, type="user")
        test_task.tags.append(test_tag)

        db.session.add(test_task)
        db.session.commit()

        client.set_cookie("session-id", "2222")
        response = client.get(f"/api/tasks/{token_id}/some/invalid/url")

        assert response.status_code == 404
