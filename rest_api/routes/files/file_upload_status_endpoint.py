"""Send SSE for upload progress"""

from flask import Response
from .file_upload_endpoint import finished_uploads

def upload_status(uid):
    """
    Create an SSE stream that will send upload complete
    events as the server relays files.
    """

    def send_events():
        # for each user send updates as the files finish
        while uid in finished_uploads:
            keys_to_remove = []
            # check if the files are done uploading
            for path in finished_uploads[uid]:
                if finished_uploads[uid][path]:
                    keys_to_remove.append(path)
                    # send the update
                    yield f"data: {path}\n\n"
            # cleanup the queues
            for path in keys_to_remove:
                if len(finished_uploads[uid]) == 1:
                    finished_uploads.pop(uid)
                else:
                    finished_uploads[uid].pop(path)

    # return sse's and keep connenction open
    return Response(
        send_events(),
        mimetype="text/event-stream",
        headers={"Content-Encoding": "none"},
    )
