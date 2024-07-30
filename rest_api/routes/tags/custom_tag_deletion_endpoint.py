"""
API endpoints for custom tag deletion by admin.
"""

from flask import request, jsonify
from ...models import tag, db


def delete_custom_tag():
    """
    Endpoint for deleting a custom tag by the Admin.
    """

    # Get name from request
    data = request.get_json()

    tag_name = data.get("name")

    # Check if json is valid
    if len(data) != 1 or not tag_name:
        return jsonify({"success": False, "message": "Data provided is invalid."}), 406

    # Check if tag exists
    tag_to_delete = tag.Tag.query.filter_by(name=tag_name).first()

    if not tag_to_delete:
        return jsonify({"success": False, "messgae": "Tag does not exist."}), 406

    # Delete tag from database
    tag.Tag.query.filter_by(name=tag_name, type="custom").delete()

    db.session.commit()

    return jsonify(
        {"success": True, "message": "Custom tag deleted successfully."}
    ), 200
