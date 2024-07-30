"""
API endpoints for fetching files.
"""

from flask import jsonify, request
from ...models.file import File
from ...lib.user_utils import get_user_by_session


def fetch_files():
    """
    Fetch files from the database.
    It will only return files that the user has access to.
    Optional parameters:
    - search: a string to search for in the file name
    - tags: a list of tag ids to filter the files by
    - page: the page number to fetch (default is 1)
    - per_page: the number of files to fetch per page (default is 10, between 1 and 100)
    """
    # Because the fanout counts every instance of the object called as a fanout, we just import it once and then use it.
    file = File

    # Get the user's email from the session
    user = get_user_by_session()

    if not user:
        return jsonify({"success": False, "message": "no session"}), 406

    search = request.args.get("search", type=str)
    tags = request.args.getlist("tags", type=int)
    page = request.args.get("page", type=int, default=1)
    per_page = request.args.get("per_page", type=int, default=20)

    # Check if the page is valid
    if page < 1:
        return jsonify({"success": False, "message": "Invalid page number."}), 406

    # Check if the per_page is valid
    if per_page < 1 or per_page > 200:
        return jsonify({"success": False, "message": "Invalid per_page number."}), 406

    # Fetch all the files that the user has access to
    res = file.query.join(file.tags).filter(
        file.tags.any(name=user.email),
    )

    # Filter the files by the name of the file
    if search:
        res = res.filter(file.index.like(f"%{search}%"))

    # Filter the files by the tags
    if tags:
        for tag_id in tags:
            res = res.filter(file.tags.any(id=tag_id))

    res = res.order_by(file.id)

    # Paginate the files
    res = res.paginate(page=page, per_page=per_page)

    # Return the files
    files = res.items

    # Create json for the files
    files_data = [
        {
            "id": f.id,
            "index": f.index,
            "type": f.type,
            "tags": [
                {
                    "id": t.id,
                    "name": t.name,
                    "type": t.type,
                }
                for t in f.tags
            ],
        }
        for f in files
    ]

    if res.has_next:
        next_url = get_next_url(search, tags, res.next_num, per_page)
    else:
        next_url = None

    return jsonify(
        {
            "success": True,
            "message": "Files fetched successfully.",
            "files": files_data,
            "next": next_url,
        }
    ), 200


def get_next_url(search, tags, page, per_page):
    """
    Get the next url for the files endpoint based on the current request.
    """
    next_url = f"/api/files?page={page}&per_page={per_page}"
    if search:
        # We want to keep the search parameter in the next url
        next_url += f"&search={search}"
    if tags:
        # We want to keep the tags parameter in the next url
        # to have multiple tags we specify the tags parameter multiple times, so &tags=1&tags=2&tags=3
        for tag_id in tags:
            next_url += f"&tags={tag_id}"
    return next_url
