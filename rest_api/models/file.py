"""This module contains the model for the dCache files in the database."""

from . import db, files_tags_table


class File(db.Model):
    """A container file class, the objects of which are directly mapped to the files table in the
    database - provides an intuitive programmer interface."""

    __tablename__ = "files_table"

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    # path to file as file/path/filename.ext
    index = db.Column(db.String(300), nullable=False, unique=True)
    # name of the file viewable by user
    tags = db.relationship("Tag", secondary=files_tags_table, back_populates="files")
    # type of the file (directory or file)
    type = db.Column(db.String(300), nullable=False)
