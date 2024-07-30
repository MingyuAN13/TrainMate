"""User page authorization tests"""

# pylint: disable=unused-import
# pylint: disable=redefined-outer-name
from flask import Flask, jsonify, request
from . import pytest, client, app, delete_db_records
from .test_user_endpoints import set_user_role


def test_page_authorization_success_admin(client, app):
    """Test admin role successfully getting authorized"""
    with app.app_context():
        set_user_role(client, "Admin")
        data = {"sessionId": "1111", "page": "/app/users"}
        response = client.post("/api/auth/user_authorized", json=data)
        json_data = response.get_json()
        assert response.status_code == 200
        assert json_data["success"] is True
        assert json_data["message"] == "Authorized"


def test_page_authorization_success_home(client, app):
    """Test homepage is authorized for any role"""
    with app.app_context():
        set_user_role(client, "Maintainer")
        data = {"sessionId": "1111", "page": "/app/home"}
        response = client.post("/api/auth/user_authorized", json=data)
        json_data = response.get_json()
        assert response.status_code == 200
        assert json_data["success"] is True
        assert json_data["message"] == "Authorized"


def test_page_authorization_success_no_role(client, app):
    """Test that home page is accessible for someone with no role"""
    with app.app_context():
        set_user_role(client, None)
        data = {"sessionId": "1111", "page": "/app/home"}
        response = client.post("/api/auth/user_authorized", json=data)
        json_data = response.get_json()
        assert response.status_code == 200
        assert json_data["success"] is True
        assert json_data["message"] == "Authorized"


def test_page_authorization_success_401_page(client, app):
    """Test that 401 page is accessible to people with any role"""
    with app.app_context():
        set_user_role(client, "AI Researcher")
        data = {"sessionId": "1111", "page": "/app/401"}
        response = client.post("/api/auth/user_authorized", json=data)
        json_data = response.get_json()
        assert response.status_code == 200
        assert json_data["success"] is True
        assert json_data["message"] == "Authorized"


def test_page_authorization_failure_no_session(client, app):
    """Test that error returned when no session ID provided"""
    with app.app_context():
        data = {"page": "/app/home"}
        response = client.post("/api/auth/user_authorized", json=data)
        json_data = response.get_json()
        assert response.status_code == 406
        assert json_data["success"] is False
        assert json_data["message"] == "No session id provided"


def test_page_authorization_failure_no_page(client, app):
    """Test that error returned when no page provided"""
    with app.app_context():
        set_user_role(client, "Admin")
        data = {"sessionId": "1111"}
        response = client.post("/api/auth/user_authorized", json=data)
        json_data = response.get_json()
        assert response.status_code == 406
        assert json_data["success"] is False
        assert json_data["message"] == "No page provided"


def test_page_authorization_failure_unauthorized(client, app):
    """Test that error 401 returned when page is unauthorized"""
    with app.app_context():
        set_user_role(client, "Data Engineer")
        data = {"sessionId": "1111", "page": "/app/tags"}
        response = client.post("/api/auth/user_authorized", json=data)
        json_data = response.get_json()
        assert response.status_code == 401
        assert json_data["success"] is False
        assert json_data["message"] == "Unauthorized request!"
        assert json_data["redirect"] == "/app/401"
