"""Tests for task retrieval and creation operations in the backend"""

# # pylint: disable=unused-import
# # pylint: disable=redefined-outer-name
import io
from . import (
    Task,
    Tag,
    Image,
    File,
    Role,
    db,
    client,
    app,
    pytest,
    delete_db_records,
    couch_db,
    interactor,
)
from .test_user_endpoints import set_user_role


def test_retrieve_empty_tasklist(client, app):
    """Test successful retrieval of empty task list"""
    with app.app_context():
        set_user_role(client, "Data Engineer")
        response = client.get("/api/tasks")
        assert response.status_code == 200
        assert response.json == []


def test_retrieve_tasklist_one_task(client, app):
    """Test successful retrieval of task list with a single task with a custom tag."""
    with app.app_context():
        postgres_task, couch_task = create_tasks(app, 1)
        postgres_task = postgres_task[0]
        couch_task = couch_task[0]
        task_id = postgres_task["id"]
        token_id = postgres_task["token_id"]
        name = postgres_task["name"]
        status = get_task_status(
            couch_task["lock"], couch_task["done"], couch_task["exit_code"]
        )
        postgres_task = Task.query.filter_by(token_id=token_id).first()
        new_tag = Tag(name="tag", type="custom")
        db.session.add(new_tag)
        postgres_task.tags.append(new_tag)
        db.session.commit()
        user_tag = Tag.query.filter_by(name="admin@gmail.com").first()
        tags = [{"id": user_tag.id, "name": user_tag.name, "type": user_tag.type}]
        tags += [{"id": new_tag.id, "name": new_tag.name, "type": new_tag.type}]
        task_files = File.query.filter_by().all()

        set_user_role(client, "Data Engineer")
        response = client.get("/api/tasks")
        assert response.status_code == 200
        task_view = [
            {
                "id": task_id,
                "token_id": token_id,
                "name": name,
                "tags": [
                    {"id": tag["id"], "name": tag["name"], "type": tag["type"]}
                    for tag in tags
                ],
                "status": status,
                "status_code": couch_task["exit_code"],
                "image": "visiontransformer",
            }
        ]

        assert response.json == task_view
        assert task_files == []


def test_delete_task_not_couch(client, app):
    """Test deletion of a task if the task exists in PostgreSQL but not in CouchDB."""
    with app.app_context():
        postgres_task = Task(name="task", token_id="token")
        db.session.add(postgres_task)
        new_tag = Tag(name="admin@gmail.com", type="user")
        db.session.add(new_tag)
        postgres_task.tags.append(new_tag)
        db.session.commit()

        set_user_role(client, "Data Engineer")
        response = client.get("/api/tasks")
        assert response.status_code == 200
        assert response.json == []


def test_retrieve_tasklist_multiple_tasks(client, app):
    """Test successful retrieval of task list with multiple tasks."""
    with app.app_context():
        postgres_tasks, couch_tasks = create_tasks(app, 3)
        tasks_added = []
        for i in range(3):
            postgres_task = postgres_tasks[i]
            couch_task = couch_tasks[i]
            status = get_task_status(
                couch_task["lock"], couch_task["done"], couch_task["exit_code"]
            )
            tasks_added += [
                {
                    "id": postgres_task["id"],
                    "token_id": postgres_task["token_id"],
                    "name": postgres_task["name"],
                    "tags": postgres_task["tags"],
                    "status": status,
                    "status_code": couch_task["exit_code"],
                    "image": "visiontransformer",
                }
            ]

        task_files = File.query.filter_by().all()

        set_user_role(client, "Data Engineer")
        response = client.get("/api/tasks")
        assert response.status_code == 200
        assert response.json == tasks_added
        assert task_files == []


def test_retrieve_tasklist_some_no_permission(client, app):
    """Test successful retrieval of task list with multiple tasks if the user only has access to some."""
    with app.app_context():
        postgres_tasks, couch_tasks = create_tasks(app, 3)
        tasks_added = []
        for i in range(3):
            postgres_task = postgres_tasks[i]
            couch_task = couch_tasks[i]
            status = get_task_status(
                couch_task["lock"], couch_task["done"], couch_task["exit_code"]
            )
            tasks_added += [
                {
                    "id": postgres_task["id"],
                    "token_id": postgres_task["token_id"],
                    "name": postgres_task["name"],
                    "tags": postgres_task["tags"],
                    "status": status,
                    "status_code": couch_task["exit_code"],
                    "image": "visiontransformer",
                }
            ]

        task_no_permission = Task(token_id=401, name="no_perm")
        db.session.add(task_no_permission)
        task_no_permission = Task(token_id=404, name="secret task")
        db.session.add(task_no_permission)
        db.session.commit()
        task_files = File.query.filter_by().all()

        set_user_role(client, "Data Engineer")
        response = client.get("/api/tasks")
        assert response.status_code == 200
        assert response.json == tasks_added
        assert task_files == []


def test_retrieve_tasklist_create_filepath(client, app):
    """Test succesful retrieval of a task in the task list and succesful creation of the file object for a done task"""
    with app.app_context():
        set_user_role(client, "Data Engineer")
        # create input folder
        interactor.make_dir("projects/imagen/input_data_token_id/")
        input_file = "projects/imagen/input_data_token_id/file.jpeg"
        new_file = io.BytesIO("file_content".encode("utf-8"))
        interactor.upload_file(input_file, new_file)

        # Check that the input folder is not empty
        dir_content = interactor.get_dir_content_recursive(
            "projects/imagen/input_data_token_id/"
        )
        assert len(dir_content) > 0

        image = Image(name="image", sylabs_path="imagepath", parameters=[])
        db.session.add(image)
        couch_doc = {
            "_id": "token_id",
            "type": "token",
            "lock": 1,
            "done": 1,
            "scrub_count": 0,
            "exit_code": 0,
            "container_path": "imagepath",
            "Parameters": {},
            "Input": "dCache:/projects/imagen/input_data_token_id",
            "Output": "dCache:/projects/imagen/output_data_token_id",
            "start_time": "00:00:00",
            "end_time": "01:30:00",
            "time_taken": "01:30:00",
        }
        token_id = couch_db.save(couch_doc)[0]
        couch_task = couch_db.get(token_id)

        user_tag = Tag(name="admin@gmail.com", type="user")
        db.session.add(user_tag)
        postgres_task = Task(name="task", token_id="token_id")
        postgres_task.tags.append(user_tag)
        db.session.add(postgres_task)
        db.session.commit()

        response = client.get("/api/tasks")
        # check that the output filepath is added to PostgreSQL
        task_view = [
            {
                "id": postgres_task.id,
                "token_id": "token_id",
                "name": postgres_task.name,
                "tags": [
                    {"id": user_tag.id, "name": user_tag.name, "type": user_tag.type}
                ],
                "status": "done",
                "status_code": couch_task["exit_code"],
                "image": "image",
            }
        ]
        task_file = File.query.filter_by(
            index="/projects/imagen/output_data_" + token_id
        ).first()
        user_tags = Tag.query.filter_by(name="admin@gmail.com").first()
        # Check that the input folder is deleted
        dir_content = interactor.get_dir_content_recursive(
            "projects/imagen/input_data_token_id/"
        )
        assert len(dir_content) == 0

        assert response.status_code == 200
        assert response.json == task_view
        assert task_file is not None
        assert task_file.tags == [user_tags]


def test_retrieve_specific_task_without_parameters(client, app):
    """Test successful retrieval of a specific task that doesn't have parameters associated with it."""
    with app.app_context():
        postgres_tasks, couch_tasks = create_tasks(app, 1)
        postgres_task = postgres_tasks[0]
        couch_task = couch_tasks[0]
        set_user_role(client, "Data Engineer")
        token_id = postgres_task["token_id"]
        status = get_task_status(
            couch_task["lock"], couch_task["done"], couch_task["exit_code"]
        )
        response = client.get(f"/api/tasks/{token_id}")
        assert response.status_code == 200
        assert response.json == {
            "id": postgres_task["id"],
            "token_id": postgres_task["token_id"],
            "name": postgres_task["name"],
            "tags": [
                {"id": tag["id"], "name": tag["name"], "type": tag["type"]}
                for tag in postgres_task["tags"]
            ],
            "status": status,
            "status_code": couch_task["exit_code"],
            "image": "visiontransformer",
            "start_time": couch_task["start_time"],
            "time_taken": couch_task["time_taken"],
            "parameters": [],
            "output_data": couch_task["Output"],
        }


def test_retrieve_specific_task_not_in_couch(client, app):
    """Test unsuccessful retrieval of a specific task as the task does not exist in CouchDB."""
    with app.app_context():
        new_tag = Tag(name="admin@gmail.com", type="user")
        db.session.add(new_tag)
        postgres_task = Task(token_id="token_id", name="task_name")
        postgres_task.tags.append(new_tag)
        db.session.add(postgres_task)
        db.session.commit()
        set_user_role(client, "Data Engineer")
        response = client.get("/api/tasks/token_id")

        postgres_task = Task.query.filter_by(token_id="token_id").first()

        assert response.status_code == 404
        assert response.json == {"success": False, "message": "Task does not exist."}
        assert postgres_task is None


def test_admin_no_retrieve(client, app):
    """Test that the admin cannot retrieve a list of tasks, retrieve info about a specific task or create a task."""
    with app.app_context():
        postgres_task = create_tasks(app, 1)[0][0]
        set_user_role(client, "Admin")
        response = client.get("/api/tasks")
        assert response.status_code == 401

        response = client.get(f"/api/tasks/{postgres_task['token_id']}")
        assert response.status_code == 401

        response = client.post(
            "/api/tasks",
            json={"name": "task", "image": "visiontransformer", "input": "input"},
        )
        assert response.status_code == 401


def test_create_new_task_parameters_and_tags(client, app):
    """Test successful creation of a new task and storage in CouchDB and PostgreSQL adding parameters and tags.
    Also tests adding a single input file"""
    with app.app_context():
        name = "task_1"
        set_user_role(client, "Data Engineer")
        parameters = [{"name": "param1", "value": 1}, {"name": "param2", "value": 1}]
        input_file = "/file.jpeg"
        new_file = io.BytesIO("file_content".encode("utf-8"))
        interactor.upload_file(input_file, new_file)
        task_image = Image(
            name="visiontransformer",
            sylabs_path="library/visiontransformer",
            parameters=["param1", "param2"],
        )
        data_eng = Role.query.filter_by(name="Data Engineer").first()
        task_image.roles.append(data_eng)
        db.session.add(task_image)
        new_tag = Tag(name="tag1", type="custom")
        db.session.add(new_tag)
        user_tag = Tag(name="admin@gmail.com", type="user")
        db.session.add(user_tag)
        tags = ["admin@gmail.com", "tag1"]
        db.session.commit()

        response = client.post(
            "/api/tasks",
            json={
                "name": name,
                "image": "visiontransformer",
                "input": input_file,
                "parameters": parameters,
                "tags": ["tag1"],
            },
        )

        stored_task = db.session.query(Task).filter_by(name=name).first()
        tags = stored_task.tags
        user_tag = db.session.query(Tag).filter_by(name="admin@gmail.com").first()
        new_tag = db.session.query(Tag).filter_by(name="tag1").first()
        couch_task = couch_db.get(stored_task.token_id)

        assert response.status_code == 200
        # check that the values in PostgreSQL are correct
        assert response.json == {
            "success": True,
            "message": "Task created successfully.",
        }
        assert stored_task.name == name
        assert len(tags) == 2
        assert new_tag in tags
        assert user_tag in tags
        # check that the values in CouchDB are correct
        assert couch_task["type"] == "token"
        assert couch_task["lock"] == 0
        assert couch_task["done"] == 0
        assert couch_task["exit_code"] == ""
        assert couch_task["scrub_count"] == 0
        assert (
            couch_task["Input"]
            == f"dCache:/projects/imagen/input_data_{couch_task['_id']}/"
        )
        assert (
            couch_task["Output"]
            == f"dCache:/projects/imagen/output_data_{couch_task['_id']}/"
        )
        assert couch_task["container_path"] == "library/visiontransformer"
        assert couch_task["Parameters"] == {
            param["name"]: param["value"] for param in parameters
        }
        assert couch_task["start_time"] == ""
        assert couch_task["end_time"] == ""
        assert couch_task["time_taken"] == ""
        # check that file is copied to correct directory dCache
        dir_content = interactor.get_dir_content_recursive(
            "/projects/imagen/input_data_" + couch_task["_id"]
        )
        assert len(dir_content) == 1
        assert (
            dir_content[0]
            == "/projects/imagen/input_data_" + couch_task["_id"] + "/file.jpeg"
        )


def test_create_task_invalid_parameters(client, app):
    """Test unsuccessful creation of a new task as the parameters given don't match the parameters of the image."""
    with app.app_context():
        name = "task_1"
        set_user_role(client, "Data Engineer")
        parameters = [{"name": "param1", "value": 1}, {"name": "param2", "value": 1}]
        input_file = "/file.jpeg"
        task_image = Image(
            name="visiontransformer",
            sylabs_path="library/visiontransformer",
            parameters=["param2", "param3"],
        )
        data_eng = Role.query.filter_by(name="Data Engineer").first()
        task_image.roles.append(data_eng)
        db.session.add(task_image)
        db.session.commit()

        response = client.post(
            "/api/tasks",
            json={
                "name": name,
                "image": "visiontransformer",
                "input": input_file,
                "parameters": parameters,
                "tags": [],
            },
        )
        assert response.status_code == 406
        assert response.json == {
            "success": False,
            "message": "Parameters are not valid.",
        }


def test_create_new_task_no_parameters(client, app):
    """Test successful creation and storage of a new task without parameters with tags in CouchDB and PostgreSQL.
    Also tests upload of nested inputs."""
    with app.app_context():
        name = "task_1"
        set_user_role(client, "Data Engineer")
        create_nested_input()
        user_tag = Tag(name="admin@gmail.com", type="user")
        db.session.add(user_tag)
        task_image = Image(
            name="visiontransformer",
            sylabs_path="library/visiontransformer",
            parameters=[],
        )
        data_eng = Role.query.filter_by(name="Data Engineer").first()
        task_image.roles.append(data_eng)
        db.session.add(task_image)
        custom_tag = Tag(name="test", type="custom")
        db.session.add(custom_tag)
        other_user_tag = Tag(name="friend@gmail.com", type="user")
        db.session.add(other_user_tag)
        db.session.commit()

        response = client.post(
            "/api/tasks",
            json={
                "name": name,
                "image": "visiontransformer",
                "input": "/test_dir",
                "parameters": [],
                "tags": ["test", "friend@gmail.com"],
            },
        )

        stored_task = db.session.query(Task).filter_by(name=name).first()
        tags = stored_task.tags
        user_tag = db.session.query(Tag).filter_by(name="admin@gmail.com").first()
        custom_tag = db.session.query(Tag).filter_by(name="test").first()
        other_user_tag = (
            db.session.query(Tag).filter_by(name="friend@gmail.com").first()
        )
        couch_task = couch_db.get(stored_task.token_id)

        assert response.status_code == 200
        # check that the values in PostgreSQL are correct
        assert response.json == {
            "success": True,
            "message": "Task created successfully.",
        }
        assert stored_task.name == name
        assert len(tags) == 3
        assert user_tag in tags
        assert custom_tag in tags
        assert other_user_tag in tags
        # check that the values in CouchDB are correct
        assert couch_task["type"] == "token"
        assert couch_task["lock"] == 0
        assert couch_task["done"] == 0
        assert couch_task["exit_code"] == ""
        assert couch_task["scrub_count"] == 0
        assert (
            couch_task["Input"]
            == f"dCache:/projects/imagen/input_data_{couch_task['_id']}/"
        )
        assert (
            couch_task["Output"]
            == f"dCache:/projects/imagen/output_data_{couch_task['_id']}/"
        )
        assert couch_task["container_path"] == "library/visiontransformer"
        assert couch_task["Parameters"] == {}
        assert couch_task["start_time"] == ""
        assert couch_task["end_time"] == ""
        assert couch_task["time_taken"] == ""
        # check that file is copied to correct directory dCache
        dir_content = interactor.get_dir_content_recursive(
            "/projects/imagen/input_data_" + couch_task["_id"]
        )
        assert len(dir_content) == 3
        dir_content.sort()
        assert (
            dir_content[0]
            == f"/projects/imagen/input_data_{couch_task['_id']}/test_file1"
        )
        assert (
            dir_content[1]
            == f"/projects/imagen/input_data_{couch_task['_id']}/test_file2"
        )
        assert (
            dir_content[2]
            == f"/projects/imagen/input_data_{couch_task['_id']}/test_file3"
        )


def test_create_new_task_no_tags(client, app):
    """Test successful creation and storage of a new task without tags with parameters in CouchDB and PostgreSQL.
    Also tests uploading multiple files."""
    with app.app_context():
        name = "task_1"
        set_user_role(client, "Data Engineer")
        parameters = [{"name": "param1", "value": 1}, {"name": "param2", "value": 1}]
        input_file = "/file1.jpeg"
        new_file = io.BytesIO("file_content1".encode("utf-8"))
        interactor.upload_file(input_file, new_file)
        input_file2 = "/file2.jpeg"
        new_file = io.BytesIO("file_content2".encode("utf-8"))
        interactor.upload_file(input_file2, new_file)
        user_tag = Tag(name="admin@gmail.com", type="user")
        db.session.add(user_tag)
        task_image = Image(
            name="visiontransformer",
            sylabs_path="library/visiontransformer",
            parameters=["param1", "param2"],
        )
        data_eng = Role.query.filter_by(name="Data Engineer").first()
        task_image.roles.append(data_eng)
        db.session.add(task_image)
        db.session.commit()

        response = client.post(
            "/api/tasks",
            json={
                "name": name,
                "image": "visiontransformer",
                "input": [input_file, input_file2],
                "parameters": parameters,
                "tags": [],
            },
        )

        stored_task = db.session.query(Task).filter_by(name=name).first()
        tags = stored_task.tags
        user_tag = db.session.query(Tag).filter_by(name="admin@gmail.com").first()
        couch_task = couch_db.get(stored_task.token_id)

        assert response.status_code == 200
        # check that the values in PostgreSQL are correct
        assert response.json == {
            "success": True,
            "message": "Task created successfully.",
        }
        assert stored_task.name == name
        assert tags == [user_tag]
        # check that the values in CouchDB are correct
        assert couch_task["type"] == "token"
        assert couch_task["lock"] == 0
        assert couch_task["done"] == 0
        assert couch_task["exit_code"] == ""
        assert couch_task["scrub_count"] == 0
        assert (
            couch_task["Input"]
            == f"dCache:/projects/imagen/input_data_{couch_task['_id']}/"
        )
        assert (
            couch_task["Output"]
            == f"dCache:/projects/imagen/output_data_{couch_task['_id']}/"
        )
        assert couch_task["container_path"] == "library/visiontransformer"
        assert couch_task["Parameters"] == {
            param["name"]: param["value"] for param in parameters
        }
        assert couch_task["start_time"] == ""
        assert couch_task["end_time"] == ""
        assert couch_task["time_taken"] == ""
        # check that file is copied to correct directory dCache
        dir_content = interactor.get_dir_content_recursive(
            "/projects/imagen/input_data_" + couch_task["_id"]
        )
        assert len(dir_content) == 2
        dir_content.sort()
        assert (
            dir_content[0]
            == f"/projects/imagen/input_data_{couch_task['_id']}/file1.jpeg"
        )
        assert (
            dir_content[1]
            == f"/projects/imagen/input_data_{couch_task['_id']}/file2.jpeg"
        )


def test_create_new_task_no_parameters_no_tags(client, app):
    """Test successful creation and storage of a new task without tags or parameters in CouchDB and PostgreSQL.
    Also tests adding multiple files where some don't exist to the directory."""
    with app.app_context():
        name = "task_1"
        set_user_role(client, "Data Engineer")
        input_file1 = "/file1.jpeg"
        new_file = io.BytesIO("file_content".encode("utf-8"))
        interactor.upload_file(input_file1, new_file)
        input_file2 = "/file2.jpeg"
        task_image = Image(
            name="visiontransformer",
            sylabs_path="library/visiontransformer",
            parameters=[],
        )
        data_eng = Role.query.filter_by(name="Data Engineer").first()
        task_image.roles.append(data_eng)
        db.session.add(task_image)
        user_tag = Tag(name="admin@gmail.com", type="user")
        db.session.add(user_tag)
        db.session.commit()

        response = client.post(
            "/api/tasks",
            json={
                "name": name,
                "image": "visiontransformer",
                "input": [input_file1, input_file2],
                "parameters": [],
                "tags": [],
            },
        )

        assert response.status_code == 200
        stored_task = db.session.query(Task).filter_by(name=name).first()
        tags = stored_task.tags
        user_tag = db.session.query(Tag).filter_by(name="admin@gmail.com").first()
        couch_task = couch_db.get(stored_task.token_id)

        assert response.status_code == 200
        # check that the values in PostgreSQL are correct
        assert response.json == {
            "success": True,
            "message": "Task created successfully.",
        }
        assert stored_task.name == name
        assert tags == [user_tag]
        # check that the values in CouchDB are correct
        assert couch_task["type"] == "token"
        assert couch_task["lock"] == 0
        assert couch_task["done"] == 0
        assert couch_task["exit_code"] == ""
        assert couch_task["scrub_count"] == 0
        assert (
            couch_task["Input"]
            == f"dCache:/projects/imagen/input_data_{couch_task['_id']}/"
        )
        assert (
            couch_task["Output"]
            == f"dCache:/projects/imagen/output_data_{couch_task['_id']}/"
        )
        assert couch_task["container_path"] == "library/visiontransformer"
        assert couch_task["Parameters"] == {}
        assert couch_task["start_time"] == ""
        assert couch_task["end_time"] == ""
        assert couch_task["time_taken"] == ""
        # check that file is copied to correct directory dCache
        dir_content = interactor.get_dir_content_recursive(
            "/projects/imagen/input_data_" + couch_task["_id"]
        )
        assert len(dir_content) == 2
        dir_content = sorted(dir_content)
        assert (
            dir_content[0]
            == f"/projects/imagen/input_data_{couch_task['_id']}/file1.jpeg"
        )
        assert (
            dir_content[1]
            == f"/projects/imagen/input_data_{couch_task['_id']}/file2.jpeg"
        )


def test_create_task_with_long_name(client, app):
    """Test unsuccesful creation of a new task, as the name is too long."""
    with app.app_context():
        set_user_role(client, "Data Engineer")
        name = "a" * 151
        response = client.post(
            "/api/tasks", json={"name": name, "image": "a", "input": "file"}
        )
        assert response.status_code == 406
        assert response.json == {
            "success": False,
            "message": "Data provided is invalid.",
        }


def test_create_task_invalid_data(client, app):
    """Test unsuccesful creation of a new task, as the data is invalid."""
    with app.app_context():
        set_user_role(client, "Data Engineer")
        response = client.post(
            "/api/tasks",
            json={"image": "a", "input": "file", "parameters": [{"a": 4}]},
        )
        assert response.status_code == 406
        assert response.json == {
            "success": False,
            "message": "Data provided is invalid.",
        }


def test_create_task_unauthorized_image(client, app):
    """
    Test unsuccesful creation of task as the user does not have permission for the provided image.
    """
    with app.app_context():
        set_user_role(client, "Data Engineer")
        image = Image(name="image", sylabs_path="library/image", parameters=[])
        ai_res = Role.query.filter_by(name="AI Researcher").first()
        image.roles.append(ai_res)
        db.session.add(image)
        db.session.commit()

        response = client.post(
            "/api/tasks",
            json={
                "name": "task1",
                "image": "image",
                "input": "file.jpeg",
                "parameters": [],
                "tags": ["tag1"],
            },
        )

        assert response.status_code == 401
        assert response.json == {
            "success": False,
            "message": "User does not have access to this image.",
        }


def create_tasks(app, num):
    """
    Create num dummy tasks and add them.
    """
    with app.app_context():
        tasks_added = []
        couch_tasks = []
        create_nested_input()
        new_tag = Tag(name="admin@gmail.com", type="user")
        db.session.add(new_tag)
        db.session.commit()
        image = Image(
            name="visiontransformer",
            sylabs_path="library/visiontransformer",
            parameters=[],
        )
        data_eng = Role.query.filter_by(name="Data Engineer").first()
        image.roles.append(data_eng)
        db.session.add(image)
        for i in range(num):
            task_name = "task_" + str(i)
            couch_doc = {
                "type": "token",
                "lock": 0,
                "done": 0,
                "scrub_count": 0,
                "exit_code": "",
                "Input": "test_dir",
                "Output": "output",
                "container_path": "library/visiontransformer",
                "Parameters": {},
                "start_time": "00:00:00",
                "end_time": "00:00:00",
                "time_taken": "00:00:00",
            }
            couch_tasks += [couch_doc]
            token_id = couch_db.save(couch_doc)[0]
            postgres_task = Task(token_id=token_id, name=task_name)
            postgres_task.tags.append(new_tag)
            db.session.add(postgres_task)
            db.session.commit()
            task = [
                {
                    "id": postgres_task.id,
                    "token_id": token_id,
                    "name": task_name,
                    "tags": [
                        {"id": new_tag.id, "name": new_tag.name, "type": new_tag.type}
                    ],
                }
            ]
            tasks_added += task
    return tasks_added, couch_tasks


def get_task_status(lock, done, exit_code):
    """Helper function to get the status of a task. We should probably do this with the monitor in CouchDB but I'm not
    sure if that works."""

    if lock == 0 and done == 0:
        return "todo"
    if lock > 0 and done == 0:
        return "locked"
    if lock > 0 and done > 0 and exit_code == 0:
        return "done"
    return "error"


def create_nested_input():
    """Helper function to create nested input files in dCache."""
    new_file = io.BytesIO("file_content".encode("utf-8"))
    interactor.make_dir("test_dir")
    interactor.make_dir("test_dir/inner_dir")
    interactor.upload_file("test_dir/test_file1", new_file)
    interactor.upload_file("test_dir/test_file2", new_file)
    interactor.upload_file("test_dir/inner_dir/test_file3", new_file)
    return [
        "/test_dir/test_file1",
        "/test_dir/test_file2",
        "/test_dir/inner_dir/test_file3",
    ]
