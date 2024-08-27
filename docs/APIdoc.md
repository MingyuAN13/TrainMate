# API Documentation for TrainMate

## Overview

TrainMate provides a RESTful API for interacting with its core functionalities, including user management, file handling, image management, and task operations. This API allows researchers to manage data, run AI models, and retrieve results using a simple and intuitive interface.

## Authentication

TrainMate uses session-based authentication to manage user sessions. Users must log in with their credentials to obtain a session cookie, which must be included in the header of all subsequent requests to authenticate the user.

## Authorization and Roles

TrainMate has different roles that define what actions a user can perform and what endpoints they can access. The roles and their corresponding permissions are as follows:

### Roles and Permissions

- **Admin**: Has access to all administrative endpoints.
  - **Endpoints**:
    - `/api/users/admin`
    - `/api/roles/admin`
    - `/api/tags/admin`
    - `/api/roles`

- **Data Engineer**: Can manage tasks, tags, images, and files.
  - **Endpoints**:
    - `/api/tasks`
    - `/api/tags`
    - `/api/files`
    - `/api/files/upload`
    - `/api/files/download`
    - `/api/files/statusstream`

- **AI Researcher**: Can manage tasks, tags, images, and view file statuses.
  - **Endpoints**:
    - `/api/tasks`
    - `/api/tags`
    - `/api/files`
    - `/api/files/upload`
    - `/api/files/statusstream`

- **Maintainer**: Can manage images and roles.
  - **Endpoints**:
    - `/api/images`
    - `/api/roles`

### Always Allowed Endpoints

The following endpoints are always accessible to all users, regardless of their roles:

- `/api/auth/register`
- `/api/auth/login`
- `/api/health`
- `/api/auth/logout`
- `/api/users/roles`
- `/api/auth/register`
- `/api/auth/viewable_pages`
- `/api/auth/user_authorized`
- `/api/users/email`
- `/api/users/current`


## Endpoints

### User Management

#### Register a New User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Authentication**: No
- **Parameters**:
  - `email` (string): The user's email address.
  - `passwordHash` (string): The hashed password.
- **Description**: Registers a new user with the provided email and password.

#### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Authentication**: No
- **Parameters**:
  - `email` (string): The user's email address.
  - `password` (string): The user's raw password.
- **Description**: Logs in a user and sets a session cookie.

#### Logout
- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Authentication**: Yes
- **Description**: Logs out the current user by deleting their session cookie.

#### View User Roles and Permissions
- **URL**: `/api/auth/viewable-pages`
- **Method**: `GET`
- **Authentication**: Yes
- **Description**: Retrieves a dictionary of pages the user can access based on their roles.

### File Management

#### List Files
- **URL**: `/api/files`
- **Method**: `GET`
- **Authentication**: Yes
- **Parameters**:
  - `search` (string, optional): Search term for file names.
  - `tags` (array, optional): Tags to filter files by.
  - `page` (integer, optional): Page number for pagination (default is 1).
  - `per_page` (integer, optional): Number of files per page (default is 10).
- **Description**: Fetches a list of files that the user has access to, with optional filtering by name and tags.

#### Upload a File
- **URL**: `/api/files/upload`
- **Method**: `POST`
- **Authentication**: Yes
- **Parameters**:
  - `data` (file): The file to be uploaded.
- **Description**: Uploads a new file to the system and stores it in dCache.

#### Download a File
- **URL**: `/api/files/download/{file_id}`
- **Method**: `GET`
- **Authentication**: Yes
- **Parameters**:
  - `{file_id}` (string): The ID of the file to download.
- **Description**: Downloads a specified file from dCache.

### Image Management

#### List Images
- **URL**: `/api/images`
- **Method**: `GET`
- **Authentication**: Yes
- **Description**: Retrieves a list of images available in the system. If the user has the Maintainer role, all images are returned.

#### Create an Image
- **URL**: `/api/images`
- **Method**: `POST`
- **Authentication**: Yes
- **Parameters**:
  - `name` (string): The name of the image.
  - `roles` (array): The roles associated with the image.
  - `parameters` (array): The parameters associated with the image.
  - `sylabs_path` (string): The Sylabs path for the image.
- **Description**: Creates a new image reference in the PostgreSQL database.

### Task Management

#### List Tasks
- **URL**: `/api/tasks`
- **Method**: `GET`
- **Authentication**: Yes
- **Description**: Retrieves a list of tasks that the user has permission to view, including status and results.

#### Create a Task
- **URL**: `/api/tasks`
- **Method**: `POST`
- **Authentication**: Yes
- **Parameters**:
  - `name` (string): The name of the task.
  - `image` (string): The ID of the image to use for the task.
  - `parameters` (array): The parameters for the task.
  - `tags` (array): Tags to associate with the task.
  - `input` (file): Input files for the task.
- **Description**: Creates a new task in the PostgreSQL database and submits a token to CouchDB for execution on the HPC cluster.

## Error Handling

The TrainMate API uses standard HTTP status codes to indicate the success or failure of an API request:

- **200 OK**: The request was successful.
- **201 Created**: A new resource was successfully created.
- **400 Bad Request**: The request could not be understood or was missing required parameters.
- **401 Unauthorized**: Authentication failed or was not provided.
- **404 Not Found**: The requested resource could not be found.
- **500 Internal Server Error**: An unexpected error occurred on the server side.

