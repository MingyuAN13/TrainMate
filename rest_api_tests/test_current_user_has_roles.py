"""Fetch current user has roles endpoint unit tests."""

# pylint: disable=unused-import
# pylint: disable=redefined-outer-name
from . import (
    pytest,
    User,
    Role,
    Session,
    client,
    app,
    delete_db_records,
    datetime,
    timedelta,
    db,
)


def test_fetch_success_no_roles(client, app):
    """
    Test that the fetch is successful if the user has no roles, but has a session
    """

    with app.app_context():
        # Add user and session
        u = User(email="test@test.com", password_hash="test")

        db.session.add(u)
        db.session.commit()

        s = Session(
            session_token="1111",
            expiration_datetime=datetime.now() + timedelta(minutes=10),
            user=u,
        )

        db.session.add(s)
        db.session.commit()

        # Set cookie for user
        client.set_cookie("session-id", "1111")

        # Fetch to check user has 0 roles
        response = client.get("/api/users/roles")

        assert response.status_code == 200
        assert response.json == {
            "success": True,
            "message": "Please contact the system admin to assign you role(s)!",
        }


def test_fetch_success_has_roles(client, app):
    """
    Test that fetch is successful if the user has roles, but has a session
    """

    with app.app_context():
        # Add user and session
        u = User(email="test@test.com", password_hash="test")

        db.session.add(u)
        db.session.commit()

        u.roles.append(Role.query.filter_by(name="Admin").first())

        db.session.commit()

        s = Session(
            session_token="1111",
            expiration_datetime=datetime.now() + timedelta(minutes=10),
            user=u,
        )

        db.session.add(s)
        db.session.commit()

        # Set cookie for user
        client.set_cookie("session-id", "1111")

        # Fetch to check user has a role
        response = client.get("/api/users/roles")

        assert response.status_code == 200
        assert response.json == {"success": True, "message": "Welcome to Trainmate!"}


def test_fetch_no_session(client, app):
    """
    Test that the fetch is unsuccessful if user has roles, but has no session
    """

    with app.app_context():
        # Add user and session
        u = User(email="test@test.com", password_hash="test")

        db.session.add(u)
        db.session.commit()

        u.roles.append(Role.query.filter_by(name="Admin").first())

        db.session.commit()

        # Fetch to check user roles
        response = client.get("/api/users/roles")

        assert response.status_code == 401
        assert response.json == {"success": False, "message": "No user in session."}


def test_fetch_no_session_no_role(client, app):
    """
    Test that the fetch is unsuccessful if user has roles, but has no session
    """

    with app.app_context():
        # Add user and session
        u = User(email="test@test.com", password_hash="test")

        db.session.add(u)
        db.session.commit()

        # Fetch to check user roles
        response = client.get("/api/users/roles")

        assert response.status_code == 401
        assert response.json == {"success": False, "message": "No user in session."}
