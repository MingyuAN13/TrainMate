"""
API Endpoint for image fetching.
"""

from flask import jsonify
from ...models import image
from ...lib.user_utils import get_user_by_session


def fetch_images():
    """
    Endpoint to fetch images the user has access to.
    """

    image_obj = image.Image

    # Get user email from session
    user = get_user_by_session()

    if not user:
        return jsonify({"success": False, "message": "No user in session."}), 401

    # Query all images user should have access to, maintainer has access to all images
    if any(r.name == "Maintainer" for r in user.roles):
        images = image_obj.query.all()
    else:
        images = []
        for r in user.roles:
            images.extend(
                image_obj.query.filter(image_obj.roles.any(name=r.name)).all()
            )

    # return json with the name and id of every image user has access to
    images_data = [
        {
            "id": im.id,
            "name": im.name,
            "sylabs_path": im.sylabs_path,
            "parameters": im.parameters,
            "roles": [r.name for r in im.roles],
        }
        for im in images
    ]

    return jsonify(images_data)
