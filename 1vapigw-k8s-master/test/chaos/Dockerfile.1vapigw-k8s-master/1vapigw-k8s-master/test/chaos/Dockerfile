FROM python:3.7.8-alpine

COPY . /app
WORKDIR /app
RUN pip install pipenv
RUN pipenv install -q

ENTRYPOINT ["pipenv", "run", "py.test", "-s"]
