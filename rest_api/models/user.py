"""This module contains the model for the users in the database."""

import re

from . import db, users_roles_table


class User(db.Model):
    """A user class, the objects of which are directly mapped to the user table in the
    database - provides an intuitive programmer interface."""

    __tablename__ = "users_table"

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)

    roles = db.relationship(
        "Role",
        secondary=users_roles_table,
        back_populates="users",
        cascade="all,delete",
    )

    sessions = db.relationship(
        "Session",
        back_populates="user",
        cascade="all,delete",
    )

    def set_password_hash(self, password_hash):
        """This function stores a given user password"""
        self.password_hash = password_hash


def check_email(email):
    """This function validates as to whether the provided email is a valid email string."""
    pattern = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]"
    if re.search(pattern, email):
        return True
    return False
