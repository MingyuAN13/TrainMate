"""
Endpoint to download a file or folder from dcache
"""

import io
import zipstream

from flask import Response, abort
from ...models import file, tag
from ...lib.user_utils import get_user_by_session
from .interactor import interactor


def download_file(file_id):
    """
    Downloads a file or folder from dcache
    """
    # get the file to download
    file_to_download = file.File.query.get_or_404(file_id)
    file_type = file_to_download.type
    file_name = file_to_download.index[1:]

    # get the user
    user = get_user_by_session()
    if not user:
        abort(401)
    user_tag = tag.Tag.query.filter_by(name=user.email).first()

    # make sure user has access to file
    if user_tag not in file_to_download.tags:
        abort(401)

    # if it's a file just download it
    if file_type == "file":

        dcache_file = io.BytesIO(interactor.get_file(file_name).content)

        def generate():
            # stream the file in chunks
            while chunk := dcache_file.read(1000):
                yield chunk

        # return the file chunks
        response = Response(generate(), content_type="application/octet-stream")
        response.headers["Content-Disposition"] = f"attachment; filename={file_name}"
        return response

    # if it's a directory stream it a zip file
    dcache_file_paths = interactor.get_dir_content_recursive(file_name)

    def stream_file():
        zip_stream = zipstream.ZipFile(mode="w", compression=zipstream.ZIP_DEFLATED)
        for file_path in dcache_file_paths:
            with interactor.get_file(file_path) as r:
                r.raise_for_status()
                # read the files in chunks
                file_content = b"".join(r.iter_content(chunk_size=1000))
                if file_content:
                    zip_stream.write_iter(file_path, [file_content])
        # send chunk of zip file
        yield from zip_stream

    # start zip stream
    response = Response(stream_file(), content_type="application/zip")
    response.headers["Content-Disposition"] = f"attachment; filename={file_name}.zip"
    return response
