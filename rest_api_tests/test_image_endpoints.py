"""Unit tests for image creation and deletion and for updating image data."""

# pylint: disable=unused-import
# pylint: disable=redefined-outer-name
from . import (
    pytest,
    Image,
    Role,
    Task,
    Tag,
    db,
    couch_db,
    client,
    app,
    delete_db_records,
)
from .test_user_endpoints import set_user_role
from .test_task_view_create import create_tasks


def test_image_creation_params_succes(client, app):
    """
    Test succesful creation of a new image with parameters.
    """

    with app.app_context():
        set_user_role(client, "Maintainer")

        response = client.post(
            "/api/images",
            json={
                "name": "new_image",
                "sylabs_path": "library:/new_image",
                "parameters": ["epochs", "learn_rate"],
                "roles": ["Data Engineer"],
            },
        )

        image = Image.query.filter_by(name="new_image").first()
        name = image.name
        path = image.sylabs_path
        parameters = image.parameters
        roles = image.roles
        data_eng = Role.query.filter_by(name="Data Engineer").first()

        assert response.status_code == 200
        assert response.json == {
            "success": True,
            "message": "Image data uploaded to PostgreSQL successfully.",
        }
        assert name == "new_image"
        assert path == "library:/new_image"
        assert parameters == ["epochs", "learn_rate"]
        assert roles == [data_eng]


def test_image_creation_no_params_succes(client, app):
    """
    Test succesful creation of a new image without parameters.
    """
    with app.app_context():
        set_user_role(client, "Maintainer")

        response = client.post(
            "/api/images",
            json={
                "name": "new_image",
                "sylabs_path": "library:/new_image",
                "parameters": [],
                "roles": ["Data Engineer"],
            },
        )

        image = Image.query.filter_by(name="new_image").first()
        name = image.name
        path = image.sylabs_path
        parameters = image.parameters
        roles = image.roles
        data_eng = Role.query.filter_by(name="Data Engineer").first()

        assert response.status_code == 200
        assert response.json == {
            "success": True,
            "message": "Image data uploaded to PostgreSQL successfully.",
        }
        assert name == "new_image"
        assert path == "library:/new_image"
        assert parameters == []
        assert roles == [data_eng]


def test_image_creation_invalid_data(client, app):
    """
    Test unsuccesful creation of a new image as data is not the correct format.
    """
    with app.app_context():
        set_user_role(client, "Maintainer")

        response = client.post(
            "/api/images",
            json={
                "name": "existing",
                "sylabs_path": "library:/new_image",
                "parameters": [],
                "roles": [],
            },
        )

        assert response.status_code == 406
        assert response.json == {
            "succes": False,
            "message": "Data provided does not have the correct format.",
        }


def test_image_creation_long_name(client, app):
    """
    Test unsuccesful creation of a new image as name is too long.
    """
    with app.app_context():
        set_user_role(client, "Maintainer")
        long_name = "a" * 151
        response = client.post(
            "/api/images",
            json={
                "name": long_name,
                "sylabs_path": "library:/new_image",
                "parameters": [],
                "roles": ["AI Researcher"],
            },
        )

        assert response.status_code == 406
        assert response.json == {
            "succes": False,
            "message": "Sylabs path or image name is too long.",
        }


def test_image_creation_long_path(client, app):
    """
    Test unsuccesful creation of a new image as path is too long.
    """
    with app.app_context():
        set_user_role(client, "Maintainer")
        long_path = "p" * 151
        response = client.post(
            "/api/images",
            json={
                "name": "a",
                "sylabs_path": long_path,
                "parameters": [],
                "roles": ["AI Researcher"],
            },
        )

        assert response.status_code == 406
        assert response.json == {
            "succes": False,
            "message": "Sylabs path or image name is too long.",
        }


def test_image_creation_name_exists(client, app):
    """
    Test unsuccesful creation of a new image as an image with the same name exists.
    """
    with app.app_context():
        set_user_role(client, "Maintainer")
        image = Image(name="existing", sylabs_path="no_path", parameters=[])
        db.session.add(image)
        db.session.commit()

        response = client.post(
            "/api/images",
            json={
                "name": "existing",
                "sylabs_path": "library:/new_image",
                "parameters": [],
                "roles": ["Data Engineer"],
            },
        )

        assert response.status_code == 409
        assert response.json == {
            "succes": False,
            "message": "Sylabs path and image name must be unique.",
        }


def test_image_creation_path_exists(client, app):
    """
    Test unsuccesful creation of a new image as an image with the same path exists.
    """
    with app.app_context():
        set_user_role(client, "Maintainer")
        image = Image(name="new_name", sylabs_path="library:/exists", parameters=[])
        db.session.add(image)
        db.session.commit()

        response = client.post(
            "/api/images",
            json={
                "name": "existing",
                "sylabs_path": "library:/exists",
                "parameters": [],
                "roles": ["Data Engineer"],
            },
        )

        assert response.status_code == 409
        assert response.json == {
            "succes": False,
            "message": "Sylabs path and image name must be unique.",
        }


def test_image_creation_invalid_role(client, app):
    """
    Test unsuccesful creation of a new image as a role name is invalid.
    """
    with app.app_context():
        set_user_role(client, "Maintainer")
        response = client.post(
            "/api/images",
            json={
                "name": "existing",
                "sylabs_path": "library:/exists",
                "parameters": [],
                "roles": ["Nonexisting role"],
            },
        )

        assert response.status_code == 406
        assert response.json == {"succes": False, "message": "Roles are not valid."}


def test_image_deletion_succes(client, app):
    """
    Test succesful deletion of an image.
    """
    with app.app_context():
        set_user_role(client, "Maintainer")
        with app.app_context():
            image = Image(name="image", sylabs_path="path", parameters=[])
            db.session.add(image)
            db.session.commit()

        response = client.delete("/api/images", json={"name": "image"})
        with app.app_context():
            image = Image.query.filter_by(name="image").first()

        assert response.status_code == 200
        assert response.json == {
            "succes": True,
            "message": "Image deleted succesfully.",
        }
        assert image is None


def test_image_deletion_invalid_data(client, app):
    """
    Test unsuccesful deletion of an image as data is invalid.
    """
    with app.app_context():
        set_user_role(client, "Maintainer")
        response = client.delete("/api/images", json={"path": "image"})

        assert response.status_code == 406
        assert response.json == {
            "succes": False,
            "message": "Data provided does not have the correct format.",
        }


def test_nonexistant_image_deletion(client, app):
    """
    Test unsuccesful deletion of an image as it doesn't exist.
    """
    with app.app_context():
        set_user_role(client, "Maintainer")
        response = client.delete("/api/images", json={"name": "image"})

        assert response.status_code == 404
        assert response.json == {"succes": False, "message": "Image does not exist."}


def test_image_name_change_succes(client, app):
    """
    Test succesful image name change.
    """
    with app.app_context():
        image = Image(name="image", sylabs_path="path", parameters=[])
        db.session.add(image)
        db.session.commit()

        set_user_role(client, "Maintainer")
        response = client.put(
            "/api/images", json={"previous_name": "image", "new_name": "new_name"}
        )

        new_name_image = Image.query.filter_by(name="new_name").first()
        previous_name_image = Image.query.filter_by(name="image").first()

        assert response.status_code == 200
        assert response.json == {
            "succes": True,
            "message": "Image name changed succesfully.",
        }
        assert new_name_image is not None
        assert previous_name_image is None


def test_image_name_change_invalid_data(client, app):
    """
    Test unsuccesful image name change as data is invalid.
    """
    with app.app_context():
        set_user_role(client, "Maintainer")
        response = client.put("/api/images", json={"name": "image"})

        assert response.status_code == 406
        assert response.json == {
            "succes": False,
            "message": "Data provided does not have the correct format.",
        }


def test_nonexistant_image_name_change(client, app):
    """
    Test unsuccesful image name change as it doesn't exist.
    """
    with app.app_context():
        set_user_role(client, "Maintainer")
        response = client.put(
            "/api/images", json={"previous_name": "image", "new_name": "new_name"}
        )

        assert response.status_code == 404
        assert response.json == {"succes": False, "message": "Image does not exist."}


def test_image_name_change_new_name_exists(client, app):
    """
    Test unsuccesful image name change as an image with the new name exists.
    """
    with app.app_context():
        set_user_role(client, "Maintainer")
        image = Image(name="image", sylabs_path="path", parameters=[])
        db.session.add(image)
        image = Image(name="new_name", sylabs_path="other_path", parameters=[])
        db.session.add(image)
        db.session.commit()

        response = client.put(
            "/api/images", json={"previous_name": "image", "new_name": "new_name"}
        )

        assert response.status_code == 409
        assert response.json == {
            "succes": False,
            "message": "An image with this name already exists.",
        }


def test_update_image_roles_succes(client, app):
    """
    Test succesful update of the roles of an image.
    """
    with app.app_context():
        image = Image(name="image", sylabs_path="path", parameters=[])
        db.session.add(image)
        role = Role.query.filter_by(name="Data Engineer").first()
        image.roles.append(role)
        db.session.commit()

        set_user_role(client, "Maintainer")
        response = client.patch(
            "/api/images",
            json={"name": "image", "roles": ["AI Researcher", "Data Engineer"]},
        )

        image = Image.query.filter_by(name="image").first()
        image_roles = sorted(image.roles, key=lambda r: r.id)
        data_eng = Role.query.filter_by(name="Data Engineer").first()
        ai_res = Role.query.filter_by(name="AI Researcher").first()
        roles_selected = sorted([data_eng, ai_res], key=lambda r: r.id)

        assert response.status_code == 200
        assert response.json == {
            "success": True,
            "message": "Image roles updated succesfully.",
        }
        assert image_roles == roles_selected


def test_update_image_roles_invalid_data(client, app):
    """
    Test unsuccesful update of the roles of an image as data is not the correct format.
    """
    with app.app_context():
        set_user_role(client, "Maintainer")

        response = client.patch(
            "/api/images", json={"names": "image", "roles": ["Data Engineer"]}
        )

        assert response.status_code == 406
        assert response.json == {
            "succes": False,
            "message": "Data provided does not have the correct format.",
        }


def test_update_nonexistant_image_roles(client, app):
    """
    Test unsuccesful update of the roles of an image as it does not exist.
    """
    with app.app_context():
        set_user_role(client, "Maintainer")
        response = client.patch(
            "/api/images", json={"name": "no image", "roles": ["Data Engineer"]}
        )

        assert response.status_code == 404
        assert response.json == {"succes": False, "message": "Image does not exist."}


def test_update_image_roles_invalid_role(client, app):
    """
    Test unsuccesful update of the roles of an image as a role name is invalid.
    """
    with app.app_context():
        image = Image(name="image", sylabs_path="path", parameters=[])
        db.session.add(image)
        db.session.commit()

        set_user_role(client, "Maintainer")
        response = client.patch(
            "/api/images", json={"name": "image", "roles": ["Nonexisting role"]}
        )

        assert response.status_code == 406
        assert response.json == {"succes": False, "message": "Roles are not valid."}


def test_fetch_image_success(client, app):
    """
    Test fetch of images success.
    """

    with app.app_context():
        r_ai = Role.query.filter_by(name="AI Researcher").first()

        set_user_role(client, "AI Researcher")

        image_test = Image(
            name="VisionTransformer",
            sylabs_path="library/VisionTransformer",
            parameters=[],
        )
        image_test2 = Image(
            name="MoviNet",
            sylabs_path="library/MoviNet",
            parameters=["epochs", "learn_rate"],
        )
        image_test.roles.append(r_ai)
        image_test2.roles.append(r_ai)

        db.session.add(image_test)
        db.session.add(image_test2)
        db.session.commit()

        response = client.get("/api/images")

        assert response.status_code == 200
        assert {
            "id": image_test.id,
            "name": image_test.name,
            "sylabs_path": image_test.sylabs_path,
            "parameters": image_test.parameters,
            "roles": [r.name for r in image_test.roles],
        } in response.json
        assert {
            "id": image_test2.id,
            "name": image_test2.name,
            "sylabs_path": image_test2.sylabs_path,
            "parameters": image_test2.parameters,
            "roles": [r.name for r in image_test2.roles],
        } in response.json


def test_fetch_images_differet_roles(client, app):
    """
    Test fetch of images only ones user has access to
    """

    with app.app_context():
        r_ai = Role.query.filter_by(name="AI Researcher").first()
        r_de = Role.query.filter_by(name="Data Engineer").first()

        set_user_role(client, "AI Researcher")

        image_test = Image(
            name="VisionTransformer",
            sylabs_path="library/VisionTransformer",
            parameters=[],
        )
        image_test2 = Image(
            name="MoviNet",
            sylabs_path="library/MoviNet",
            parameters=["epochs", "learn_rate"],
        )
        image_test.roles.append(r_ai)
        image_test2.roles.append(r_de)

        db.session.add(image_test)
        db.session.add(image_test2)
        db.session.commit()

        response = client.get("/api/images")

        assert response.status_code == 200
        assert {
            "id": image_test.id,
            "name": image_test.name,
            "sylabs_path": image_test.sylabs_path,
            "parameters": image_test.parameters,
            "roles": [r.name for r in image_test.roles],
        } in response.json
        assert {
            "id": image_test2.id,
            "name": image_test2.name,
            "sylabs_path": image_test2.sylabs_path,
            "parameters": image_test2.parameters,
            "roles": [r.name for r in image_test2.roles],
        } not in response.json


def test_fetch_images_maintainer(client, app):
    """
    Test that maintainer can fetch all images regardless of the role.
    """

    with app.app_context():
        r_ai = Role.query.filter_by(name="AI Researcher").first()

        set_user_role(client, "Maintainer")

        image_test = Image(
            name="VisionTransformer",
            sylabs_path="library/VisionTransformer",
            parameters=[],
        )
        image_test2 = Image(
            name="MoviNet",
            sylabs_path="library/MoviNet",
            parameters=["epochs", "learn_rate"],
        )
        image_test.roles.append(r_ai)

        db.session.add(image_test)
        db.session.add(image_test2)
        db.session.commit()

        response = client.get("/api/images")

        assert response.status_code == 200
        assert {
            "id": image_test.id,
            "name": image_test.name,
            "sylabs_path": image_test.sylabs_path,
            "parameters": image_test.parameters,
            "roles": [r.name for r in image_test.roles],
        } in response.json
        assert {
            "id": image_test2.id,
            "name": image_test2.name,
            "sylabs_path": image_test2.sylabs_path,
            "parameters": image_test2.parameters,
            "roles": [r.name for r in image_test2.roles],
        } in response.json


def test_fetch_parameters_success(client, app):
    """
    Test succesful retrieval of parameters from tasks the user has acces to which have the correct image.
    """
    with app.app_context():
        set_user_role(client, "Data Engineer")
        image = Image(
            name="image",
            sylabs_path="library/image",
            parameters=["epochs", "learn_rate"],
        )
        data_eng = Role.query.filter_by(name="Data Engineer").first()
        image.roles.append(data_eng)
        db.session.add(image)
        tag = Tag(name="admin@gmail.com", type="user")
        db.session.add(tag)
        postgres_task = Task(name="task1", token_id="token1")
        db.session.add(postgres_task)
        postgres_task.tags.append(tag)

        postgres_task = Task(name="task2", token_id="token2")
        db.session.add(postgres_task)
        postgres_task.tags.append(tag)

        postgres_task = Task(name="task3", token_id="token3")
        db.session.add(postgres_task)
        postgres_task.tags.append(tag)

        postgres_task = Task(name="task4", token_id="token4")
        db.session.add(postgres_task)
        db.session.commit()
        couch_doc = {
            "_id": "token1",
            "container_path": "library/image",
            "Parameters": {"epochs": 100, "learn_rate": 0.9},
        }
        couch_db.save(couch_doc)
        couch_doc = {
            "_id": "token2",
            "container_path": "library/image",
            "Parameters": {"epochs": 500, "learn_rate": 0.7},
        }
        couch_db.save(couch_doc)
        couch_doc = {
            "_id": "token3",
            "container_path": "library/not image",
            "Parameters": {"epochs": 1, "learn_rate": 0},
        }
        couch_db.save(couch_doc)
        couch_doc = {
            "_id": "token4",
            "container_path": "library/image",
            "Parameters": {"epochs": 5, "learn_rate": 0.5},
        }
        couch_db.save(couch_doc)

        response = client.post("/api/images/stored_parameters", json={"name": "image"})

        assert response.status_code == 200
        assert {"task1": {"epochs": 100, "learn_rate": 0.9}} in response.json
        assert {"task2": {"epochs": 500, "learn_rate": 0.7}} in response.json
        assert {"task3": {"epochs": 1, "learn_rate": 0}} not in response.json
        assert {"task4": {"epochs": 5, "learn_rate": 0.5}} not in response.json


def test_fetch_parameters_no_data(client, app):
    """
    Test unsuccesful retrieval of parameters as the data is invalid.
    """
    with app.app_context():
        set_user_role(client, "Data Engineer")

        response = client.post(
            "/api/images/stored_parameters", json={"image_name": "image"}
        )

        assert response.status_code == 406
        assert response.json == {
            "success": False,
            "message": "Data provided is invalid.",
        }


def test_fetch_parameters_unauthorized_image(client, app):
    """
    Test unsuccesful retrieval of parameters as the user does not have permission for that image.
    """
    with app.app_context():
        set_user_role(client, "Data Engineer")
        image = Image(
            name="image",
            sylabs_path="library/image",
            parameters=["epochs", "learn_rate"],
        )
        ai_res = Role.query.filter_by(name="AI Researcher").first()
        image.roles.append(ai_res)
        db.session.add(image)
        db.session.commit()

        response = client.post("/api/images/stored_parameters", json={"name": "image"})

        assert response.status_code == 401
        assert response.json == {
            "success": False,
            "message": "User does not have access to this image.",
        }


def test_other_roles_unauthorized_image_management(client, app):
    """
    Test that user without maintainer role is unauthorized to access image endpoints.
    """
    with app.app_context():
        set_user_role(client, "Admin")
        response = client.post(
            "/api/images",
            json={
                "name": "new_image",
                "sylabs_path": "library:/new_image",
                "parameters": [],
                "roles": ["Admin"],
            },
        )
        assert response.status_code == 401

        response = client.delete("/api/images", json={"name": "image"})
        assert response.status_code == 401

        response = client.put(
            "/api/images", json={"previous_name": "iamge", "new_name": "image"}
        )
        assert response.status_code == 401

        response = client.patch(
            "/api/images", json={"name": "iamge", "roles": ["Data Engineer"]}
        )
        assert response.status_code == 401

        response = client.get("/api/images")
        assert response.status_code == 401

        response = client.post("/api/images/stored_parameters", json={"name": "image"})
        assert response.status_code == 401
