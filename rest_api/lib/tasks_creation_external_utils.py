"""Helper functions to interact with dCache and CouchDB for task creation."""

from ..routes.files.interactor import interactor
from ..couch_init import couch_db

def prepare_input_directory_and_token(input_files):
    """Helper function to create a token with its own folder in dCache and copy all input files to it."""
    # create empty document on CouchDB to get the token id
    token_id = couch_db.save({})[0]
    input_folder_dir = "projects/imagen/input_data_" + token_id + "/"
    # create directory
    interactor.make_dir(input_folder_dir)
    # for every file or folder in the input get all files in the directory
    for input_dir in input_files:
        files_in_dir = interactor.get_dir_content_recursive(input_dir[1:])
        # for all files in the directory, copy them to the directory for the task
        for file in files_in_dir:
            # remove all directories before the file when creating the copy
            start_point = file.rfind("/") + 1
            new_dir = input_folder_dir + file[start_point:]
            interactor.copy_or_move(file, new_dir, command="COPY")

    return token_id


def fill_token_couchdb(token_id, container_path, parameters):
    """Helper function to create a document in CouchDB and fill in the values."""
    couch = couch_db
    # get empty document
    token = couch.get(token_id)
    # update document values
    token["type"] = "token"
    token["lock"] = 0
    token["done"] = 0
    token["exit_code"] = ""
    token["scrub_count"] = 0
    token["Input"] = "dCache:/projects/imagen/input_data_" + token_id + "/"
    token["Output"] = "dCache:/projects/imagen/output_data_" + token_id + "/"
    token["container_path"] = container_path
    token["Parameters"] = {param["name"]: param["value"] for param in parameters}
    token["start_time"] = ""
    token["end_time"] = ""
    token["time_taken"] = ""
    token = couch.save(token)
