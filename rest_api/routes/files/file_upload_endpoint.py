# validate-ignore
"""The endpoint for uploading files or directories."""

import io
import os
import logging

from flask import abort, request
from ...file_converter import FileConverter
from ...models import file, tag, db
from ...lib.user_utils import get_user_by_session
from .interactor import interactor

logging.basicConfig(level=logging.DEBUG)

converter = FileConverter()

# queue of files waiting to be uploaded
upload_queue = {}
# items that have been uploaded
finished_uploads = {}

# create the saving directory
UPLOAD_FOLDER = '/app/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


class FileClass:
    """A class that helps access some usefull properties of a file."""

    def __init__(self, file_data, path, address):
        # define all the parameters neccessery for indexing and uploading file
        name_parts = file_data.filename.rsplit(".", 1)
        self.name = name_parts[0]
        self.ext = name_parts[-1]

        self.path = path
        self.address = address
        
        # whether the file is in a directory
        self.is_dir_item = "/" in path
        self.root_name = path.split("/", 1)[0] + "/" if self.is_dir_item else "/"
        self.path_to_file = path.rsplit("/", 1)[0] if self.is_dir_item else ""
        
        # Log for debugging
        logging.debug(f"Initializing FileClass with name: {self.name}, ext: {self.ext}, path: {self.path}, address: {self.address}")


def generate_queues(files, uid):
    """
    Generates queues to keep track of which files have been uploaded
    """
    logging.debug("Generating upload queues")
    for path, uploaded_file in files:
        # process the files to be uploaded to seperate into queues
        if uploaded_file.name is None or uploaded_file.name.isspace():
            # cleanup  queue
            if upload_queue[uid] is not None:
                upload_queue.pop(uid)
            # send back error
            abort(500)
        # check if the file is in a directory
        is_dir_item = "/" in path
        if is_dir_item:
            root_name = path.split("/")[0] + "/"
        else:
            root_name = "/"

        # insert into queues
        if root_name in upload_queue[uid]:
            upload_queue[uid][root_name].add(path)
        else:
            upload_queue[uid][root_name] = {path}

        # set finished state
        if is_dir_item:
            finished_uploads[uid][root_name] = False
        else:
            finished_uploads[uid][path] = False
    logging.debug(f"Upload queues generated for uid: {uid}")


def upload_jpegs(up_file: FileClass, jpegs: list):
    """Upload mp4 to jpeg conversion."""
    # save as directory of jpegs
    if up_file.is_dir_item:
        upload_path = f"{up_file.path_to_file}/{up_file.name}"
    else:
        upload_path = f"{up_file.name}"
    # upload each image into a directory named after the mp4
    for i, img in enumerate(jpegs):
        byte_stream = io.BytesIO(img)
        with byte_stream as f:
            # save to local
            save_path = os.path.join(UPLOAD_FOLDER, f"{upload_path}_frame_{i}.jpeg")
            with open(save_path, 'wb') as local_file:
                local_file.write(f.read())
            logging.debug(f"File saved locally as: {save_path}")
            
            # the target path to dcache
            address = up_file.address
            
            print("file_upload_endpoint")
            logging.debug(f"Uploading JPEG: {upload_path}/frame_{i}.jpeg")
            interactor.upload_to_dcache(save_path, address)
            
            os.remove(save_path)


def upload_pickle(up_file: FileClass, jpegs: list):
    """Upload pickle mp4 to pickle conversion."""
    # create the new name for the file
    new_name = f"{up_file.name}.pickle"
    # select the path based on directory structure
    if up_file.is_dir_item:
        upload_path = f"{up_file.path_to_file}/{new_name}"
    else:
        upload_path = f"{new_name}"
    # create the pickle
    pickle = converter.jpeg_to_pickle(jpegs)
    with pickle as f:
        # save to local
        save_path = os.path.join(UPLOAD_FOLDER, new_name)
        with open(save_path, 'wb') as local_file:
            local_file.write(f.read())
        logging.debug(f"File saved locally as: {save_path}")
        
        # the target path to dcache
        address = up_file.address
        
        logging.debug(f"Uploading Pickle: {upload_path}")
        # upload pickle to dcache
        interactor.upload_to_dcache(save_path, address)
        
        os.remove(save_path)


def upload_h5(up_file: FileClass, jpegs: list):
    """Upload mp4 to h5 conversion."""
    # create the new name for the file
    new_name = f"{up_file.name}.h5"
    # select the path based on directory structure
    if up_file.is_dir_item:
        upload_path = f"{up_file.path_to_file}/{new_name}"
    else:
        upload_path = f"{new_name}"
    # create the h5
    h5 = converter.jpeg_to_h5(jpegs)
    with h5 as f:
        # save to local
        save_path = os.path.join(UPLOAD_FOLDER, new_name)
        with open(save_path, 'wb') as local_file:
            local_file.write(f.read())
        logging.debug(f"File saved locally as: {save_path}")
        
        # the target path to dcache
        address = up_file.address
        
        # upload h5 to dcache
        interactor.upload_to_dcache(save_path, address)
        
        os.remove(save_path)


def handle_conversions(uploaded_file: FileClass, file_format: str, jpegs: list):
    """Handle file conversions and upload."""
    if file_format == "jpeg":
        # save as directory of jpegs
        upload_jpegs(uploaded_file, jpegs)
        file_type = "directory"
        index = f"/{uploaded_file.name}"
    elif file_format == "pickle":
        # convert to pickle
        new_name = f"{uploaded_file.name}.pickle"
        file_type = "file"
        index = f"/{new_name}"
        upload_pickle(uploaded_file, jpegs)
    elif file_format == "h5":
        # convert to h5
        new_name = f"{uploaded_file.name}.h5"
        file_type = "file"
        index = f"/{new_name}"
        upload_h5(uploaded_file, jpegs)
    else:
        # This is not a possible outcome
        index = "/"
        file_type = "file"
        abort(500)
    return index, file_type


def handle_database_entry(
    uploaded_file: FileClass, index: str, file_type: str, uid: str, user_email: str
):
    """Handle creating the database entry for the file"""
    logging.debug(f"Handling database entry for {uploaded_file.name}")
    
    # create a new entry as a file
    file_row = file.File()
    if not uploaded_file.is_dir_item:
        # if the file is at the root
        file_row.type = file_type
        file_row.index = index
        finished_uploads[uid][uploaded_file.path] = True
    else:
        # if the file is at the root
        file_row.type = "directory"
        file_row.index = f"/{uploaded_file.root_name}"
        finished_uploads[uid][uploaded_file.root_name] = True
    # assign the tags
    tag_ids = request.form.getlist("tags[]")
    tags = tag.Tag.query.filter(tag.Tag.id.in_(tag_ids)).all()
    user_tag = tag.Tag.query.filter_by(name=user_email).first()
    # always assing the user tag
    tags.append(user_tag)
    file_row.tags = tags
    db.session().add(file_row)
    db.session().commit()
    logging.debug("Database entry committed")

def upload_file():
    """
    Upload a file to dCache.
    """
    logging.info("File upload initiated")
    # get data from request
    data = request.form
    # get the conversion format
    file_format = data.get("format")

    # malformed request
    if file_format is None:
        logging.error("File format not specified")
        abort(400)

    files = list(request.files.items())

    # get user id and email
    user = get_user_by_session()
    if not user:
        logging.error("User not authenticated")
        abort(401)
        
    user_dir = os.path.join(UPLOAD_FOLDER, str(user.id))  # with unique user name
    if not os.path.exists(user_dir):
        os.makedirs(user_dir, mode=0o700)  # set the authorization

    uid = user.id

    # populate the queeus
    upload_queue[uid] = {}
    finished_uploads[uid] = {}
    generate_queues(files, uid)

    # go through each file and upload
    for path, file_data in files:
        # get the name without extention
        if file_data.filename is None:
            logging.error("Unnamed files in upload batch")
            return "Unnamed files in upload batch", 500
        
        address_key = f"{path}_address"
        address = data.get(address_key, None)

        uploaded_file = FileClass(file_data=file_data, path=path, address=address)
        
        # creat the directory and save the file to /app/uploads/
        save_path = os.path.join(user_dir, uploaded_file.name + "." + uploaded_file.ext)
        
        # save to /app/uploads
        file_data.save(save_path)
        logging.info(f"File is saved to local: {save_path}")

        if file_format != "none" and uploaded_file.ext == "mp4":
            # the file is an mp4 file that needsd conversion
            jpegs = converter.mp4_to_jpeg(file_data)
            index, file_type = handle_conversions(
                uploaded_file=uploaded_file, file_format=file_format, jpegs=jpegs
            )
        else:
            # select the upload path with no conversions
            index = f"/{path}"
            file_type = "file"
            logging.debug(f"Uploading file without conversion: {file_data}")
            interactor.upload_to_dcache(save_path, address)
            os.remove(save_path)
            
        # Only insert into the database after all file chunks have been uploaded
        if (
            not uploaded_file.is_dir_item  # If the uploaded file is not part of a directory
            or len(upload_queue[uid][uploaded_file.root_name]) == 1  # Or this is the last file to be uploaded
        ):
            handle_database_entry(
                uploaded_file=uploaded_file,
                index=index,
                file_type=file_type,
                uid=uid,
                user_email=user.email,
            )

        # cleanup the queue only after all file chunks have been uploaded
        if len(upload_queue[uid][uploaded_file.root_name]) == 1:
            upload_queue[uid].pop(uploaded_file.root_name)
        else:
            upload_queue[uid][uploaded_file.root_name].remove(path)

    upload_queue.pop(uid)
    logging.info("File upload completed successfully")
    return "OK", 200
