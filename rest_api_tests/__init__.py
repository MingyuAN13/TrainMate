"""The setup of the unit testing environment for Flask"""

from datetime import datetime, timedelta
import importlib
import pytest
import bcrypt

import rest_api

from rest_api.models import user
from rest_api.models import session
from rest_api.models import role

# pylint: disable=unused-import
from rest_api.models import image
from rest_api.models import tag
from rest_api.models import file
from rest_api.models import task
from rest_api import dcache_interactor

create_app = rest_api.create_app
db = rest_api.db
couch_db = rest_api.couch_db
interactor = dcache_interactor.DCacheInteractor()

User = user.User
Role = role.Role
Task = task.Task
Session = session.Session
Tag = tag.Tag
Task = task.Task
File = file.File
Image = image.Image


# pylint: disable=redefined-outer-name
@pytest.fixture()
def app():
    """This function creates the app context, initializing the database relations."""
    yield create_app()  # from app.py


# pylint: disable=redefined-outer-name
@pytest.fixture()
def client(app):
    """This function initializes the test client for the unit tests."""
    return app.test_client()


@pytest.fixture(autouse=True)
def delete_db_records(app):
    """Delete all records from the database before each test"""
    with app.app_context():
        # Clear tables
        db.session.query(Session).delete()
        db.session.query(User).delete()
        db.session.query(File).delete()
        db.session.query(Task).delete()
        db.session.query(Tag).delete()
        db.session.query(Role).delete()
        db.session.query(Image).delete()

        # Create and add the 4 fixed roles
        roles = [
            Role(name="AI Researcher"),
            Role(name="Data Engineer"),
            Role(name="Maintainer"),
            Role(name="Admin"),
        ]

        db.session.add_all(roles)

        db.session.commit()

        # Clear CouchDB
        for doc_id in couch_db:
            couch_db.delete(couch_db[doc_id])
