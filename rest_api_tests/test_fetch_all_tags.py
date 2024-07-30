"""Fetch all tags endpoints unit tests"""

# pylint: disable=unused-import
# pylint: disable=redefined-outer-name
from . import pytest, Tag, db, client, app, delete_db_records
from .test_user_endpoints import set_user_role


def test_fetch_success(client, app):
    """
    Test fetch of all tags success.
    """

    with app.app_context():
        # Add tags to database
        t_custom = Tag(name="custom_test", type="custom")
        t_user = Tag(name="user_test", type="user")

        db.session.add(t_custom)
        db.session.add(t_user)
        db.session.commit()

        # Set user role + cookie
        set_user_role(client, "Data Engineer")

        # Request to fetch all tags
        response = client.get("/api/tags")

        assert response.status_code == 200
        assert response.json == [
            {"id": t_custom.id, "name": "custom_test", "type": "custom"},
            {"id": t_user.id, "name": "user_test", "type": "user"},
        ]


def test_fetch_unauthorized(client, app):
    """
    Test fetch all tags unauthorized.
    """

    with app.app_context():
        # Add tags to database
        t_user = Tag(name="user_test", type="user")

        db.session.add(t_user)
        db.session.commit()

        # Set user role + cookie
        set_user_role(client, "Admin")

        # Request to fetch all tags
        response = client.get("/api/tags")

        assert response.status_code == 401
