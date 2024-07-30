"""
API Endpoint for fetching the parameters of previous runs.
"""

from flask import request, jsonify
from ...models import task, image
from ...couch_init import couch_db
from ...lib.user_utils import get_user_by_session

def fetch_stored_parameters():
    """
    Fetch the previously used parameters for all runs corresponding to a certain image.
    """

    task_obj = task.Task
    data = request.get_json()

    # data must only have a field corresponding to the image name
    if len(data) != 1 or not data.get("name"):
        return jsonify({"success": False, "message": "Data provided is invalid."}), 406

    image_name = data["name"]

    # get the image url to compare it to the value in the tokens and check whether the user has access to the image
    selected_image = image.Image.query.filter_by(name = image_name).first()

    if not selected_image:
        return jsonify({"success": False, "message": "Image does not exist."}), 404

    user = get_user_by_session()

    image_url = selected_image.sylabs_path

    access = user and any(r in selected_image.roles for r in user.roles)

    if not access:
        return jsonify(
            {"success": False, "message": "User does not have access to this image."}
        ), 401

    # get all tasks the user has access to
    user_tasks = task_obj.query.filter(task_obj.tags.any(name=user.email)).all()

    parameters = []
    for t in user_tasks:
        couch_task = couch_db.get(t.token_id)
        if not couch_task:
            continue

        if couch_task["container_path"] == image_url:
            parameters += [{t.name: couch_task["Parameters"]}]

    return jsonify(parameters)
