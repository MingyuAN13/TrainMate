"""User roles dictionary test"""

# pylint: disable=unused-import
# pylint: disable=redefined-outer-name
from flask import Flask, jsonify, request
from . import pytest, client, app, delete_db_records
from .test_user_endpoints import set_user_role


def test_viewable_pages_admin_success(client, app):
    """Test roles successfully getting mapped for Admin"""
    with app.app_context():
        set_user_role(client, "Admin")

        response = client.get("/api/auth/viewable_pages")
        json_data = response.get_json()
        assert response.status_code == 200
        assert json_data["success"] is True
        assert "links" in json_data
        assert sorted(
            json_data["links"], key=lambda x: (x["href"], x["label"])
        ) == sorted(
            [
                {"href": "/app/users", "label": "Users Overview"},
                {"href": "/app/tags", "label": "Tags Overview"},
            ],
            key=lambda x: (x["href"], x["label"]),
        )


def test_viewable_pages_maintainer_success(client, app):
    """Test roles successfully getting mapped for Maintainer"""
    with app.app_context():
        set_user_role(client, "Maintainer")

        response = client.get("/api/auth/viewable_pages")
        json_data = response.get_json()
        assert response.status_code == 200
        assert json_data["success"] is True
        assert "links" in json_data
        assert sorted(
            json_data["links"], key=lambda x: (x["href"], x["label"])
        ) == sorted(
            [
                {"href": "/app/images", "label": "Images Overview"},
            ],
            key=lambda x: (x["href"], x["label"]),
        )


def test_viewable_pages_ai_researcher_success(client, app):
    """Test roles successfully getting mapped for AI Researcher"""
    with app.app_context():
        set_user_role(client, "AI Researcher")

        response = client.get("/api/auth/viewable_pages")
        json_data = response.get_json()
        assert response.status_code == 200
        assert json_data["success"] is True
        assert "links" in json_data
        assert sorted(
            json_data["links"], key=lambda x: (x["href"], x["label"])
        ) == sorted(
            [
                {"href": "/app/files", "label": "Files Overview"},
                {"href": "/app/tasks", "label": "Tasks Overview"},
            ],
            key=lambda x: (x["href"], x["label"]),
        )


def test_viewable_pages_multiple_roles_success(client, app):
    """Test roles successfully getting mapped for multiple roles"""
    with app.app_context():
        set_user_role(client, ["Admin", "Maintainer"])

        response = client.get("/api/auth/viewable_pages")
        json_data = response.get_json()
        assert response.status_code == 200
        assert json_data["success"] is True
        assert "links" in json_data
        assert sorted(
            json_data["links"], key=lambda x: (x["href"], x["label"])
        ) == sorted(
            [
                {"href": "/app/users", "label": "Users Overview"},
                {"href": "/app/tags", "label": "Tags Overview"},
                {"href": "/app/images", "label": "Images Overview"},
            ],
            key=lambda x: (x["href"], x["label"]),
        )


def test_viewable_pages_no_role_success(client, app):
    """Test that empty array returned when no user role"""
    with app.app_context():
        set_user_role(client, None)

        response = client.get("/api/auth/viewable_pages")
        json_data = response.get_json()
        assert response.status_code == 200
        assert json_data["success"] is True
        assert "links" in json_data
        assert json_data["links"] == []


def test_viewable_pages_no_session_failure(client, app):
    """Test that error thrown when no session found"""
    with app.app_context():
        # Don't set a user role to simulate no session
        response = client.get("/api/auth/viewable_pages")
        json_data = response.get_json()
        assert response.status_code == 401
        assert json_data["success"] is False
        assert json_data["message"] == "Session not found"
