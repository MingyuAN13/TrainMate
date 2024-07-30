# validate-ignore
# pylint: disable=C0103
"""This module initializes the application with all routes and ORM dependencies for the backend."""

# pylint: disable=unused-import
from datetime import timedelta, datetime
from flask import Flask, request, abort
from .routes import blueprint, health
from .middleware.authorization import AuthorizationMiddleware

# pylint: disable=unused-import
from .models import db, SQL_CNN_URI, file, user, image, role, tag, task, session
from .couch_init import couch_db


def create_app():
    """This function initializes all the components, needed to create the application"""
    app = Flask(__name__)

    # set the database connection string
    app.config["SQLALCHEMY_DATABASE_URI"] = SQL_CNN_URI
    app.register_blueprint(blueprint)

    db.init_app(app)

    # create all of the db tables, if they don't exist
    with app.app_context():
        db.create_all()

    # initialize the authorization middleware
    app.wsgi_app = AuthorizationMiddleware(app.wsgi_app, app)

    # Insert roles into database
    insert_roles(app)

    print("Starting Flask server...")
    print(f"Routes: {app.url_map}")

    return app


def insert_roles(app):
    """
    Insert the defined roles for our web application into the database.
    """

    with app.app_context():
        # delete all roles before adding them, in case they're present
        db.session.query(role.Role).delete()

        # add the roles to the database on application startup
        valid_roles = ["Admin", "Data Engineer", "AI Researcher", "Maintainer"]

        for name in valid_roles:
            r = role.Role(name=name)

            db.session.add(r)

        db.session.commit()
