"""This module contains the model for the tags in the database."""

from . import db, tasks_tags_table, files_tags_table


class Tag(db.Model):
    """A tag class, the objects of which are directly mapped to the tags table in the
    database - provides an intuitive programmer interface."""

    __tablename__ = "tags_table"
    # the unique identifier for a tag
    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    # the name a of a tag
    name = db.Column(db.String(150), unique=True, nullable=False)
    # the type of a tag "user" or "custom"
    type = db.Column(db.String(150), nullable=False)

    # the relations
    files = db.relationship(
        "File",
        secondary=files_tags_table,
        back_populates="tags",
        cascade="all,delete",
    )

    tasks = db.relationship(
        "Task",
        secondary=tasks_tags_table,
        back_populates="tags",
        cascade="all,delete",
    )
