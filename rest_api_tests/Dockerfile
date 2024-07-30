FROM python:3.12-bookworm

RUN apt-get update && apt-get install -y \
    libopencv-dev \
    python3-opencv \
    build-essential \
    libhdf5-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY rest_api/requirements.txt rest_api/requirements.txt
RUN pip install -r rest_api/requirements.txt
RUN pip install pytest

COPY . .

CMD pytest ./rest_api_tests
