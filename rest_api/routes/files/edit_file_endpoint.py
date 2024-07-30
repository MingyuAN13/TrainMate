"""Endpoint to edit the tags of a file"""

from flask import request, jsonify, abort
from ...models import file, tag, db
from ...lib.user_utils import get_user_by_session


def edit_file(file_id):
    """
    Edit information related to a file on dCache.

    The json data should contain the following fields:
    - tags: a list of tag ids
    """
    # get the file to edit
    file_to_edit: file.File = file.File.query.get_or_404(file_id)

    # get the user tag
    user = get_user_by_session()
    if not user:
        abort(401)
    user_tag = tag.Tag.query.filter_by(name=user.email).first()

    # make sure user has access to file
    if user_tag is None or user_tag not in file_to_edit.tags:
        abort(401)

    # get request data
    data = request.get_json()

    if "tags" not in data:
        return jsonify(
            {
                "success": False,
                "message": "Data provided is invalid, needs to have a tags field with the tag ids.",
            }
        ), 409

        # assign tags from request
    tag_array = [user_tag]
    for new_tag in data["tags"]:
        if new_tag is None:
            continue
        tag_array.append(tag.Tag.query.get_or_404(new_tag))

    file_to_edit.tags = tag_array

    db.session.commit()

    return jsonify({"success": True, "message": "File tags updated successfully."})
