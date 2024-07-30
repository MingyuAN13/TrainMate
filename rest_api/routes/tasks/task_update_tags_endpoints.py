"""
API Endpoints updating tags linked to tasks.
"""

from flask import request, jsonify
from ...models import task, db, tag
from ...lib.user_utils import get_user_by_session


def update_tags_for_task(token_id):
    """
    Update tag(s) added to the task in PostgreSQL.
    """

    tag_obj = tag.Tag
    task_obj = task.Task

    data = request.get_json()

    # Check data validity
    if len(data) != 1 or data.get("tags") is None:
        return jsonify({"success": False, "message": "Data provided is invalid."}), 406

    tag_names = data["tags"]

    # Check if the task exists
    selected_task = task_obj.query.filter_by(token_id=token_id).first()

    if not selected_task:
        return jsonify({"success": False, "message": "Task does not exist."}), 404

    tags = db.session.query(tag_obj).filter(tag_obj.name.in_(tag_names)).all()
    # Update the tags for the task to be the tags specified
    selected_task.tags = tags
    selected_task.tags = [tag for tag in selected_task.tags if tag is not None]

    # Keep the user's tag
    user = get_user_by_session()
    if not user:
        return jsonify({"success": False, "message": "No user in session."}), 401

    user_tag = tag_obj.query.filter_by(name=user.email).first()
    if not user_tag:
        return jsonify({"success": False, "message": "User does not exist."}), 404

    if user_tag not in selected_task.tags:
        selected_task.tags.append(user_tag)

    db.session.commit()

    return jsonify({"success": True, "message": "Token tags updated."})
