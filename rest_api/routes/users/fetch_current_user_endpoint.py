"""API endpoint to fetch information about the current user"""

from flask import jsonify
from ...models import tag
from ...lib.user_utils import get_user_by_session


def fetch_current_user():
    """
    Get the current user information.
    """
    u = get_user_by_session()

    if not u:
        return jsonify({"success": False, "message": "No user in session."}), 401

    t = tag.Tag.query.filter_by(name=u.email, type="user").first()

    if t:
        return jsonify(
            {
                "success": True,
                "id": u.id,
                "email": u.email,
                "roles": [r.name for r in u.roles],
                "tag": {"name": t.name, "id": t.id, "type": t.type},
            }
        )

    return jsonify({"success": False, "message": "User does not exist."}), 404
