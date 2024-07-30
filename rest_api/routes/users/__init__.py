"""
This class contains a function to register users blueprints.
"""

from .fetch_user_data_endpoints import fetch_current_user_email, does_current_user_have_roles
from .users_admin_endpoints import fetch_all_users, delete_user
from .fetch_current_user_endpoint import fetch_current_user

def register_users_blueprints(blueprint):
    """
    This function registers the blueprints for users endpoints.
    """
    # This route handles the deletion of users
    blueprint.add_url_rule("/api/users/admin", view_func=delete_user, methods=["DELETE"])
    # This route handles the fetching of users
    blueprint.add_url_rule("/api/users/admin", view_func=fetch_all_users, methods=["GET"])
    # This route handles the fetching of the current user
    blueprint.add_url_rule("/api/users/current", view_func=fetch_current_user, methods=["GET"])
    # This route fetches the current user's email
    blueprint.add_url_rule("/api/users/email", view_func=fetch_current_user_email, methods=["GET"])
    # This route handles fetching whether the current user has roles
    blueprint.add_url_rule("/api/users/roles", view_func=does_current_user_have_roles, methods=["GET"])
