"""
API Endpoint for fetching roles from PostGreSQL.
"""

from flask import jsonify
from ...models import role

def fetch_roles():
    """
    Fetch roles from database.
    """

    # Query all roles
    roles = role.Role.query.all()

    # Return a list of all roles in json format with the role name
    roles_data = {"roles": [r.name for r in roles]}

    return jsonify(roles_data)
