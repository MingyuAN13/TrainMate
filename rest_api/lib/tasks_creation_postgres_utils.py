"""
Helper functions for task creation for operations in PostgreSQL.
"""

from flask import abort
from ..models import task, db, tag, image
from .user_utils import get_user_by_session


def check_image_access(selected_image):
    """
    Helper function to check user's image accessibility.
    """

    user = get_user_by_session()
    if not user or not any(r in selected_image.roles for r in user.roles):
        return False

    return True


def get_image_url(image_name):
    """Helper function to retrieve the sylabs path of an image."""

    selected_image = image.Image.query.filter_by(name=image_name).first()
    image_url = selected_image.sylabs_path

    return image_url


def add_to_postgres(token_id, task_name, tag_names):
    """Helper function to create a task object in PostgreSQL for the taskand add the tags to it."""

    task_obj = task.Task
    tag_obj = tag.Tag

    # Get tag objects corresponding to the specified tag names
    tags_to_add = db.session.query(tag_obj).filter(tag_obj.name.in_(tag_names)).all()

    # check if a task with this token exists in PostgreSQL and delete it if it does
    # if a task with this token already exists, it should be deleted as we cannot retrieve the information from CouchDB
    new_task = task_obj.query.filter_by(token_id=token_id).first()
    if new_task:
        task_obj.query.filter_by(token_id=new_task.token_id).delete()

    # create task object
    new_task = task_obj(token_id=token_id, name=task_name)
    db.session.add(new_task)

    # add the user's email so they can see the task
    user = get_user_by_session()
    if not user:
        abort(401)

    user_tag = tag_obj.query.filter_by(name=user.email).first()
    new_task.tags.append(user_tag)

    # add tags specified by user
    for tag_to_add in tags_to_add:
        if tag_to_add is not None and tag_to_add != user_tag:
            new_task.tags.append(tag_to_add)

    db.session.commit()
