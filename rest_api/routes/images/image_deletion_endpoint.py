"""
API Endpoint for image deletion.
"""

from flask import jsonify, request
from ...models import image, db


def delete_image():
    """
    Delete an image object from PostgreSQL.
    """

    # Check data validity
    data = request.get_json()

    if not (len(data) == 1 and data.get("name")):
        return jsonify(
            {
                "succes": False,
                "message": "Data provided does not have the correct format.",
            }
        ), 406

    # retrieve data value
    image_name = data["name"]

    # fetch the image, if it doesn't exist return an error message, otherwise delete it
    stored_image = image.Image.query.filter_by(name=image_name).first()
    if not stored_image:
        return jsonify({"succes": False, "message": "Image does not exist."}), 404

    # Delete image
    image.Image.query.filter_by(name=image_name).delete()
    db.session.commit()

    return jsonify({"succes": True, "message": "Image deleted succesfully."})
