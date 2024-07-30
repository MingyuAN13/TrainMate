"""TThis class contains helper functions for fetching tasks to handle input and output management in dCache
for task fetching."""

from ..models import file, db
from ..routes.files.interactor import interactor

def create_output_file(input_path, output_path, task_tags):
    """Helper function to create a file index in PostgreSQL for a task that finished
    and for deleting the input folder of that task."""

    file_obj = file.File
    db_session = db.session

    # Check if a file object with this index exists
    if not file_exists(output_path):
        # create the new file and add the tags
        new_file = file_obj(index="/" + output_path, type="folder")
        new_file.tags = task_tags
        db_session.add(new_file)
        db_session.commit()

    delete_input_folder(input_path)

def file_exists(file_index):
    """
    Helper function to check if file already exists in PostgreSQL.
    """
    return file.File.query.filter_by(index=file_index).first()

def delete_input_folder(path):
    """Helper function to delete the input folder from dCache for a task that is finished."""

    paths = interactor.get_dir_content_recursive(path)
    for p in paths:
        interactor.delete_file(p[1:])
