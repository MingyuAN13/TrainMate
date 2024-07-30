# validate-ignore
"""
This class contains a function to register files blueprints.
"""

from .fetch_files_endpoints import fetch_files
from .file_upload_endpoint import upload_file
from .download_file_endpoint import download_file
from .edit_file_endpoint import edit_file
from .delete_file_endpoint import delete_file
from .file_upload_status_endpoint import upload_status


def register_files_blueprints(blueprint):
    """
    This function registers the blueprints for files.
    """
    # This route handles fetching files
    blueprint.add_url_rule("/api/files", view_func=fetch_files, methods=["GET"])

    # This route handles editing a file
    blueprint.add_url_rule(
        "/api/files/<string:file_id>", view_func=edit_file, methods=["PATCH"]
    )

    # This route handles deleting a file
    blueprint.add_url_rule(
        "/api/files/<string:file_id>", view_func=delete_file, methods=["DELETE"]
    )

    # This route handles downloading a file
    blueprint.add_url_rule(
        "/api/files/download/<string:file_id>", view_func=download_file, methods=["GET"]
    )

    # This route handles uploading a file
    blueprint.add_url_rule("/api/files/upload", view_func=upload_file, methods=["POST"])

    # This route handles fetching the upload status
    blueprint.add_url_rule(
        "/api/files/statusstream/<int:uid>", view_func=upload_status, methods=["GET"]
    )
