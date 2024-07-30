"""Custom tags endpoints unit tests"""

# pylint: disable=unused-import
# pylint: disable=redefined-outer-name
from . import pytest, Tag, File, Task, db, client, app, delete_db_records
from .test_user_endpoints import set_user_role


def create_tags(app, num_tags):
    """
    This function creates {num_tags} custom tags.
    """

    with app.app_context():
        created_tags = []
        for i in range(num_tags):
            t = Tag(name="custom" + str(i), type="custom")
            db.session.add(t)
            db.session.commit()
            created_tags.append({"id": t.id, "name": t.name})
        return created_tags


def test_fetching_custom_tags(client, app):
    """
    Test success of fetching all custom tags
    """

    with app.app_context():
        # Set admin role + cookie
        set_user_role(client, "Admin")

        # Create tags for testing
        created_tags = create_tags(app, 3)

        # Check success of fetching all tags
        response = client.get("/api/tags/admin")

        assert response.status_code == 200
        assert response.json == created_tags


def test_fetching_no_tags(client, app):
    """
    Test fetching of an empty tags table
    """

    with app.app_context():
        # Set admin role + cookie
        set_user_role(client, "Admin")

        # Check success fetching of 0 tasks
        response = client.get("/api/tags/admin")

        assert response.status_code == 200
        assert response.json == []


def test_fetching_non_admin(client, app):
    """
    Test fetching failure as a non admin user.
    """

    with app.app_context():
        # Set non-admin role + cookie
        set_user_role(client, "Data Engineer")

        # Check unauthorized request
        response = client.get("/api/tags/admin")

        assert response.status_code == 401


def test_creating_custom_tag(client, app):
    """
    Test success creation of custom tag
    """

    with app.app_context():
        # Set admin role + cookie
        set_user_role(client, "Admin")

        # Request to create new tag
        response = client.post(
            "/api/tags/admin",
            headers={
                "Content-Type": "application/json",
            },
            json={"name": "test"},
        )

        assert response.status_code == 200
        assert response.json == {
            "success": True,
            "message": "Custom tag created successfully.",
        }

        # # Check if tag was added
        db_tags = Tag.query.all()

        assert db_tags[0].name == "test"


def test_creating_tag_non_admin(client, app):
    """
    Test creation of tag failure by a non-admin user.
    """

    with app.app_context():
        # Set non-admin role + cookie
        set_user_role(client, "AI Researcher")

        # Check unauthorized request
        response = client.post(
            "/api/tags/admin",
            headers={
                "Content-Type": "application/json",
            },
            json={"name": "test"},
        )

        assert response.status_code == 401


def test_creating_tag_existing_tag(client, app):
    """
    Test creation failure of an existing tag name.
    """

    with app.app_context():
        # Set admin role + cookie
        set_user_role(client, "Admin")

        # Add tag to database
        t = Tag(name="test", type="custom")

        db.session.add(t)
        db.session.commit()

        # Fetch to check that tag was added
        response = client.get("/api/tags/admin")

        assert response.status_code == 200
        assert response.json == [{"id": t.id, "name": "test"}]

        # Request to create new tag with same name
        response = client.post(
            "/api/tags/admin",
            headers={
                "Content-Type": "application/json",
            },
            json={"name": "test"},
        )

        assert response.status_code == 409
        assert response.json == {"success": False, "messgae": "Tag name exists."}


def test_creating_tag_existing_user_tag(client, app):
    """
    Test unsuccessful creation of an existing user tag.
    """

    with app.app_context():
        # Set admin role + cookie
        set_user_role(client, "Admin")

        # Add tag to database
        t = Tag(name="test@gmail.com", type="user")

        db.session.add(t)
        db.session.commit()

        # Check tag is in database
        tags = Tag.query.all()

        assert tags[0].name == "test@gmail.com"

        # Request to create new tag with same name
        response = client.post(
            "/api/tags/admin",
            headers={
                "Content-Type": "application/json",
            },
            json={"name": "test@gmail.com"},
        )

        assert response.status_code == 409
        assert response.json == {"success": False, "messgae": "Tag name exists."}


def test_creating_tag_invalid_json(client, app):
    """
    Test creating tag failure with invalid json arguments
    """

    with app.app_context():
        set_user_role(client, "Admin")

        # Make a request with no body
        response = client.post(
            "/api/tags/admin",
            headers={
                "Content-Type": "application/json",
            },
            json={},
        )

        assert response.status_code == 406
        assert response.json == {"success": False, "message": "Data provided is invalid."}

        # Make a request with body different than what is expected
        response = client.post(
            "/api/tags/admin",
            headers={
                "Content-Type": "application/json",
            },
            json={"email": "test@test.com"},
        )

        assert response.status_code == 406
        assert response.json == {"success": False, "message": "Data provided is invalid."}


def test_deletion_custom_tag(client, app):
    """
    Test successful deletion of custom tag.
    """

    with app.app_context():
        # Set admin role + cookie
        set_user_role(client, "Admin")

        # Create tags for testing
        created_tags = create_tags(app, 2)

        # Request to delete one tag
        response = client.delete(
            "/api/tags/admin",
            headers={
                "Content-Type": "application/json",
            },
            json={"name": "custom0"},
        )

        # Check tag was deleted
        updated_tags = [d for d in created_tags if d.get("name") != "custom0"]

        assert response.status_code == 200
        assert response.json == {
            "success": True,
            "message": "Custom tag deleted successfully.",
        }

        # Fetch to check that tag was deleted
        response = client.get("/api/tags/admin")

        assert response.status_code == 200
        assert response.json == updated_tags


def test_deletion_tag_file_check(client, app):
    """
    Test deletion success and deletion of custom tag from file.
    """

    with app.app_context():
        # Set admin role + cookie
        set_user_role(client, "Admin")

        # Create tag in database
        t = Tag(name="custom_test", type="custom")

        db.session.add(t)
        db.session.commit()

        # Create file + add tag to file
        f = File(index="test_index", type="file")

        db.session.add(f)

        f.tags.append(Tag.query.filter_by(name="custom_test").first())
        db.session.commit()

        # Make request to delete tag
        response = client.delete(
            "/api/tags/admin",
            headers={
                "Content-Type": "application/json",
            },
            json={"name": "custom_test"},
        )

        assert response.status_code == 200
        assert response.json == {
            "success": True,
            "message": "Custom tag deleted successfully.",
        }

        # Check tag is no longer associated with that file
        check_file = File.query.filter_by(id=f.id).first()

        assert Tag.query.filter_by(name="custom_test") not in check_file.tags


def test_deletion_tag_task_check(client, app):
    """
    Test deletion success and deletion of custom tag from task.
    """

    with app.app_context():
        # Set admin role + cookie
        set_user_role(client, "Admin")

        # Add dummy tag in database
        t = Tag(name="custom_test", type="custom")

        db.session.add(t)
        db.session.commit()

        # Create task and add tag to it
        task_test = Task(token_id="token_1", name="test")

        db.session.add(task_test)

        task_test.tags.append(Tag.query.filter_by(name="custom_test").first())
        db.session.commit()

        # Make request to delete tag
        response = client.delete(
            "/api/tags/admin",
            headers={
                "Content-Type": "application/json",
            },
            json={"name": "custom_test"},
        )

        assert response.status_code == 200
        assert response.json == {
            "success": True,
            "message": "Custom tag deleted successfully.",
        }

        # Check tag is no longer associated with task
        check_task = Task.query.filter_by(id=task_test.id).first()

        assert Tag.query.filter_by(name="custom_test") not in check_task.tags


def test_deletion_non_admin(client, app):
    """
    Test deletion of custom tag failure by non-admin user
    """

    with app.app_context():
        # Set non-admin user + cookie
        set_user_role(client, "Data Engineer")

        # Make request to check unauthorized
        response = client.delete(
            "/api/tags/admin",
            headers={
                "Content-Type": "application/json",
            },
            json={"name": "custom0"},
        )

        assert response.status_code == 401


def test_deletion_non_existing(client, app):
    """
    Test deletion failure of a custom tag that does not exist.
    """

    with app.app_context():
        # Set admin role + cookie
        set_user_role(client, "Admin")

        # Make request to delete non-existing tag
        response = client.delete(
            "/api/tags/admin",
            headers={
                "Content-Type": "application/json",
            },
            json={"name": "custom0"},
        )

        assert response.status_code == 406
        assert response.json == {"success": False, "messgae": "Tag does not exist."}


def test_deletion_invalid_json(client, app):
    """
    Test deletion failure of custom tag with invalid json.
    """

    with app.app_context():
        # Set admin role + cookie
        set_user_role(client, "Admin")

        # Make a request with no body
        response = client.delete(
            "/api/tags/admin",
            headers={
                "Content-Type": "application/json",
            },
            json={},
        )

        assert response.status_code == 406
        assert response.json == {"success": False, "message": "Data provided is invalid."}

        # Make a request with body different than what is expected
        response = client.delete(
            "/api/tags/admin",
            headers={
                "Content-Type": "application/json",
            },
            json={"email": "test@test.com"},
        )

        assert response.status_code == 406
        assert response.json == {"success": False, "message": "Data provided is invalid."}
