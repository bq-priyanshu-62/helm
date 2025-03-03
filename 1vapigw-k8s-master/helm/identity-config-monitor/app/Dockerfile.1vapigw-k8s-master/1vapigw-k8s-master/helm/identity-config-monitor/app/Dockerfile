# Use the official Python image from Docker Hub
FROM --platform=linux/amd64 python:3.13.1-slim-bullseye

ENV PYTHONUNBUFFERED=1


# Set the working directory in the container
WORKDIR /app

# Install Python dependencies and packages
RUN apt-get update && apt-get install -y python3-pip
RUN apt-get clean 
RUN rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip3 install requests kubernetes flask

# Copy your Python script into the container
COPY ./identity_monitor.py /app/identity_monitor.py

# Run your Python script
ENTRYPOINT ["python3", "-u", "/app/identity_monitor.py"]
