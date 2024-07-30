"""
This class contains helper functions to get data about current user.
"""

from flask import request
from ..models import session
from flask import abort
from ..models.tag import Tag


def get_user_by_session():
    """
    Helper function to get the user's email.
    """
    session_token = request.cookies.get("session-id")

    if not session_token:
        return None

    user_session = session.Session.query.filter_by(session_token=session_token).first()
    if not user_session:
        return None

    return user_session.user


def authenticate_user_by_tag(user_tags):
    """
    Takes a list of tags and returns 401 if the user tag is not present.
    """
    # get the user
    user = get_user_by_session()
    if not user:
        abort(401)

    user_tag = Tag.query.filter_by(name=user.email).first()

    # check if user has access to file
    if user_tag not in user_tags:
        abort(401)
