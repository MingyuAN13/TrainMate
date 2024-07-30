"""Middleware for authorization of users"""

import re
from . import Request, Response
from .. import datetime
from ..models import task, session, db


class AuthorizationMiddleware:
    """
    The authorization middleware class.
    It checks if the user is authorized to access the requested endpoint.
    If the user is not authorized, it returns a 401 Unauthorized response.

    Some endpoints are always allowed, regardless of the user's role.
    """

    # add paths for resource access, mapped to their respective roles
    roles_paths = {
        "Admin": [
            "/api/users/admin",
            "/api/roles/admin",
            "/api/tags/admin",
            "/api/tags/admin",
            "/api/roles",
        ],
        "Data Engineer": [
            "/api/tasks",
            "/api/tasks/",
            "/api/tags",
            "/api/images",
            "/api/images/stored_parameters",
            "/api/files",
            "/api/files/upload",
            "/api/files/download",
            "/api/files/statusstream",
        ],
        "AI Researcher": [
            "/api/tasks",
            "/api/tasks/",
            "/api/tags",
            "/api/images",
            "/api/images/stored_parameters",
            "/api/files",
            "/api/files/upload",
            "/api/files/statusstream",
        ],
        "Maintainer": ["/api/images", "/api/images", "/api/roles"],
    }

    def __init__(self, app_wsgi, app):
        """Constructor for the authorization middlware class"""
        self.app_wsgi = app_wsgi
        self.app = app

        # Always allow the user to access the following endpoints
        self.excluded_routes = [
            "/api/auth/register",
            "/api/auth/login",
            "/api/health",
            "/api/auth/logout",
            "/api/users/roles",
            "/api/auth/viewable_pages",
            "/api/auth/user_authorized",
            "/api/users/email",
            "/api/users/current"
        ]

        # For the specific tasks endpoints, we want to check regardless of the id
        self.pattern = re.compile(r"^/api/tasks/([a-zA-Z0-9_]+)$")

    def unauthorized(self, environ, start_response):
        """Unauthorized access response generation: 401"""

        # Generate the 401 response in case the user in unauthorized for viewing the page
        response = Response(
            response={"success": False, "message": "Unauthorized request!"},
            mimetype="application/json",
            status=401,
        )

        return response(environ, start_response)

    def ok(self, environ, start_response):
        """Accept response generation: 200"""

        # relay the response in the case of a correct request
        return self.app_wsgi(environ, start_response)

    def role_authorized(self, user_object, request_path):
        """Check if the user role is compatible with resource access"""
        for role in user_object.roles:
            # check if the requested path is in the allowed paths for the client's role
            if request_path in self.roles_paths[role.name]:
                return True

        return False

    def check_user_task_permission(self, user_object, task_object):
        """This function checks if the user has access permissions for a specific task"""
        for tag in task_object.tags:
            # check if the user has permission to access the task
            if user_object.email == tag.name:
                return True

        return False

    def __call__(self, environ, start_response):
        """This method is called every time a request is made with a middlware attached to it"""
        with self.app.app_context():
            request = Request(environ)

            # Relay response directly, if the reuqested path is excluded from authorization
            if request.path in self.excluded_routes:
                return self.ok(environ, start_response)

            # Get session token from the request headers
            session_id = request.cookies.get("session-id")

            # Unauthorized if session id does not exist in the cookie
            if not session_id:
                return self.unauthorized(environ, start_response)

            # Get the session data for the particular session
            sess = session.Session.query.filter_by(session_token=session_id).first()

            # Delete session if its time has expired or if the session does not have email in the data field
            if not sess or datetime.now() >= sess.expiration_datetime:
                # delete the session
                session.Session.query.filter_by(session_token=session_id).delete()
                db.session.commit()

                return self.unauthorized(environ, start_response)

            u = sess.user

            # Match path with format /api/tasks/<token_id>
            match = self.pattern.match(request.path)

            # Unauthorized if the user does not exist
            if not u:
                return self.unauthorized(environ, start_response)

            # if there is a regular expression match, initiate resource permission and role checking
            if match:
                token_id = match.group(1)
                # Query task by task id
                t = task.Task.query.filter_by(token_id=token_id).first()

                if t:
                    # Check role and user tag existence
                    r_path = request.path
                    r_path = r_path.replace(token_id, "")

                    # if the role or the user permission for the task resource check fails, unauthorized
                    if not self.role_authorized(
                        u, r_path
                    ) or not self.check_user_task_permission(u, t):
                        return self.unauthorized(environ, start_response)

            # check for role authorization if the requested path is in the application url endpoints
            elif request.path in [
                iteration_rule.rule for iteration_rule in self.app.url_map.iter_rules()
            ]:
                if not self.role_authorized(u, request.path):
                    return self.unauthorized(environ, start_response)

            # Relay response from the endpoint to the client if all checks succeed
            return self.ok(environ, start_response)
