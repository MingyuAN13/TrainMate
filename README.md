# TrainMate

TrainMate is a web application designed to empower researchers who are new to AI projects with an intuitive platform for creating and running image recognition models on provided data. Developed by Group 10 for the Applied Data Science Group at Technische Universiteit Eindhoven, TrainMate aims to bridge the gap between AI technology and researchers across various fields.

## Key Features:
- User-friendly web interface for AI model training
- Data and task sharing capabilities
- Data conversion tools
- Visualization features

TrainMate simplifies the process of working with AI and Machine Learning, making it accessible to researchers without extensive experience in these fields. By providing an easy-to-use platform, TrainMate enables researchers to leverage AI in their studies, potentially enhancing efficiency and opening new avenues for innovation in various sectors.

Whether you're new to AI or looking for a more streamlined approach to image recognition tasks, TrainMate offers the tools and accessibility needed to bring your research projects to the next level.

## Environment setup

### Prerequisites

1. Install Docker
    - Download and install the [Docker Desktop](https://www.docker.com/products/docker-desktop/) app.

### Setup Development Environment

The development environment can be used to run the project locally and have it automatically update when changes are made.
It comes with all the necessary dependencies and configurations to run the project.

1. Clone the repository to your local machine.
2. Navigate to the project directory in your terminal.
3. Create a `.env` file in the `enviroment`. For simplicity, you can use the `.env.example` file as a template:

```bash
cd environment
cp .env.example .env
```

4. Start the development environment:

```bash
docker compose -f environment/compose.dev.yaml up --wait
```

5. Open your web browser and navigate to `http://localhost:3000`.

To stop the development environment, run:

```bash
docker compose -f environment/compose.dev.yaml down
```

## Setup Testing Environment

The testing environment creates the production version of the `frontend` and `backend` services, additionally it still creates a PostgreSQL database, CouchDB database, and WebDav server.
It is great for running the cypress tests.

1. Clone the repository to your local machine.
2. Navigate to the project directory in your terminal.
3. Create a `.env` file in the `enviroment`. For simplicity, you can use the `.env.example` file as a template:

```bash
cd environment
cp .env.example .env
```

4. Start the testing environment:
There are three different profiles to test the application with.
 - app: This profile builds a production version of the application and runs it including databases and webdav.
 - cypress: This profile builds and runs everything needed for cypress end-to-end testing.
 - pytest: This profile builds and runs everything needed for the rest api integration tests.

**Application Profile**
```bash
docker compose -f environment/compose.test.yaml --profile app up --wait --build
```
5. Open your web browser and navigate to `http://localhost:3000`.


**Cypress Profile**
```bash
docker compose -f environment/compose.test.yaml --profile cypress up --abort-on-container-exit --build
```

5. Wait for the cypress tests to finish.

**Pytest Profile**
```bash
docker compose -f environment/compose.test.yaml --profile pytest up --abort-on-container-exit --build
```

5. Wait for the pytest tests to finish.

To stop the testing environment, run:

```bash
docker compose -f environment/compose.test.yaml down
```

## Setup Production Environment

The production environment creates the production version of the `frontend` and `backend` services.
However, it does not create a PostgreSQL database, CouchDB database, or WebDav server.
These should be created separately.

1. Clone the repository to the production server.
2. Navigate to the project directory in your terminal.
3. Create a `.env` file in the `enviroment`. These should include the correct information for the production environment.
To help you with this, you can use the `.env.example` file as a template:

```bash
cd environment
cp .env.example .env
```

4. Start the production environment:

```bash
docker compose -f environment/compose.prod.yaml up --wait
```

5. Open your web browser and navigate to `http://<server-ip>:3000`.

To stop the production environment, run:

```bash
docker compose -f environment/compose.prod.yaml down
```

## Code review notes

The following folders & files should not be reviewed:

- cypress (End-to-end tests)
- rest\_api\_tests (Unit tests for the backend)
- environment (Docker compose files)
- .pylintrc
- .gitlab-ci.yml
- frontend/.next
- frontend/node_modules
- frontend/.eslintrc.json
- frontend/.prettierrc
- frontend/Dockerfile.dev
- frontend/Dockerfile.prod
- frontend/next-env.d.ts
- frontend/next.config.mjs
- frontend/package-lock.json
- frontend/package.json
- frontend/postcss.config.mjs
- frontend/tailwind.config.ts
- frontend/tsconfig.json
- rest\_api/models/\_\_init\_\_.py
- rest\_api/routes/\_\_init\_\_.py
- rest\_api/routes/users/\_\_init\_\_.py
- rest\_api/routes/tasks/\_\_init\_\_.py
- rest\_api/routes/tags/\_\_init\_\_.py
- rest\_api/routes/roles/\_\_init\_\_.py
- rest\_api/routes/images/\_\_init\_\_.py
- rest\_api/routes/files/\_\_init\_\_.py
- rest\_api/routes/auth/\_\_init\_\_.py
- rest\_api/Dockerfile.dev
- rest\_api/Dockerfile.prod
- rest\_api/requirements.txt
- rest\_api/\_\_init\_\_.py
