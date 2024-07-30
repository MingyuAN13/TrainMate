"""Fetch roles endpoints unit tests."""

# pylint: disable=unused-import
# pylint: disable=redefined-outer-name

import shutil
import time
import zipfile
import pickle
import stat
from datetime import datetime, timedelta
import io
import os
import h5py
from . import (
    pytest,
    Role,
    client,
    app,
    delete_db_records,
    User,
    Session,
    db,
    Tag,
    dcache_interactor,
    File,
)
from .test_user_endpoints import set_user_role

SESSION_TOKEN_1 = "token1"
SESSION_TOKEN_2 = "token2"
EMAIL_1 = "test1@test.com"
EMAIL_2 = "test2@test.com"
TEST_STRING = "This is sample file content."
VIDEO_PATH = os.path.join(os.path.dirname(__file__), "assets/testvid.mp4")

interactor = dcache_interactor.DCacheInteractor()


def remove_all_files_webdav():
    """Clean up the file storage"""
    paths = interactor.get_dir_content_recursive()

    for path in paths:
        interactor.delete_file(path[1:])


def add_directory_to_db_and_dcache(app, user_email):
    """Add a directory to db and dcache for testing."""
    with app.app_context():
        new_file1 = create_test_file()
        new_file2 = create_test_file()
        new_file3 = create_test_file()

        interactor.upload_file("test_dir/test_file1", new_file1)
        interactor.upload_file("test_dir/test_file2", new_file2)
        interactor.upload_file("test_dir/inner_dir/test_file3", new_file3)

        user_tag = Tag.query.filter_by(name=user_email).first()
        directory = File(index="/test_dir", tags=[user_tag], type="directory")

        db.session.add(directory)
        db.session.commit()

        return directory.id


def add_file_to_db_and_dcache(app, user_email, path):
    """Add a file to db and dcache for testing."""
    with app.app_context():
        new_file = create_test_file()
        interactor.upload_file(path, new_file)
        user_tag = Tag.query.filter_by(name=user_email).first()
        file = File(index=f"/{path}", tags=[user_tag], type="file")
        db.session.add(file)
        db.session.commit()
        return file.id


def create_test_file():
    """Create a file in memory."""
    file_content = TEST_STRING
    return io.BytesIO(file_content.encode("utf-8"))


@pytest.fixture(autouse=True)
def init_storage_test_envionment(app):
    """Create neccessery data before running tests"""

    remove_all_files_webdav()
    with app.app_context():
        user1 = User(email=EMAIL_1, password_hash="", id=1)
        user2 = User(email=EMAIL_2, password_hash="", id=2)

        user1.roles.append(Role.query.filter_by(name="AI Researcher").first())
        user2.roles.append(Role.query.filter_by(name="Data Engineer").first())

        db.session.add(user1)
        db.session.add(user2)

        user_tag1 = Tag(name=user1.email, type="user")
        user_tag2 = Tag(name=user2.email, type="user")
        db.session.add(user_tag1)
        db.session.add(user_tag2)

        custom_tag1 = Tag(name="custom-tag1", type="custom")
        custom_tag2 = Tag(name="custom-tag2", type="custom")
        db.session.add(custom_tag1)
        db.session.add(custom_tag2)

        session1 = Session(
            session_token=SESSION_TOKEN_1,
            user=user1,
            expiration_datetime=datetime.now() + timedelta(hours=1),
        )
        session2 = Session(
            session_token=SESSION_TOKEN_2,
            user=user2,
            expiration_datetime=datetime.now() + timedelta(hours=1),
        )
        db.session.add(session1)
        db.session.add(session2)

        db.session.commit()


def test_upload_directory(client, app):
    """
    Tests uploading a directory of files
    """
    with app.app_context():
        client.set_cookie("session-id", SESSION_TOKEN_1)
        diritem1 = create_test_file()
        diritem2 = create_test_file()
        diritem3 = create_test_file()

        response = client.post(
            "/api/files/upload",
            data={
                "dir/diritem1": (diritem1, "dir/diritem1"),
                "dir/diritem2": (diritem2, "dir/diritem2"),
                "dir/inner_dir/diritem3": (diritem3, "dir/inner_dir/diritem3"),
                "tags[]": [],
                "format": "none",
            },
            content_type="multipart/form-data",
        )

        assert response.status_code == 200

        dir_content = interactor.get_dir_content_recursive("dir")
        assert len(dir_content) == 3
        dir_content.sort()
        assert dir_content[0] == "/dir/diritem1"
        assert dir_content[1] == "/dir/diritem2"
        assert dir_content[2] == "/dir/inner_dir/diritem3"

        assert len(File.query.all()) == 1
        file = File.query.first()
        assert len(file.tags) == 1
        assert file.index == "/dir/"
        assert file.tags[0].name == EMAIL_1


def test_upload_file_h5(client, app):
    """
    Tests uploading an mp4 converted to h5
    """
    with open(VIDEO_PATH, "rb") as vid:
        with app.app_context():
            client.set_cookie("session-id", SESSION_TOKEN_1)

            response = client.post(
                "/api/files/upload",
                data={"vid.mp4": (vid, "vid.mp4"), "tags[]": [], "format": "h5"},
                content_type="multipart/form-data",
            )

            assert response.status_code == 200

            dir_content = interactor.get_dir_content()
            assert "/vid.h5" in dir_content

            assert len(File.query.all()) == 1
            file = File.query.first()
            assert len(file.tags) == 1
            assert file.index == "/vid.h5"
            assert file.tags[0].name == EMAIL_1

            h5_file = io.BytesIO(interactor.get_file("vid.h5").content)

            with h5py.File(h5_file, "r") as h5_file:
                jpeg_images = h5_file["jpeg_images"]
                assert len(jpeg_images) == 3


def test_upload_file_pickle(client, app):
    """
    Tests uploading an mp4 converted to pickle
    """
    with open(VIDEO_PATH, "rb") as vid:
        with app.app_context():
            client.set_cookie("session-id", SESSION_TOKEN_1)

            response = client.post(
                "/api/files/upload",
                data={"vid.mp4": (vid, "vid.mp4"), "tags[]": [], "format": "pickle"},
                content_type="multipart/form-data",
            )

            assert response.status_code == 200

            dir_content = interactor.get_dir_content()
            assert "/vid.pickle" in dir_content

            assert len(File.query.all()) == 1
            file = File.query.first()
            assert len(file.tags) == 1
            assert file.index == "/vid.pickle"
            assert file.tags[0].name == EMAIL_1

            pickle_file = interactor.get_file("vid.pickle").content
            data = pickle.load(io.BytesIO(pickle_file))

            assert len(data) == 3


def test_upload_file_jpeg(client, app):
    """
    Tests uploading an mp4 converted to jpeg
    """
    with open(VIDEO_PATH, "rb") as vid:
        with app.app_context():
            client.set_cookie("session-id", SESSION_TOKEN_1)

            response = client.post(
                "/api/files/upload",
                data={"vid.mp4": (vid, "vid.mp4"), "tags[]": [], "format": "jpeg"},
                content_type="multipart/form-data",
            )

            assert response.status_code == 200

            dir_content = interactor.get_dir_content("vid")
            assert len(dir_content) == 3
            for i, frame in enumerate(sorted(dir_content)):
                assert frame == f"/vid/frame_{i}.jpeg"

            assert len(File.query.all()) == 1
            file = File.query.first()
            assert len(file.tags) == 1
            assert file.index == "/vid"
            assert file.tags[0].name == EMAIL_1


def test_upload_file(client, app):
    """
    Tests uploading a file with a custom tag
    """
    test_file = create_test_file()

    with app.app_context():
        custom_tag = Tag.query.filter_by(type="custom").first()

        client.set_cookie("session-id", SESSION_TOKEN_1)

        response = client.post(
            "/api/files/upload",
            data={
                "tags[]": [custom_tag.id],
                "format": "none",
                "test_file": (test_file, "test_file"),
            },
            content_type="multipart/form-data",
        )

        assert response.status_code == 200

        dir_content = interactor.get_dir_content()
        assert "/test_file" in dir_content
        content = (
            io.BytesIO(interactor.get_file("test_file").content).getvalue().decode()
        )
        assert TEST_STRING in content

        assert len(File.query.all()) == 1
        file = File.query.first()
        assert len(file.tags) == 2
        assert file.index == "/test_file"
        sorted_tags = sorted(file.tags, key=lambda x: x.name)
        assert sorted_tags[0].name == "custom-tag1"
        assert sorted_tags[1].name == EMAIL_1


def test_download_directory(client, app):
    """
    Tests getting downloading a directory the user has access to
    """
    with app.app_context():
        directory_id = add_directory_to_db_and_dcache(app, EMAIL_1)
        client.set_cookie("session-id", SESSION_TOKEN_1)
        response = client.get(f"/api/files/download/{directory_id}")

        assert response.status_code == 200
        assert response.headers["Content-Type"] == "application/zip"
        assert "attachment; filename=" in response.headers["Content-Disposition"]
        assert (
            response.headers["Content-Disposition"]
            == "attachment; filename=test_dir.zip"
        )

        with io.BytesIO(response.data) as zip_content:
            with zipfile.ZipFile(zip_content, "r") as zip_ref:
                expected_files = [
                    "test_dir/test_file1",
                    "test_dir/test_file2",
                    "test_dir/inner_dir/test_file3",
                ]
                actual_files = zip_ref.namelist()

                assert sorted(expected_files) == sorted(actual_files)
                with zip_ref.open("test_dir/test_file1") as file1:
                    assert file1.read().decode() == "This is sample file content."
                with zip_ref.open("test_dir/test_file2") as file1:
                    assert file1.read().decode() == "This is sample file content."
                with zip_ref.open("test_dir/inner_dir/test_file3") as file1:
                    assert file1.read().decode() == "This is sample file content."


def test_download_directory_unauthorized(client, app):
    """
    Tests getting downloading a directory the user has no access to
    """
    with app.app_context():
        directory_id = add_directory_to_db_and_dcache(app, EMAIL_1)

        client.set_cookie("session-id", "worng token")

        response = client.get(f"/api/files/download/{directory_id}")

        assert response.status_code == 401


def test_download_file(client, app):
    """
    Tests getting downloading a file the user has access to
    """
    with app.app_context():
        file1_id = add_file_to_db_and_dcache(app, EMAIL_1, "test_file")
        client.set_cookie("session-id", SESSION_TOKEN_1)

        response = client.get(f"/api/files/download/{file1_id}")

        assert response.status_code == 200
        assert response.headers["Content-Type"] == "application/octet-stream"
        assert "attachment; filename=" in response.headers["Content-Disposition"]

        response_content = response.data.decode("utf-8")
        expected_content = TEST_STRING
        assert response_content == expected_content
        assert (
            response.headers["Content-Disposition"] == "attachment; filename=test_file"
        )


def test_download_file_unauthorized(client, app):
    """
    Tests getting downloading a file the user has no access to
    """
    with app.app_context():
        file_id = add_file_to_db_and_dcache(app, EMAIL_1, "test_file")

        client.set_cookie("sesion-id", "wrong token")

        response = client.get(f"/api/files/download/{file_id}")

        assert response.status_code == 401


def test_edit_file_add_tag(client, app):
    """
    Tests editing the tags of a file if the user does own the file
    """
    with app.app_context():
        id_ = add_file_to_db_and_dcache(app, EMAIL_1, "test_file")

        client.set_cookie("session-id", SESSION_TOKEN_1)
        custom_tag = Tag.query.filter_by(type="custom").first()
        response = client.patch(f"/api/files/{id_}", json={"tags": [custom_tag.id]})

        file = File.query.first()

        assert response.status_code == 200
        assert len(file.tags) == 2
        assert file.tags[0].name == EMAIL_1
        assert file.tags[1].name == custom_tag.name


def test_edit_file_remove_tag(client, app):
    """
    Tests editing the tags of a file if the user does own the file
    """
    with app.app_context():
        id_ = add_file_to_db_and_dcache(app, EMAIL_1, "test_file")

        client.set_cookie("session-id", SESSION_TOKEN_1)
        file = File.query.first()

        custom_tag1 = Tag.query.filter_by(type="custom").first()
        custom_tag2 = Tag.query.filter_by(type="custom")[1]

        file.tags.append(custom_tag1)
        file.tags.append(custom_tag2)

        db.session.add(file)
        db.session.commit()

        response = client.patch(f"/api/files/{id_}", json={"tags": [custom_tag1.id]})

        assert response.status_code == 200
        assert len(file.tags) == 2
        assert file.tags[0].name == EMAIL_1
        assert file.tags[1].name == custom_tag1.name


def test_edit_file_unauthorized(client, app):
    """
    Tests editing the tags of a file if the user does not own the file
    """
    with app.app_context():
        id_ = add_file_to_db_and_dcache(app, EMAIL_1, "test_file")

        client.set_cookie("session-id", "wrong token")
        custom_tag = Tag.query.filter_by(type="custom").first()
        response = client.patch(f"/api/files/{id_}", json={"tags": [custom_tag.id]})

        file = File.query.first()

        assert response.status_code == 401
        assert len(file.tags) == 1
        assert file.tags[0].name == EMAIL_1


def test_delete_file(client, app):
    """
    Tests deleting a file if the user does own the file
    """
    with app.app_context():
        id_ = add_file_to_db_and_dcache(app, EMAIL_1, "test_file")

        client.set_cookie("session-id", SESSION_TOKEN_1)
        response = client.delete(f"/api/files/{id_}")

        assert response.status_code == 200
        assert len(File.query.all()) == 0
        assert "/test_file" not in interactor.get_dir_content()


def test_delete_file_unauthorized(client, app):
    """
    Tests deleting a file if the user does not own the file
    """
    with app.app_context():
        id_ = add_file_to_db_and_dcache(app, EMAIL_1, "test_file")

        client.set_cookie("session-id", "wrong token")
        response = client.delete(f"/api/files/{id_}")

        assert response.status_code == 401
        assert len(File.query.all()) == 1
        assert "/test_file" in interactor.get_dir_content()


def test_upload_status_stream(client, app):
    """
    Tests the server sent events for upload progress
    """
    test_file1 = create_test_file()
    test_file2 = create_test_file()
    test_file3 = create_test_file()

    with app.app_context():
        client.set_cookie("session-id", SESSION_TOKEN_1)

        client.post(
            "/api/files/upload",
            data={
                "tags[]": [],
                "format": "none",
                "test_file1": (test_file1, "test_file1"),
                "test_file2": (test_file2, "test_file2"),
                "test_file3": (test_file3, "test_file3"),
            },
            content_type="multipart/form-data",
        )

        sse_resp = client.get("/api/files/statusstream/1", buffered=True)
        lines = iter(sse_resp.response)

        # Expected file names
        expected_files = ["test_file1", "test_file2", "test_file3"]

        events_received = 0
        timeout = 5
        start_time = time.time()

        received_files = []

        while events_received < 3 and (time.time() - start_time) < timeout:
            try:
                line = next(lines).decode('utf-8').strip()
                if line.startswith('data: '):
                    file_name = line.split("data: ")[1]
                    print(file_name)
                    received_files.append(file_name)
                    events_received += 1
            except StopIteration:
                time.sleep(0.1)

        assert events_received == 3
        assert received_files == expected_files
