"""This module handles the logout feature for the backend"""

from flask import request, jsonify
from ...models import db, session


def logout_user():
    """
    Function that checks if the user has a valid session, both in the browser
    and the database, then
    """
    ok_response = jsonify({"success": True, "message": "User logout successful"})

    # Check for session cookie
    session_id = request.cookies.get("session-id")

    # Find the session in the database
    current_session = session.Session.query.filter_by(session_token=session_id).first()

    # Delete the session from the database
    if current_session:
        db.session.delete(current_session)
        db.session.commit()

    # Create a response to delete the cookie
    ok_response.set_cookie("session-id", "", expires=0)

    return ok_response
