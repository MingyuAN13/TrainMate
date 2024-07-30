# Rest API

The rest API is responsible for communicating with the frontend and the database & starting jobs on `PiCaS` by writing a token to the `CouchDB` database.

### Setup Tutorial for _Windows_

1. Run `docker compose down`
2. Run `docker compose -f compose.test.yaml up`
3. Run `docker compose -f compose.test.yaml down` after the tests are finished
4. Delete the docker `unit_tests` image from Docker Desktop
