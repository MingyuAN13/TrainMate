"""
This module contains the model for the user sessions in the database.
"""

from . import db


class Session(db.Model):
    """
    A session class, the objects of which are directly mapped to the table in the
    database - provides an intuitive programmer interface.
    """

    __tablename__ = "sessions_table"

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    session_token = db.Column(db.String(1000), unique=True, nullable=False)
    expiration_datetime = db.Column(db.DateTime, nullable=False)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users_table.id", ondelete="CASCADE"), nullable=False
    )
    user = db.relationship("User", back_populates="sessions")
