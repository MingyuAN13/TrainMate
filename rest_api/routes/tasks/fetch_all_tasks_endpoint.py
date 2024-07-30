"""
API Endpoints for fetching task list.
"""

from flask import jsonify
from ...models.image import Image
from ...lib.tasks_fetch_utils import get_task_from_couch, fetch_postgres_tasks
from ...lib.tasks_fetch_dcache_utils import create_output_file


def fetch_all_tasks():
    """
    Fetch the tasks from PostgreSQL for which the user has permission and get extra information from CouchDB.

    Data returned for each task:
        - id: the id of the task
        - token_id: the token id of the task
        - name: the name of the task
        - tags: the tags of the task
        - status: the status of the task
        - status_code: the status code of the task
        - image: the image of the task

    """

    tasks = fetch_postgres_tasks()

    tasks_data = []
    for selected_task in tasks:

        # If the task is in CouchDB we fetch it and fetch the values
        couch_task = get_task_from_couch(selected_task.token_id)

        if not couch_task:
            continue

        selected_image = Image.query.filter_by(
            sylabs_path=couch_task["container_path"]
        ).first()

        if not selected_image:
            continue


        # Get information from CouchDB and store all info in dictionary format
        task_status = get_task_status(
            couch_task["lock"], couch_task["done"], couch_task["exit_code"]
        )

        # If a file is done we should check whether the output file exists in postgres and add it if it doesn't
        # and we should delete the input folder that was created for it
        if task_status == "done":
            create_output_file(
                couch_task["Input"][8:],
                couch_task["Output"][8:],
                selected_task.tags,
            )

        tasks_data += [
            {
                "id": selected_task.id,
                "token_id": selected_task.token_id,
                "name": selected_task.name,
                "tags": [
                    {"id": tag.id, "name": tag.name, "type": tag.type}
                    for tag in selected_task.tags
                ],
                "status": task_status,
                "status_code": couch_task["exit_code"],
                "image": selected_image.name,
            }
        ]

    return jsonify(tasks_data)


def get_task_status(lock, done, exit_code):
    """Helper function to get the status of a task. We should probably do this with the monitor in CouchDB but I'm not
    sure if that works."""

    if lock == 0 and done == 0:
        return "todo"
    if lock > 0 and done == 0:
        return "locked"
    if lock > 0 and done > 0 and exit_code == 0:
        return "done"
    return "error"
