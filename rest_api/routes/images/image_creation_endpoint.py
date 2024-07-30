"""
API Endpoints for image creation.
"""

from flask import jsonify, request
from ...models import image, role, db


def create_image():
    """
    Create an image object in PostgreSQL.
    """

    data = request.get_json()
    # there must be filled fields for the name, roles and path in sylabs and a (possibly empty) field for parameters
    if not data_is_valid(data):
        return jsonify(
            {
                "succes": False,
                "message": "Data provided does not have the correct format.",
            }
        ), 406

    # retrieve data values
    image_name = data["name"]
    role_names = data["roles"]
    parameters = list(data["parameters"])
    sylabs_path = data["sylabs_path"]

    # check if length of name and sylabs path is okay
    if len(image_name) > 150 or len(sylabs_path) > 150:
        return jsonify(
            {"succes": False, "message": "Sylabs path or image name is too long."}
        ), 406

    # if an image with the same name or sylabs path exists return an error
    image_with_name = image.Image.query.filter_by(name=image_name).first()
    image_with_path = image.Image.query.filter_by(sylabs_path=sylabs_path).first()
    if image_with_name or image_with_path:
        return jsonify(
            {"succes": False, "message": "Sylabs path and image name must be unique."}
        ), 409

    # get roles from PostgreSQL
    roles = [role.Role.query.filter_by(name=r).first() for r in role_names]
    # if any of the roles don't exist return an error
    if None in roles:
        return jsonify({"succes": False, "message": "Roles are not valid."}), 406

    # create object in PostgreSQL
    new_image = image.Image(
        name=image_name, sylabs_path=sylabs_path, parameters=parameters, roles = roles
    )

    db.session.add(new_image)
    db.session.commit()

    return jsonify(
        {"success": True, "message": "Image data uploaded to PostgreSQL successfully."}
    )

def data_is_valid(data):
    """
    Helper function to check validity of data.
    """

    return len(data) == 4 and data.get("name") and data.get("roles") \
            and data.get("sylabs_path") and "parameters" in data
