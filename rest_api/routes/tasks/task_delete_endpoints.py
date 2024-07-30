"""
API Endpoints for deleting tasks.
"""

from flask import jsonify
from ...models import task, db
from ...couch_init import couch_db


def delete_task(token_id):
    """
    Delete a task from postgres and delete the corresponding token from CouchDB.
    """

    task_obj = task.Task

    # Retrieve the task
    task_to_delete = task_obj.query.filter_by(token_id=token_id).first()

    if not task_to_delete:
        # return fail message
        return jsonify({"success": False, "message": "Task does not exist."}), 404

    # Delete the token from CouchDB if it's there
    if task_to_delete.token_id in couch_db:
        couch_db.delete(couch_db.get(token_id))

    # Delete from Postgres and return succes message
    task_obj.query.filter_by(token_id=token_id).delete()
    db.session.commit()

    return jsonify({"success": True, "message": "Task has been deleted."})
