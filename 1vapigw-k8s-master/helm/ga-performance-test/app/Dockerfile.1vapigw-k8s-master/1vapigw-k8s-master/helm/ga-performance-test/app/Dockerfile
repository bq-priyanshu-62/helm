# Use the official Python image from Docker Hub
FROM --platform=linux/amd64 python:3.13.1-slim-bullseye

ENV PYTHONUNBUFFERED=1


# Set the working directory in the container
WORKDIR /app

# Copy your Python script into the container
COPY ./ping.py /app/ping.py

# Install Python dependencies and packages
RUN apt-get update && apt-get install -y procps libffi-dev libssl-dev tcpdump vim libpcap-dev gcc g++
RUN apt-get clean 
RUN rm -rf /var/lib/apt/lists/*
RUN pip install setuptools requests prometheus_client boto3 scapy pyshark

# Run your Python script
ENTRYPOINT ["python3", "-u", "/app/ping.py"]

