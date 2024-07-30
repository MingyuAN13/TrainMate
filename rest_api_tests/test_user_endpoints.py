"""User endpoints unit tests."""

# pylint: disable=unused-import
# pylint: disable=redefined-outer-name
from flask import jsonify
from . import (
    pytest,
    User,
    Role,
    Tag,
    db,
    client,
    app,
    Session,
    datetime,
    timedelta,
    delete_db_records,
)


def set_user_role(client, role_name):
    """Create admin user and set cookie."""
    # Add admin user
    user = User(email="admin@gmail.com", password_hash="pass")
    if isinstance(role_name, list):
        for role in role_name:
            user_role = Role.query.filter_by(name=role).first()
            user.roles.append(user_role)
    elif isinstance(role_name, str):
        user_role = Role.query.filter_by(name=role_name).first()
        user.roles.append(user_role)

    db.session.add(user)

    # Add session
    s = Session(
        session_token="1111",
        user=user,
        expiration_datetime=datetime.now() + timedelta(hours=1),
    )

    db.session.add(s)
    db.session.commit()

    # Set cookie
    client.set_cookie("session-id", s.session_token)


def test_fetch_users(client, app):
    """Test that we retrieve all users from the database."""

    with app.app_context():
        # Add dummy users to database
        u_1 = User(email="test@gmail.com", password_hash="pass")
        u_2 = User(email="test1@gmail.com", password_hash="pass")

        r_de = Role.query.filter_by(name="Data Engineer").first()
        r_ai = Role.query.filter_by(name="AI Researcher").first()

        u_1.roles.append(r_de)
        u_2.roles.append(r_ai)

        db.session.add(u_1)
        db.session.add(u_2)
        db.session.commit()

        # Set admin user and cookie
        set_user_role(client, "Admin")

        # Fetch users to check that we retrieve all users
        response = client.get("/api/users/admin")

        assert response.json == [
            {"email": "test@gmail.com", "roles": ["Data Engineer"]},
            {"email": "test1@gmail.com", "roles": ["AI Researcher"]},
            {"email": "admin@gmail.com", "roles": ["Admin"]},
        ]
        assert response.status_code == 200


def test_delete_users(client, app):
    """Test that we can delete a user from the database."""

    with app.app_context():
        # Add dummy users to database
        u_1 = User(email="test@gmail.com", password_hash="pass")
        u_2 = User(email="test1@gmail.com", password_hash="pass")

        r_de = Role.query.filter_by(name="Data Engineer").first()
        r_ai = Role.query.filter_by(name="AI Researcher").first()

        t_1 = Tag(name=u_1.email, type="user")
        t_2 = Tag(name=u_2.email, type="user")

        u_1.roles.append(r_de)
        u_2.roles.append(r_de)
        u_2.roles.append(r_ai)

        rows = [u_1, u_2, t_1, t_2]

        db.session.add_all(rows)
        db.session.commit()

        # Set admin user and cookie
        set_user_role(client, "Admin")

        # Remove one user
        data = {"email": "test1@gmail.com"}
        response = client.delete(
            "/api/users/admin",
            headers={
                "Content-Type": "application/json",
            },
            json=data,
        )

        assert response.json == {
            "success": True,
            "message": "User deleted successfully.",
        }
        assert response.status_code == 200

        # Check that user tag was deleted
        assert Tag.query.filter_by(name=data["email"]).first() is None

        # Fetch users to check that user was deleted
        response = client.get("/api/users/admin")

        assert response.json == [
            {"email": "test@gmail.com", "roles": ["Data Engineer"]},
            {"email": "admin@gmail.com", "roles": ["Admin"]},
        ]
        assert response.status_code == 200


def test_update_roles(client, app):
    """Test that we can update the user's roles."""

    with app.app_context():
        # Add dummy users to database
        u_1 = User(email="test@gmail.com", password_hash="pass")
        u_1.roles.append(Role.query.filter_by(name="Data Engineer").first())

        db.session.add(u_1)
        db.session.commit()

        # Set admin user and cookie
        set_user_role(client, "Admin")

        # Fetch users to check that user currently has Data Engineer role
        response = client.get("/api/users/admin")

        assert response.json == [
            {"email": "test@gmail.com", "roles": ["Data Engineer"]},
            {"email": "admin@gmail.com", "roles": ["Admin"]},
        ]
        assert response.status_code == 200

        # Update user role to AI Researcher
        data = {"email": "test@gmail.com", "roles": ["AI Researcher"]}
        response = client.patch(
            "/api/roles/admin",
            headers={
                "Content-Type": "application/json",
            },
            json=data,
        )

        assert response.json == {
            "success": True,
            "message": "Role(s) updated successfully.",
        }
        assert response.status_code == 200

        # Fetch user to check that user's roles have been updated
        response = client.get("/api/users/admin")
        assert response.json == [
            {"email": "test@gmail.com", "roles": ["AI Researcher"]},
            {"email": "admin@gmail.com", "roles": ["Admin"]},
        ]
        assert response.status_code == 200


def test_update_multiple_roles(client, app):
    """
    Test update multiple roles
    """

    with app.app_context():
        # Add dummy users to database
        u_1 = User(email="test@gmail.com", password_hash="pass")
        u_1.roles.append(Role.query.filter_by(name="Data Engineer").first())

        db.session.add(u_1)
        db.session.commit()

        # Set admin user and cookie
        set_user_role(client, "Admin")

        # Fetch users to check that user currently has Data Engineer role
        response = client.get("/api/users/admin")

        assert response.json == [
            {"email": "test@gmail.com", "roles": ["Data Engineer"]},
            {"email": "admin@gmail.com", "roles": ["Admin"]},
        ]
        assert response.status_code == 200

        # Update user roles
        data = {
            "email": "test@gmail.com",
            "roles": ["AI Researcher", "Data Engineer", "Maintainer"],
        }
        response = client.patch(
            "/api/roles/admin",
            headers={
                "Content-Type": "application/json",
            },
            json=data,
        )

        assert response.json == {
            "success": True,
            "message": "Role(s) updated successfully.",
        }
        assert response.status_code == 200

        # Check that user's roles have been  updated
        user_roles = []
        for role in u_1.roles:
            user_roles.append(role.name)
        user_roles.sort()
        assert user_roles == ["AI Researcher", "Data Engineer", "Maintainer"]


def test_update_same_role(client, app):
    """
    Test update role to stay the same
    """

    with app.app_context():
        # Add dummy users to database
        u_1 = User(email="test@gmail.com", password_hash="pass")
        u_1.roles.append(Role.query.filter_by(name="Data Engineer").first())

        db.session.add(u_1)
        db.session.commit()

        # Set admin user and cookie
        set_user_role(client, "Admin")

        # Fetch users to check that user currently has Data Engineer role
        response = client.get("/api/users/admin")

        assert response.json == [
            {"email": "test@gmail.com", "roles": ["Data Engineer"]},
            {"email": "admin@gmail.com", "roles": ["Admin"]},
        ]
        assert response.status_code == 200

        # Update user role without changing the role
        data = {"email": "test@gmail.com", "roles": ["Data Engineer"]}
        response = client.patch(
            "/api/roles/admin",
            headers={
                "Content-Type": "application/json",
            },
            json=data,
        )

        assert response.json == {
            "success": True,
            "message": "Role(s) updated successfully.",
        }
        assert response.status_code == 200

        # Check that user's roles did not change
        user_roles = []
        for role in u_1.roles:
            user_roles.append(role.name)
        user_roles.sort()
        assert user_roles == ["Data Engineer"]


def test_update_add_role_no_roles(client, app):
    """
    Test update role to add a role for user that does not have a role.
    """

    with app.app_context():
        # Add dummy users to database
        u_1 = User(email="test@gmail.com", password_hash="pass")

        db.session.add(u_1)
        db.session.commit()

        # Set admin user and cookie
        set_user_role(client, "Admin")

        # Fetch users to check that user currently has no role
        response = client.get("/api/users/admin")

        assert response.json == [
            {"email": "test@gmail.com", "roles": []},
            {"email": "admin@gmail.com", "roles": ["Admin"]},
        ]
        assert response.status_code == 200

        # Update user role to have a new role
        data = {"email": "test@gmail.com", "roles": ["Data Engineer"]}
        response = client.patch(
            "/api/roles/admin",
            headers={
                "Content-Type": "application/json",
            },
            json=data,
        )

        assert response.json == {
            "success": True,
            "message": "Role(s) updated successfully.",
        }
        assert response.status_code == 200

        # Check that user has a new role assigned
        user_roles = []
        for role in u_1.roles:
            user_roles.append(role.name)
        user_roles.sort()
        assert user_roles == ["Data Engineer"]


def test_update_to_no_roles(client, app):
    """
    Test update role to remove a role for user so that they do not have a role.
    """

    with app.app_context():
        # Add dummy users to database
        u_1 = User(email="test@gmail.com", password_hash="pass")
        u_1.roles.append(Role.query.filter_by(name="Data Engineer").first())

        db.session.add(u_1)
        db.session.commit()

        # Set admin user and cookie
        set_user_role(client, "Admin")

        # Fetch users to check that user currently has Data Engineer role
        response = client.get("/api/users/admin")

        assert response.json == [
            {"email": "test@gmail.com", "roles": ["Data Engineer"]},
            {"email": "admin@gmail.com", "roles": ["Admin"]},
        ]
        assert response.status_code == 200

        # Update user role to remove roles
        data = {"email": "test@gmail.com", "roles": []}
        response = client.patch(
            "/api/roles/admin",
            headers={
                "Content-Type": "application/json",
            },
            json=data,
        )

        assert response.json == {
            "success": True,
            "message": "Role(s) updated successfully.",
        }
        assert response.status_code == 200

        # Check that user's has no roles
        user_roles = []
        for role in u_1.roles:
            user_roles.append(role.name)
        user_roles.sort()
        assert not user_roles


def test_update_nonexistent_role(client, app):
    """
    Test update role for a non-existent role.
    """

    with app.app_context():
        # Add dummy users to database
        u_1 = User(email="test@gmail.com", password_hash="pass")

        db.session.add(u_1)
        db.session.commit()

        # Set admin user and cookie
        set_user_role(client, "Admin")

        # Fetch users to check that user currently has no role
        response = client.get("/api/users/admin")

        assert response.json == [
            {"email": "test@gmail.com", "roles": []},
            {"email": "admin@gmail.com", "roles": ["Admin"]},
        ]
        assert response.status_code == 200

        # Update user role with a non-existent role
        data = {"email": "test@gmail.com", "roles": ["Behavioral Scientist"]}
        response = client.patch(
            "/api/roles/admin",
            headers={
                "Content-Type": "application/json",
            },
            json=data,
        )

        assert response.json == {"success": False, "message": "Data provided is invalid."}
        assert response.status_code == 406

        # Check that user's roles have not been updated
        user_roles = []
        for role in u_1.roles:
            user_roles.append(role.name)
        user_roles.sort()
        assert not user_roles

def test_update_nonexistent_user(client, app):
    """
    Test update roles for a nonexistent user
    """

    with app.app_context():
        # Add dummy users to database
        u_1 = User(email="test@gmail.com", password_hash="pass")

        db.session.add(u_1)
        db.session.commit()

        # Set admin user and cookie
        set_user_role(client, "Admin")

        # Update user role with a non-existent role
        data = {"email": "wrong-email@gmail.com", "roles": ["Data Engineer"]}
        response = client.patch(
            "/api/roles/admin",
            headers={
                "Content-Type": "application/json",
            },
            json=data,
        )

        assert response.json == {"success": False, "message": "User does not exist."}
        assert response.status_code == 404

def test_unauthorized_request(client, app):
    """Test middleware only allows admin users."""

    with app.app_context():
        # Set non-admin user and cookie
        set_user_role(client, "Data Engineer")

        # Try to access admin functionality as a non-admin user
        response = client.get("/api/users/admin")

        assert response.status_code == 401

        response = client.delete("/api/users/admin")

        u_dummy = User(email="test@gmail.com", password_hash="pass")
        t_dummy = Tag(name=u_dummy.email, type="user")

        db.session.add(u_dummy)
        db.session.add(t_dummy)
        db.session.commit()

        data = {"email": u_dummy.email}
        response = client.delete(
            "/api/users/admin",
            headers={
                "Content-Type": "application/json",
            },
            json=data,
        )

        assert response.status_code == 401
        assert Tag.query.filter_by(name=u_dummy.email).first() is not None

        response = client.patch("/api/roles/admin")

        assert response.status_code == 401

def test_empty_delete_user(client, app):
    """Test user deletion failure with empty json."""
    with app.app_context():
        # Set admin user and cookie
        set_user_role(client, "Admin")

        # Make request with empty body
        response = client.delete(
            "/api/users/admin", headers={"Content-Type": "application/json"}, json={}
        )

        assert response.status_code == 406
        assert response.json == {"success": False, "message": "Invalid email"}


def test_delete_invalid_email(client, app):
    """Test invalid email when deleting a user."""

    with app.app_context():
        # Add dummy users to database
        u_1 = User(email="test@gmail.com", password_hash="pass")

        db.session.add(u_1)
        db.session.commit()

        # Set admin user and cookie
        set_user_role(client, "Admin")

        # Try to remove a user
        data = {"email": ""}
        response = client.delete(
            "/api/users/admin",
            headers={
                "Content-Type": "application/json",
            },
            json=data,
        )

        assert response.json == {"success": False, "message": "Invalid email"}
        assert response.status_code == 406


def test_invalid_update_user_roles(client, app):
    """Test update of user roles failure with invalid json."""
    with app.app_context():
        # Set admin user and cookie
        set_user_role(client, "Admin")

        # Make request with empty body
        response = client.patch(
            "/api/roles/admin",
            headers={"Content-Type": "application/json"},
            json={},
        )

        assert response.status_code == 406
        assert response.json == {"success": False, "message": "Data provided is invalid."}

        # Make request with only one argument in body
        response = client.patch(
            "/api/roles/admin",
            headers={"Content-Type": "application/json"},
            json={"email": "test@gmail.com"},
        )

        assert response.status_code == 406
        assert response.json == {"success": False, "message": "Data provided is invalid."}
