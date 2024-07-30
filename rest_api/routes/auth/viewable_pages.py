"""Creates a dictionary of what pages are accessable to the user"""

from flask import jsonify

from .authorization import role_to_hrefs_labels
from ...lib.user_utils import get_user_by_session


def viewable_pages():
    """Takes the given role array and translate it to the corresponding page"""

    user = get_user_by_session()
    if not user:
        return jsonify({"success": False, "message": "Session not found"}), 401

    roles = user.roles
    pages_dict = []

    # Returns an error if the roles object is a null array.
    if roles is None:
        return jsonify({"success": False, "message": "Null roles"}), 406

    for role in roles:
        if role.name in role_to_hrefs_labels:
            role_links = role_to_hrefs_labels.get(role.name, [])
            pages_dict.extend(role_links)

    # Remove duplicate links in the array.
    pages_dict = [dict(t) for t in {tuple(d.items()) for d in pages_dict}]

    # Sort the links in the array
    pages_dict = sorted(pages_dict, key=lambda x: x["label"])

    # Returns the array of links and lables.
    return (
        jsonify({"success": True, "message": "Roles found", "links": pages_dict}),
        200,
    )
