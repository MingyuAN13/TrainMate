"""
This class contains a function to register tasks blueprints.
"""

from .fetch_all_tasks_endpoint import fetch_all_tasks
from .fetch_single_task_endpoint import fetch_single_task_info
from .task_delete_endpoints import delete_task
from .task_creation_endpoints import create_task
from .task_update_tags_endpoints import update_tags_for_task


def register_tasks_blueprints(blueprint):
    """
    This function registers the blueprints for tasks endpoints.
    """
    # This route handles the fetching of all tasks stored in PostgreSQL for which the user has permission
    blueprint.add_url_rule("/api/tasks", view_func=fetch_all_tasks, methods=["GET"])
    # This route handles adding a task to PostgreSQL
    blueprint.add_url_rule("/api/tasks", view_func=create_task, methods=["POST"])
    # This route handles the fetching of a single task.
    blueprint.add_url_rule(
        "/api/tasks/<string:token_id>",
        view_func=fetch_single_task_info,
        methods=["GET"],
    )
    # This route handles updating tags for a task in PostgreSQL
    blueprint.add_url_rule(
        "/api/tasks/<string:token_id>",
        view_func=update_tags_for_task,
        methods=["PATCH"],
    )
    # This route handles the deletion of a task from PostgreSQL and the corresponding token in CouchDB.
    blueprint.add_url_rule(
        "/api/tasks/<string:token_id>", view_func=delete_task, methods=["DELETE"]
    )
