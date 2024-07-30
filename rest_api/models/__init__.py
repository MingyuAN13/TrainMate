"""
This module contains all the submodules, defining the models for
object relational mapping with the SQL database server.
The annotation tables are also defined here.
"""

import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

# environment variables, related to connection with the database
DB_USER = os.environ.get("DB_USER")
DB_SERVER = os.environ.get("DB_SERVER")
DB_NAME = os.environ.get("DB_NAME")
DB_PORT = os.environ.get("DB_PORT")
DB_PASS = os.environ.get("DB_PASS")

SQL_CNN_URI = (
    f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_SERVER}:{DB_PORT}/{DB_NAME}"
)


class Base(DeclarativeBase):
    """
    This class defines the declarative base for all models to inherit from.
    """


db = SQLAlchemy(model_class=Base)
db.metadata.clear()

# many to many association table between tags and files
# It will automatically delete the association when either the file or the tag is deleted
files_tags_table = db.Table(
    "files_tags",
    Base.metadata,
    db.Column(
        "file_id", db.ForeignKey("files_table.id", ondelete="CASCADE"), primary_key=True
    ),
    db.Column(
        "tag_id", db.ForeignKey("tags_table.id", ondelete="CASCADE"), primary_key=True
    ),
)

# many to many association table between users and roles
# It will automatically delete the association when the user is deleted
users_roles_table = db.Table(
    "users_roles",
    Base.metadata,
    db.Column(
        "user_id", db.ForeignKey("users_table.id", ondelete="CASCADE"), primary_key=True
    ),
    db.Column(
        "role_id", db.ForeignKey("roles_table.id", ondelete="CASCADE"), primary_key=True
    ),
)

# many to many association table between images and tags
# It will automatically delete the association when either the image or the tag is deleted
images_tags_table = db.Table(
    "images_tags",
    Base.metadata,
    db.Column(
        "image_id",
        db.ForeignKey("images_table.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=True,
    ),
    db.Column(
        "tag_id",
        db.ForeignKey("tags_table.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=True,
    ),
)

# many to many association table between images and roles
# It will automatically delete the association when the image is deleted
images_roles_table = db.Table(
    "images_roles",
    Base.metadata,
    db.Column(
        "image_id",
        db.ForeignKey("images_table.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    db.Column(
        "role_id", db.ForeignKey("roles_table.id", ondelete="CASCADE"), primary_key=True
    ),
)

# many to many association table between tasks and tags
# It will automatically delete the association when either the task or the tag is deleted
tasks_tags_table = db.Table(
    "tasks_tags",
    Base.metadata,
    db.Column(
        "task_id",
        db.ForeignKey("tasks_table.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=True,
    ),
    db.Column(
        "tag_id",
        db.ForeignKey("tags_table.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=True,
    ),
)
