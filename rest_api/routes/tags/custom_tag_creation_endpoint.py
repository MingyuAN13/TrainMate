"""
API endpoint for custom tag creation by admin.
"""

from flask import request, jsonify
from ...models import tag, db

def create_custom_tag():
    """
    Endpoint for creating a custom tag by the Admin.
    """

    # Get name from request
    data = request.get_json()

    tag_name = data.get("name")

    # Check if json is valid
    if len(data) != 1 or not tag_name:
        return jsonify({"success": False, "message": "Data provided is invalid."}), 406

    # Check if tag already exists
    new_tag = tag.Tag.query.filter_by(name=tag_name).first()

    if new_tag:
        return jsonify({"success": False, "messgae": "Tag name exists."}), 409

    # Add new custom tag to database
    new_tag = tag.Tag(name=tag_name, type="custom")

    db.session.add(new_tag)
    db.session.commit()

    return jsonify({"success": True, "message": "Custom tag created successfully."}), 200
