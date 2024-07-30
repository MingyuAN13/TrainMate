"""Fetch roles endpoints unit tests."""

# pylint: disable=unused-import
# pylint: disable=redefined-outer-name
from . import pytest, Role, client, app, delete_db_records
from .test_user_endpoints import set_user_role


def test_fetch_success(client, app):
    """
    Test fetching roles success
    """

    with app.app_context():
        # Set admin role + cookie
        set_user_role(client, "Admin")

        # Fetch to check only admin role is there
        response = client.get("/api/roles")

        all_roles = Role.query.all()
        assert response.status_code == 200
        for r in all_roles:
            assert r.name in response.json["roles"]


def test_fetch_unauthorized(client, app):
    """
    Test fetching roles unauthorized user
    """

    with app.app_context():
        # Set non-admin role + cookie
        set_user_role(client, "AI Researcher")

        # Fetch to check user is unauthorized
        response = client.get("/api/roles")

        assert response.status_code == 401
