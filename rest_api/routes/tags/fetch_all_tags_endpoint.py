"""
API endpoints for fetching all tags.
"""

from flask import jsonify
from ...models import tag


def fetch_all_tags():
    """
    Endpoint for fetching all tags.
    """

    tags = tag.Tag.query.all()

    tags_data = [{"id": t.id, "name": t.name, "type": t.type} for t in tags]

    return jsonify(tags_data)
