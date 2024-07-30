"""This module contains the model for the images in the database."""

from . import db, images_roles_table


class Image(db.Model):
    """A container image class, the objects of which are directly mapped to the table in the
    database - provides an intuitive programmer interface."""

    __tablename__ = "images_table"

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    name = db.Column(db.String(150), unique=True, nullable=False)
    sylabs_path = db.Column(db.String(150), unique=True, nullable=False)
    parameters = db.Column(db.JSON, nullable=False)

    roles = db.relationship(
        "Role",
        secondary=images_roles_table,
        back_populates="images",
        cascade="all,delete",
    )
