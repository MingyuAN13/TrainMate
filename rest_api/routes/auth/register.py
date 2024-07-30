"""This module handles all of the authentication functionality in the backend"""

import bcrypt
from flask import request, jsonify
from ...models import user, tag, db


def register_user():
    """
    Function that checks if the email is valid, and if it exists.
    Returns bool to be used by the frontend as a "go ahead" signal.
    """
    data = request.get_json()

    error_response = (
        jsonify({"success": False, "message": "Invalid Email or Password"}),
        406,
    )
    ok_response = (
        jsonify({"success": True, "message": "User registered successfully."}),
        200,
    )

    if len(data) != 2 or not data.get("email") or not data.get("passwordHash"):
        return error_response

    email = data["email"]
    password_hash = data["passwordHash"]

    # Checks if the email has a valid format and whether the password is not empty
    if (
        len(email) > 150
        or not user.check_email(email)
        or bcrypt.checkpw("".encode("utf_8"), password_hash.encode("utf_8"))
    ):
        return error_response

    # Checks if an entry in the database exists with the email.
    existing_user = user.User.query.filter_by(email=email).first()

    # Throws an error if the user already exists.
    if existing_user:
        return error_response

    # Creates a user object.
    new_user = user.User(email=email)

    # Sets the password
    new_user.set_password_hash(password_hash)

    # Adds the user object and tag to the database.
    user_tag = tag.Tag(name=new_user.email, type="user")
    rows = [new_user, user_tag]

    db.session.add_all(rows)
    db.session.commit()

    return ok_response
