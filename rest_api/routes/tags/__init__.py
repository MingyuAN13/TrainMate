"""
This class contains a function to register tags blueprints.
"""

from .custom_tag_fetch_endpoint import fetch_custom_tags
from .custom_tag_creation_endpoint import create_custom_tag
from .fetch_all_tags_endpoint import fetch_all_tags
from .custom_tag_deletion_endpoint import delete_custom_tag


def register_tags_endpoints(blueprint):
    """
    This function registers the blueprints for tags endpoints.
    """
    # This route handles fetching all tags for other roles
    blueprint.add_url_rule("/api/tags", view_func=fetch_all_tags, methods=["GET"])
    # This route handles the fetching of tags
    blueprint.add_url_rule(
        "/api/tags/admin", view_func=fetch_custom_tags, methods=["GET"]
    )
    # This route handles the creation of tags
    blueprint.add_url_rule(
        "/api/tags/admin", view_func=create_custom_tag, methods=["POST"]
    )
    # This route handles the deletion of tags
    blueprint.add_url_rule(
        "/api/tags/admin", view_func=delete_custom_tag, methods=["DELETE"]
    )
