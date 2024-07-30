"""
API Endpoints for users management.
"""

from flask import jsonify, request

from ...models import db, tag, user


def fetch_all_users():
    """
    Fetch users from database.
    """
    # Query all users
    users = user.User.query.all()

    # Return a list of all users in json format with their id, email and roles
    users_data = [{"email": u.email, "roles": [r.name for r in u.roles]} for u in users]

    return jsonify(users_data)

def delete_user():
    """
    Delete user from database.
    """

    # Get data from request
    data = request.get_json()

    error_response = jsonify({"success": False, "message": "Invalid email"}), 406
    ok_response = (
        jsonify({"success": True, "message": "User deleted successfully."}),
        200,
    )

    if len(data) != 1 or data.get("email") is None:
        return error_response

    email = data["email"]

    # Query user
    u = user.User.query.filter_by(email=email).first()

    if not u:
        return error_response

    # Delete user and their corresponding tag
    user.User.query.filter_by(email=email).delete()
    tag.Tag.query.filter_by(name=email).delete()
    db.session.commit()

    return ok_response
