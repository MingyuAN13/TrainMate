"""Fetch current user endpoint unit tests."""

# pylint: disable=unused-import
# pylint: disable=redefined-outer-name
from . import pytest, User, Tag, client, app, delete_db_records, db
from .test_user_endpoints import set_user_role

def test_fetch_current_user_success(client, app):
    """
    Test that the endpoint successfully returns the correct current user.
    """

    with app.app_context():
        # Create a user and session with the Admin role
        set_user_role(client, "Admin")

        # Query the created user
        u = User.query.filter_by(email = "admin@gmail.com").first()

        # Create the user tag for created user
        t = Tag(name = "admin@gmail.com", type = "user")

        db.session.add(t)
        db.session.commit()

        response = client.get("/api/users/current")

        assert response.status_code == 200
        assert response.json["success"] is True
        assert response.json["id"] == u.id
        assert response.json["email"] == u.email
        assert response.json["roles"] == ["Admin"]
        assert response.json["tag"] == {"name": t.name, "id": t.id, "type": t.type}

def test_fetch_current_user_multiple_roles_success(client, app):
    """
    Test that the endpoint successfully returns the correct current user with multiple roles.
    """

    with app.app_context():
        # Create a user and session with multiple roles
        set_user_role(client, ["Admin", "Data Engineer"])

        # Query the created user
        u = User.query.filter_by(email = "admin@gmail.com").first()

        # Create the user tag for created user
        t = Tag(name = "admin@gmail.com", type = "user")

        db.session.add(t)
        db.session.commit()

        response = client.get("/api/users/current")

        assert response.status_code == 200
        assert response.json["success"] is True
        assert response.json["id"] == u.id
        assert response.json["email"] == u.email
        assert "Admin" in response.json["roles"]
        assert "Data Engineer" in response.json["roles"]
        assert response.json["tag"] == {"name": t.name, "id": t.id, "type": t.type}


def test_fetch_current_user_no_roles_success(client, app):
    """
    Test that the endpoint successfully returns the correct current user with no roles.
    """

    with app.app_context():
        # Create a user and session with no role
        set_user_role(client, None)

        # Query the created user
        u = User.query.filter_by(email = "admin@gmail.com").first()

        # Create the user tag for created user
        t = Tag(name = "admin@gmail.com", type = "user")

        db.session.add(t)
        db.session.commit()

        response = client.get("/api/users/current")

        assert response.status_code == 200
        assert response.json["success"] is True
        assert response.json["id"] == u.id
        assert response.json["email"] == u.email
        assert response.json["roles"] == []
        assert response.json["tag"] == {"name": t.name, "id": t.id, "type": t.type}

def test_fetch_current_user_no_user(client):
    """
    Test that the endpoint successfully returns an error when the current session has no user.
    """

    response = client.get("/api/users/current")

    assert response.status_code == 401
    assert response.json == {"success": False, "message": "No user in session."}

def test_fetch_current_user_no_user_tag(client, app):
    """
    Test that the endpoint successfully returns an error when the current session has user,
    but no user tag
    """

    with app.app_context():
        set_user_role(client, None)
        response = client.get("/api/users/current")

        assert response.status_code == 404
        assert response.json == {"success": False, "message": "User does not exist."}
