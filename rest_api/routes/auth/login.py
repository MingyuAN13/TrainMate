"""
This module handles all of the login functionality in the backend
"""

import uuid
import bcrypt
from flask import request, jsonify
from ...models import user, db, session
from ... import datetime, timedelta


def login():
    """
    Function for checking if the email exists in the database.
    Returns the password stored for that email if it does.
    """
    data = request.get_json()

    error_response = (
        jsonify({"success": False, "message": "Invalid Email or Password"}),
        406,
    )

    # guard against missing data
    if not data or len(data) != 2 or not data.get("email") or not data.get("password"):
        return error_response

    email = data["email"]
    password = data["password"]

    # This makes a query to check if a user with that email exists, with .filter_by()
    # and then .first() obtains the user object at the first query.
    existing_user = user.User.query.filter_by(email=email).first()

    try:
        if not existing_user or not bcrypt.checkpw(
            password.encode("utf-8"), existing_user.password_hash.encode("utf8")
        ):
            return error_response
    except ValueError:
        return error_response

    # Session token initialize
    session_token = str(uuid.uuid4())

    user_session = session.Session(
        session_token=session_token,
        user=existing_user,
        expiration_datetime=datetime.now() + timedelta(hours=8),
    )

    db.session.add(user_session)
    db.session.commit()

    ok_response = jsonify({"success": True, "message": "Authentication Successful."})
    # set the cookie for the client with the session id
    ok_response.set_cookie(
        "session-id",
        user_session.session_token,
        expires=user_session.expiration_datetime,
        httponly=True,
    )
    return ok_response
