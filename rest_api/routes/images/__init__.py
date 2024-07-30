# validate-ignore
"""
This class contains a function to register image blueprints.
"""

from .image_creation_endpoint import create_image
from .image_fetch_endpoint import fetch_images
from .image_deletion_endpoint import delete_image
from .image_update_endpoint import change_image_name, update_image_roles
from .fetch_stored_parameters_endpoint import fetch_stored_parameters


def register_images_blueprints(blueprint):
    """
    This function registers the blueprints for images.
    """

    # This route handles fetching images
    blueprint.add_url_rule("/api/images", view_func=fetch_images, methods=["GET"])
    # This route handles the creation of an image in PostgreSQL
    blueprint.add_url_rule("/api/images", view_func=create_image, methods=["POST"])
    # This route handles updating the name of an image in PostgreSQL
    blueprint.add_url_rule("/api/images", view_func=change_image_name, methods=["PUT"])
    # This route handles updating the roles of an image in PostgreSQL.
    blueprint.add_url_rule(
        "/api/images", view_func=update_image_roles, methods=["PATCH"]
    )
    # This route handles the deletion of an image in PostgreSQL
    blueprint.add_url_rule("/api/images", view_func=delete_image, methods=["DELETE"])
    # This route handles fetching previous parameters
    blueprint.add_url_rule(
        "/api/images/stored_parameters",
        view_func=fetch_stored_parameters,
        methods=["POST"],
    )
