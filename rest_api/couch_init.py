"""This file sets up the connection to the CouchDB server."""

import os
from couchdb import Server

# set environment variables
COUCHDB_USER = os.environ.get("COUCHDB_USER")
COUCHDB_SERVER = os.environ.get("COUCHDB_SERVER")
COUCHDB_NAME = os.environ.get("COUCHDB_NAME")
COUCHDB_PORT = os.environ.get("COUCHDB_PORT")
COUCHDB_PASSWORD = os.environ.get("COUCHDB_PASSWORD")

couch_db_connection_string = f"{COUCHDB_SERVER}:{COUCHDB_PORT}"

# if there is no http protocol specification in the server prefix, add it!
if "http" not in couch_db_connection_string:
    couch_db_connection_string = "http://" + couch_db_connection_string

server = Server(couch_db_connection_string)
server.resource.credentials = (COUCHDB_USER, COUCHDB_PASSWORD)

# if it the database exists, open it, otherwise create it
if COUCHDB_NAME in server:
    couch_db = server[COUCHDB_NAME]
else:
    couch_db = server.create(COUCHDB_NAME)
