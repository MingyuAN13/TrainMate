"""This is the entry point for the REST API"""
import logging
import sys
from . import create_app

# Set up basic logging to stdout
logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)

app = create_app()
