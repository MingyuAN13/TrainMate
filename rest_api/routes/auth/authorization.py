"""
This module handles if the user is authorized to visit a page
"""

import re
from flask import request, jsonify

from ...models import session

# Defining the mapping of roles to links and labels.
role_to_hrefs_labels = {
    "Admin": [
        {"href": "/app/users", "label": "Users Overview"},
        {"href": "/app/tags", "label": "Tags Overview"},
    ],
    "Maintainer": [{"href": "/app/images", "label": "Images Overview"}],
    "AI Researcher": [
        {"href": "/app/files", "label": "Files Overview"},
        {"href": "/app/tasks", "label": "Tasks Overview"},
    ],
    "Data Engineer": [
        {"href": "/app/files", "label": "Files Overview"},
        {"href": "/app/tasks", "label": "Tasks Overview"},
    ],
}

# What pages are accessible to the user based on their role.
role_to_base_urls = {
    "Admin": [
        re.compile(r"^/app/users"),
        re.compile(r"^/app/tags"),
    ],
    "Maintainer": [
        re.compile(r"^/app/images"),
    ],
    "AI Researcher": [
        re.compile(r"^/app/files"),
        re.compile(r"^/app/tasks"),
    ],
    "Data Engineer": [
        re.compile(r"^/app/files"),
        re.compile(r"^/app/tasks"),
    ],
}


def is_user_authorized_to_visit_page():
    """
    Takes the given web page and checks if the user's role allows accessing it
    """

    ok_response = (
        jsonify({"success": True, "message": "Authorized"}),
        200,
    )

    # Get the information from the request body
    data = request.get_json()
    session_id = data.get("sessionId")
    page = data.get("page")

    if not session_id:
        return jsonify(
            {
                "success": False,
                "message": "No session id provided",
                "redirect": "/login",
            }
        ), 406

    if not page:
        return jsonify(
            {"success": False, "message": "No page provided", "redirect": "/login"}
        ), 406

    # Get the user's roles from the session
    user_session = session.Session.query.filter_by(session_token=session_id).first()
    if not user_session:
        return jsonify(
            {"success": False, "message": "Session not found", "redirect": "/login"}
        ), 401

    # Checks if the current page is a page that all users can access.
    if page in ("/app/401", "/app/home"):
        return ok_response

    user_roles = user_session.user.roles

    # Checks if the provided roles and webpage are valid mappings.
    for role in user_roles:
        if role.name in role_to_base_urls:
            for pattern in role_to_base_urls[role.name]:
                if pattern.match(page):
                    return ok_response

    return jsonify(
        {"success": False, "message": "Unauthorized request!", "redirect": "/app/401"}
    ), 401
