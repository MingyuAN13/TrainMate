"""
This class contains a function to register roles blueprints.
"""

from .update_roles_endpoint import update_roles
from .fetch_roles_endpoint import fetch_roles


def register_roles_endpoints(blueprint):
    """
    This function registers the blueprints for roles.
    """
    # This route handles fetching roles from database
    blueprint.add_url_rule("/api/roles", view_func=fetch_roles, methods=["GET"])
    # This route handles updating user roles
    blueprint.add_url_rule(
        "/api/roles/admin", view_func=update_roles, methods=["PATCH"]
    )
