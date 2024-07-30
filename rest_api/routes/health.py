"""This module defines template routes for the application to work on a bare minimum level."""

from flask import request


def health():
    """Template route for the application - subject to change..."""
    print(request.cookies.get("session-id"))
    return "OK", 200
