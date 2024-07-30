"""Endpoint to delte a file from dcache"""

from ...lib.user_utils import authenticate_user_by_tag
from ...models.file import File
from ...models import db
from .interactor import interactor


def delete_file(file_id):
    """
    Delete a file on dCache.
    """
    # get the file
    file_to_delete = File.query.get_or_404(file_id)

    authenticate_user_by_tag(file_to_delete.tags)

    # delete the file on the database and dcache
    interactor.delete_file(file_to_delete.index[1:])
    File.query.filter_by(id=file_id).delete()
    db.session.commit()

    return "OK", 200
