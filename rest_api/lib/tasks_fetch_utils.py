"""This class contains Helper functions for fetching tasks and to check if a task exists in CouchDB."""

from ..models import task, db
from ..couch_init import couch_db
from .user_utils import get_user_by_session

def fetch_postgres_tasks():
    """Helper function to retrieve all tasks from PostgreSQL"""

    # declare objects to not have to call the import multiple times
    task_obj = task.Task

    # Get user from the session.
    user = get_user_by_session()

    tasks = task_obj.query.join(task_obj.tags).filter_by(name=user.email).all()
    return tasks


def get_task_from_couch(token_id):
    """Helper function to check whether a task exists in CouchDB, if it doesn't, it is deleted from PostgreSQL."""

    task_obj = task.Task

    # Check if the task is in CouchDB
    if token_id not in couch_db:
        # If it doesn't exist, delete the PostgreSQL task if this one does exist
        if task_obj.query.filter_by(token_id=token_id):
            task_obj.query.filter_by(token_id=token_id).delete()
            db.session.commit()
        return None

    couch_task = couch_db.get(token_id)

    return couch_task
