"""
API endpoints for fetching custom tags by admin.
"""

from flask import jsonify
from ...models import tag


def fetch_custom_tags():
    """
    Endpoint for fetching custom tags.
    """

    tags = tag.Tag.query.filter_by(type="custom").all()

    tags_data = [{"id": t.id, "name": t.name} for t in tags]

    return jsonify(tags_data)
