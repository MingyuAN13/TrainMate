"""
API Endpoints for fetching data about a single task.
"""

from flask import jsonify
from ...models import task, image
from .fetch_all_tasks_endpoint import get_task_status
from ...lib.tasks_fetch_utils import get_task_from_couch


# pylint: disable=unused-argument
def fetch_single_task_info(token_id):
    """
    Fetch token id and tags from PostgreSQL and fetch extra info from CouchDB.

    Task must exist in both PostgreSQL and CouchDB.

    Data returned:
        - id: the id of the task
        - token_id: the token id of the task
        - name: the name of the task
        - tags: the tags of the task
        - start_time: the start time of the task
        - time_taken: the time taken to complete the task
        - parameters: the parameters of the task
        - output_data: the output data of the task
        - status: the status of the task
        - status_code: the status code of the task
        - image: the image of the task
    """
    # Declare objects to not have to call the import multiple times
    task_obj = task.Task
    image_obj = image.Image

    selected_task = task_obj.query.filter_by(token_id=token_id).first()

    if not selected_task:
        return jsonify({"success": False, "message": "Task does not exist."}), 404

    # Fetch the task from CouchDB
    couch_task = get_task_from_couch(selected_task.token_id)
    if not couch_task:
        return jsonify({"success": False, "message": "Task does not exist."}), 404

    status = get_task_status(
        couch_task["lock"], couch_task["done"], couch_task["exit_code"]
    )

    selected_image = image_obj.query.filter_by(
        sylabs_path=couch_task["container_path"]
    ).first()

    if not selected_image:
        return jsonify({"success": False, "message": "Image does not exist."}), 404

    # Fetch parameters of selected image, if it doesn't have any, use empty array
    if selected_image.parameters:
        parameters = selected_image.parameters
    else:
        parameters = []

    task_data = {
        "id": selected_task.id,
        "token_id": selected_task.token_id,
        "name": selected_task.name,
        "tags": [
            {"id": tag.id, "name": tag.name, "type": tag.type}
            for tag in selected_task.tags
        ],
        "start_time": couch_task["start_time"],
        "time_taken": couch_task["time_taken"],
        "parameters": [
            {"name": param, "value": couch_task["Parameters"][param]}
            for param in parameters
        ],
        "output_data": couch_task["Output"],
        "status": status,
        "status_code": couch_task["exit_code"],
        "image": selected_image.name,
    }

    return jsonify(task_data)
