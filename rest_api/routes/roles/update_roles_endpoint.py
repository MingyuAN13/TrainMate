"""
API Endpoint for updating roles of users by admin.
"""

from flask import jsonify, request
from ...models import user, role, db


def update_roles():
    """
    Update user role(s).
    """

    data = request.get_json()

    # Check if validity of data provided
    if len(data) != 2 or data.get("email") is None or data.get("roles") is None:
        return jsonify({"success": False, "message": "Data provided is invalid."}), 406

    email = data["email"]
    updated_role_names = data["roles"]

    if invalid_roles(updated_role_names):
        return jsonify({"success": False, "message": "Data provided is invalid."}), 406

    # Query user through email
    u = user.User.query.filter_by(email=email).first()

    if not u:
        return jsonify({"success": False, "message": "User does not exist."}), 404

    # Query role objects
    updated_roles = (
        db.session.query(role.Role).filter(role.Role.name.in_(updated_role_names)).all()
    )

    # Update user roles
    u.roles = updated_roles

    db.session.commit()

    return jsonify({"success": True, "message": "Role(s) updated successfully."}), 200

def invalid_roles(role_names):
    """
    Helper function to check if any invalid role names were provided.
    """

    valid_roles = [r.name for r in role.Role.query.all()]

    return any(r not in valid_roles for r in role_names)
