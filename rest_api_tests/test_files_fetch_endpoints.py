"""Fetch files endpoints unit tests."""

# pylint: disable=unused-import
# pylint: disable=redefined-outer-name
import random
import string
from . import pytest, File, client, app, delete_db_records, db, Tag
from .test_user_endpoints import set_user_role


def add_dummy_file(name=None):
    """
    Creates a dummy file and adds it to the database.
    """
    if not name:
        name = "".join(random.choices(string.ascii_uppercase + string.digits, k=10))

    f = File(index=name, type="file")
    db.session.add(f)
    db.session.commit()
    return f


def add_tag_to_file(file, tag_name, tag_type):
    """
    Adds a tag to a file.
    Creates a tag if it does not exist.
    """
    tag = Tag.query.filter_by(name=tag_name).first()
    if not tag:
        tag = Tag(name=tag_name, type=tag_type)
        db.session.add(tag)
        db.session.commit()

    file.tags.append(tag)
    db.session.commit()
    return tag


def add_user_file(name=None):
    """
    Creates a file and adds the users tag to it so they can fetch it.
    """
    f = add_dummy_file(name)
    add_tag_to_file(f, "admin@gmail.com", "user")
    return f


def add_many_user_files(num_files):
    """
    Creates a file and adds the users tag to it so they can fetch it.
    """
    files = []
    for _ in range(num_files):
        f = add_user_file()
        files.append(f)
    return files


def check_file(file, index, tags):
    """
    Checks that a file is correct.
    """
    assert file.get("index") == index

    if not tags:
        assert file.get("tags") is None
        return

    file_tags = file.get("tags")
    assert file_tags is not None
    assert len(file_tags) == len(tags)

    for tag in file_tags:
        assert tag.get("name") in tags


def test_fetch_files_without_parameters(client, app):
    """
    Test that fetches files without parameters returns all files.
    """

    with app.app_context():
        f1 = add_user_file()
        f2 = add_user_file()

        set_user_role(client, "Data Engineer")

        response = client.get("/api/files")

        assert response.status_code == 200

        files_data = response.json.get("files")
        assert files_data is not None
        assert len(files_data) == 2

        files_data = sorted(files_data, key=lambda x: x["id"])
        check_file(files_data[0], f1.index, ["admin@gmail.com"])
        check_file(files_data[1], f2.index, ["admin@gmail.com"])


def test_fetch_files_excluding_visible_files(client, app):
    """
    Tests that fetching files excludes files that the user does not have access to.
    """

    with app.app_context():
        f1 = add_user_file()
        f2 = add_user_file()

        set_user_role(client, "Data Engineer")

        # Add a file that the user does not have access to
        add_dummy_file()

        response = client.get("/api/files")

        assert response.status_code == 200

        files_data = response.json.get("files")
        assert files_data is not None
        assert len(files_data) == 2

        files_data = sorted(files_data, key=lambda x: x["id"])
        check_file(files_data[0], f1.index, ["admin@gmail.com"])
        check_file(files_data[1], f2.index, ["admin@gmail.com"])


def test_fetch_no_files(client, app):
    """
    Test that fetching files returns an empty list if there are no files.
    """

    with app.app_context():
        set_user_role(client, "Data Engineer")

        # Adds a file that the user does not have access to
        add_dummy_file()

        response = client.get("/api/files")

        assert response.status_code == 200

        files_data = response.json.get("files")
        assert files_data is not None
        assert len(files_data) == 0


def test_search_files_by_index(client, app):
    """
    Test that searching for files by index returns the correct files.
    """

    with app.app_context():
        f1 = add_user_file(name="some_simple_file")
        add_user_file(name="another_file")

        set_user_role(client, "Data Engineer")

        response = client.get("/api/files?search=simple")

        assert response.status_code == 200

        files_data = response.json.get("files")
        assert files_data is not None
        assert len(files_data) == 1

        check_file(files_data[0], f1.index, ["admin@gmail.com"])


def test_search_files_by_index_not_found(client, app):
    """
    Test that searching for files by index returns an empty list if the index does not exist.
    """

    with app.app_context():
        add_user_file(name="some_file")

        set_user_role(client, "Data Engineer")

        response = client.get("/api/files?search=not_found")

        assert response.status_code == 200

        files_data = response.json.get("files")
        assert files_data is not None
        assert len(files_data) == 0


def test_search_files_by_tag(client, app):
    """
    Test that searching for files by tag returns the correct files.
    """

    with app.app_context():
        f1 = add_user_file()
        f2 = add_user_file()

        set_user_role(client, "Data Engineer")

        t1 = add_tag_to_file(f1, "some_tag", "custom")
        add_tag_to_file(f2, "another_tag", "custom")

        response = client.get(f"/api/files?tags={t1.id}")

        assert response.status_code == 200

        files_data = response.json.get("files")
        assert files_data is not None
        assert len(files_data) == 1

        check_file(files_data[0], f1.index, ["admin@gmail.com", "some_tag"])


def test_search_files_with_multiple_tags(client, app):
    """
    Test that searching for files by tag returns the correct files.
    """

    with app.app_context():
        f1 = add_user_file()
        f2 = add_user_file()

        set_user_role(client, "Data Engineer")

        t1 = add_tag_to_file(f1, "some_tag", "custom")
        t2 = add_tag_to_file(f1, "another_tag", "custom")
        add_tag_to_file(f2, "no_search_tag", "custom")

        response = client.get(f"/api/files?tags={t1.id}&tags={t2.id}")

        assert response.status_code == 200

        files_data = response.json.get("files")
        assert files_data is not None
        assert len(files_data) == 1

        check_file(
            files_data[0], f1.index, ["admin@gmail.com", "some_tag", "another_tag"]
        )


def test_search_files_by_tag_not_found(client, app):
    """
    Test that searching for files by tag returns an empty list if the tag does not exist.
    """

    with app.app_context():
        f1 = add_user_file()

        set_user_role(client, "Data Engineer")

        add_tag_to_file(f1, "some_tag", "custom")

        response = client.get(f"/api/files?tags={-100}")

        assert response.status_code == 200
        files_data = response.json.get("files")
        assert files_data is not None
        assert len(files_data) == 0


def test_search_files_by_invalid_tag(client, app):
    """
    Test that searching with something other than an integer ignores the filter.
    """

    with app.app_context():
        f1 = add_user_file()

        set_user_role(client, "Data Engineer")

        add_tag_to_file(f1, "some_tag", "custom")

        response = client.get("/api/files?tags=invalid")

        assert response.status_code == 200
        files_data = response.json.get("files")
        assert files_data is not None
        assert len(files_data) == 1

        check_file(files_data[0], f1.index, ["admin@gmail.com", "some_tag"])


def test_search_files_by_all_parameters(client, app):
    """
    Test that searching for files by index and tag returns the correct files.
    """

    with app.app_context():
        correct_file = add_user_file(name="some_simple_file")
        file_with_different_name = add_user_file(name="another_file")
        file_with_different_tag = add_user_file(name="some_different_file")
        file_with_all_different = add_user_file(name="another_different_file")

        # Add a file that the user does not have access to
        non_accessible_file = add_dummy_file(name="some_dummy_file")

        set_user_role(client, "Data Engineer")

        t1 = add_tag_to_file(correct_file, "some_tag", "custom")
        add_tag_to_file(file_with_different_name, "some_tag", "custom")
        add_tag_to_file(file_with_different_tag, "other_tag", "custom")
        add_tag_to_file(file_with_all_different, "other_tag", "custom")
        add_tag_to_file(non_accessible_file, "some_tag", "custom")

        response = client.get(f"/api/files?search=simple&tags={t1.id}")

        assert response.status_code == 200

        files_data = response.json.get("files")
        assert files_data is not None
        assert len(files_data) == 1

        check_file(files_data[0], correct_file.index, ["admin@gmail.com", "some_tag"])


def test_fetch_files_pagination(client, app):
    """
    Test that fetching files with pagination works.
    """

    with app.app_context():
        add_many_user_files(10)
        f1 = add_user_file()

        set_user_role(client, "Data Engineer")

        response = client.get("/api/files?page=6&per_page=2")

        assert response.status_code == 200

        files_data = response.json.get("files")
        assert files_data is not None
        assert len(files_data) == 1

        check_file(files_data[0], f1.index, ["admin@gmail.com"])


def test_unauthorized_user_cannot_fetch_files(client, app):
    """
    Test that unauthorized users cannot fetch files.
    """

    with app.app_context():
        add_many_user_files(10)

        set_user_role(client, "Admin")

        response = client.get("/api/files")

        assert response.status_code == 401
