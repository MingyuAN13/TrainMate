"""
API Endpoints for updating image data.
"""

from flask import jsonify, request
from ...models import image, role, db


def change_image_name():
    """
    Change the name of an image object in PostgreSQL.
    """

    data = request.get_json()
    # there must be a field for the previous name of the image and the new name for the image
    if not data_is_valid(data):
        return jsonify(
            {
                "succes": False,
                "message": "Data provided does not have the correct format.",
            }
        ), 406

    # retrieve data value
    previous_name = data["previous_name"]
    new_name = data["new_name"]

    # fetch the image, if it doesn't exist return an error message, otherwise rename it
    stored_image = image.Image.query.filter_by(name=previous_name).first()
    if not stored_image:
        return jsonify({"succes": False, "message": "Image does not exist."}), 404

    new_name_image = image.Image.query.filter_by(name=new_name).first()
    if new_name_image:
        return jsonify(
            {"succes": False, "message": "An image with this name already exists."}
        ), 409

    stored_image.name = new_name
    db.session.commit()

    return jsonify({"succes": True, "message": "Image name changed succesfully."})


def update_image_roles():
    """
    Update the roles assigned to an image object.
    """

    data = request.get_json()
    # there must be a filled in field for the name of the image and a nonempty field for the roles
    if not (len(data) == 2 and data.get("name") and data.get("roles")):
        return jsonify(
            {
                "succes": False,
                "message": "Data provided does not have the correct format.",
            }
        ), 406

    # retrieve data values
    image_name = data["name"]
    role_names = data["roles"]

    # fetch the image, if it doesn't exist return an error message
    stored_image = image.Image.query.filter_by(name=image_name).first()
    if not stored_image:
        return jsonify({"succes": False, "message": "Image does not exist."}), 404

    # get roles from PostgreSQL
    roles = [role.Role.query.filter_by(name=r).first() for r in role_names]

    # if any of the roles don't exist return an error
    if None in roles:
        return jsonify({"succes": False, "message": "Roles are not valid."}), 406

    # add roles specified to image
    stored_image.roles = roles
    db.session.commit()

    return jsonify({"success": True, "message": "Image roles updated succesfully."})

def data_is_valid(data):
    """
    Helper function to check if data is valid.
    """

    return len(data) == 2 and data.get("previous_name") and data.get("new_name") \
        and len(data.get("new_name")) <= 150 and len(data.get("previous_name")) <= 150
