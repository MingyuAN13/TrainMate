# validate-ignore
"""This module defines all the submodules, containing all the backend routes in the application."""

from flask import Blueprint
from .health import health
from .auth import register_auth_endpoints
from .users import register_users_blueprints
from .tags import register_tags_endpoints
from .tasks import register_tasks_blueprints
from .images import register_images_blueprints
from .files import register_files_blueprints
from .roles import register_roles_endpoints

blueprint = Blueprint("routes", __name__)

# Register all blueprints
register_auth_endpoints(blueprint)
register_users_blueprints(blueprint)
register_tags_endpoints(blueprint)
register_tasks_blueprints(blueprint)
register_images_blueprints(blueprint)
register_files_blueprints(blueprint)
register_roles_endpoints(blueprint)

# This route makes pings to the backend to check that the server is alive.
blueprint.add_url_rule("/api/health", view_func=health, methods=["GET"])
