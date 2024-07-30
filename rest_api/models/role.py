"""
This module contains the model for the roles in the database.
"""

from . import db, users_roles_table, images_roles_table


class Role(db.Model):
    """
    A user role class, the objects of which are directly mapped to the table in the
    database - provides an intuitive programmer interface.
    """

    __tablename__ = "roles_table"

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    name = db.Column(db.String(150), unique=True, nullable=False)

    users = db.relationship(
        "User",
        secondary=users_roles_table,
        back_populates="roles",
        cascade="all,delete",
    )
    images = db.relationship(
        "Image",
        secondary=images_roles_table,
        back_populates="roles",
        cascade="all,delete",
    )
