"""This module contains the model for the tasks in the database."""

from . import db, tasks_tags_table


class Task(db.Model):
    """A task class, the objects of which are directly mapped to the task table in the
    database - provides an intuitive programmer interface."""

    __tablename__ = "tasks_table"

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    token_id = db.Column(db.String(150), unique=True, nullable=False)
    name = db.Column(db.String(150), unique=False, nullable=False)

    tags = db.relationship(
        "Tag",
        secondary=tasks_tags_table,
        back_populates="tasks",
        cascade="all,delete",
    )
