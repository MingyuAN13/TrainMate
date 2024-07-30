"""
This class contains a function to register authentication blueprints.
"""

from .register import register_user
from .login import login
from .logout import logout_user
from .viewable_pages import viewable_pages
from .authorization import is_user_authorized_to_visit_page


def register_auth_endpoints(blueprint):
    """Register the auth endpoints"""
    # Register as a user route
    blueprint.add_url_rule("/api/auth/register", view_func=register_user, methods=["POST"])
    # Login as a user route
    blueprint.add_url_rule("/api/auth/login", view_func=login, methods=["POST"])
    # Logout as a user route
    blueprint.add_url_rule("/api/auth/logout", view_func=logout_user, methods=["POST"])
    # This route fetches the links available to roles
    blueprint.add_url_rule(
        "/api/auth/viewable_pages", view_func=viewable_pages, methods=["GET"]
    )
    # This route fetches whether or not the page is authorized for the user based on their roles
    blueprint.add_url_rule(
        "/api/auth/user_authorized", view_func=is_user_authorized_to_visit_page, methods=["POST"]
    )
