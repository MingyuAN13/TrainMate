"""
API endpoints for fetching data about the current user.
"""

from flask import jsonify
from ...lib.user_utils import get_user_by_session

def fetch_current_user_email():
    """Fetches the current user's email"""

    error_response = (
        jsonify({"success": False, "message": "No user in session."}),
        401,
    )

    # Get user from the session
    u = get_user_by_session()

    # Check if user exists in session.
    if not u:
        return error_response

    return jsonify(
        {"success": True, "message": "Email fetch successful.", "email": u.email}
    )

def does_current_user_have_roles():
    """Fetch as to whether the current user has roles."""

    # Get user from the session
    u = get_user_by_session()

    # Check if user exists in session.
    if not u:
        return jsonify({"success": False, "message": "No user in session."}), 401

    # Return appropriate response
    if len(u.roles) == 0:
        return jsonify(
            {
                "success": True,
                "message": "Please contact the system admin to assign you role(s)!",
            }
        )

    return jsonify({"success": True, "message": "Welcome to Trainmate!"})
