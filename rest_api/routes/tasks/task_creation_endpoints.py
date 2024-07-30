"""
API Endpoints for creating tasks.
"""

from flask import request, jsonify
from ...models import db, image
from ...lib.tasks_creation_external_utils import prepare_input_directory_and_token, fill_token_couchdb
from ...lib.tasks_creation_postgres_utils import get_image_url, check_image_access, add_to_postgres


def create_task():
    """
    Add a new task to PostgreSQL and submit the container to CouchDB.
    """

    data = request.get_json()

    # Check if the data provided has the correct format
    if not data_is_valid(data):
        return jsonify({"success": False, "message": "Data provided is invalid."}), 406

    # get values from the data
    task_name = data["name"]
    image_name = data["image"]
    parameters = data["parameters"]
    tag_names = data["tags"]

    if isinstance(data["input"], str):
        input_files = [data["input"]]
    else:
        input_files = data["input"]

    # get the image and check whether the user has access to the image
    selected_image = image.Image.query.filter_by(name=image_name).first()
    if not selected_image:
        return jsonify({"success": False, "message": "Image does not exist."}), 404

    access = check_image_access(selected_image)
    container_path = get_image_url(image_name)

    if not access:
        return jsonify(
            {"success": False, "message": "User does not have access to this image."}
        ), 401

    # retrieve which parameters should be passed to the image if any should be passed
    image_parameters = selected_image.parameters

    # if the parameters specified are not the same as the ones in the image return an error message
    if [param["name"] for param in parameters] != image_parameters:
        return jsonify({"success": False, "message": "Parameters are not valid."}), 406

    # Copy files to directory and create empty token in Couchdb
    token_id = prepare_input_directory_and_token(input_files)

    # submit task to couchdb so PiCaS can run it
    fill_token_couchdb(token_id, container_path, parameters)

    # add task and all associated data to postgres for administration
    add_to_postgres(token_id, task_name, tag_names)

    db.session.commit()

    return jsonify({"success": True, "message": "Task created successfully."})


def data_is_valid(data):
    """Helper function to check whether the provided data is valid."""
    # the data must contain values for name, image and input
    not_required_values = not (
        data.get("name") and data.get("image") and data.get("input")
    )

    # the data must contain a (possibly empty) field for parameters and tags
    not_params_tags = not ("parameters" in data and "tags" in data)

    # the length must be 5 and all data must be specified
    if not_required_values or len(data) != 5 or not_params_tags:
        return False

    # check if the name length is valid
    return len(data["name"]) > 0 and len(data["name"]) < 150
