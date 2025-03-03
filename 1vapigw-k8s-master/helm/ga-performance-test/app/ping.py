import subprocess
import requests
import datetime
import time
import boto3
import json
import logging
import uuid
import os
from prometheus_client import CollectorRegistry, Gauge, start_http_server, Histogram

# Configure logging
logging.basicConfig(level=logging.ERROR)

# Load ga_endpoints from the environment variable
ga_endpoints_json = os.environ.get('GA_ENDPOINTS_JSON', '[]')
ga_endpoints = json.loads(ga_endpoints_json)

# Load S3 bucket name from the environment variable
s3_bucket_name = os.environ.get('S3_BUCKET_NAME')

# Load AWS region from the environment variable
aws_region = os.environ.get('AWS_REGION')

# Define the packet capture file name
pcap_file = "ga_packet_capture.pcap"

# Start an HTTP server for Prometheus to scrape metrics
start_http_server(8000) 

# Create the Prometheus registry and metric
alerts = Gauge("apigw_ga_alert", "Global Accelerator Alert", labelnames=["endpoint"])
latency_histogram = Histogram("apigw_ga_latency_seconds", "Global Accelerator Latency", labelnames=["endpoint"])

# Generate a GUID and convert it to a string
def generate_guid():
    return str(uuid.uuid4())

def push_to_s3(bucket_name, file_path):
    try:
        # Create an S3 client
        s3_client = boto3.client("s3", region_name=aws_region)

        # Define the S3 destination path with the GUID
        guid = generate_guid()
        s3_key = f"packet_captures/{file_path}"

        # Upload the file to S3
        s3_client.upload_file(file_path, bucket_name, s3_key)

        # Print a success message
        print(f"Uploaded {file_path} to S3: s3://{bucket_name}/{s3_key}")
    except Exception as e:
        print(f"Error uploading to S3: {str(e)}")

# Function to gracefully terminate tcpdump
def terminate_tcpdump(process):
    try:
        process.terminate()
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait()


# Loop indefinitely for continuous monitoring
while True:
    for ga in ga_endpoints:
        # Get the current timestamp
        start_timestamp = datetime.datetime.now()

        # Construct the ping URL
        ping_url = f"https://{ga['name']}/gateway/ping"

        # Remove any existing packet capture file
        subprocess.run(["rm", "-f", pcap_file])

        # Start packet capture in the background
        tcpdump_process = subprocess.Popen(["tcpdump", "-i", "eth0", "-w", pcap_file,"-s", "0", "-B", "4096", "port", "443"])

        # Sleep briefly to allow tcpdump to start
        time.sleep(2)

        # Perform the ping using curl and capture the output
        error_message = None
        try:
            response = requests.get(ping_url, headers={"User-Agent": "ga_test_script"})
            response_code = response.status_code
            duration = response.elapsed.total_seconds()
        except requests.RequestException as e:
            # Handle request exceptions
            response_code = 0
            duration = 0
            # Convert the exception to a string
            error_message = str(e)

        # Stop packet capture

        time.sleep(5)
        terminate_tcpdump(tcpdump_process)

        # Get the end timestamp
        end_timestamp = datetime.datetime.now()

        # Log the results with GUID
        guid = generate_guid()
        log_message = {
            "guid": guid,
            "start_time": start_timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "end_time": end_timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "duration": int(duration * 1000),
            "url": ping_url,
            "http_response_code": response_code,
            "exception": error_message.lower() if error_message else None
        }   
        # Always log the message, whether there's an issue or not
        json_log_message = json.dumps(log_message)
        print(json_log_message)

# Check if the response time exceeds the threshold or the HTTP response code is not 200
        threshold = float(ga["threshold"])  # Convert threshold to a float

            # Record latency in the histogram
        latency_histogram.labels(endpoint=ga["name"]).observe(duration)

        # Check if the response time exceeds the threshold or the HTTP response code is not 200

        if duration > threshold or response_code != 200:
#            # Log an alert and save the packet capture
            print("ALERT: Response time exceeded threshold or non-200 response code.")


            # Increment the Prometheus metric counter
            alerts.labels(endpoint=ga["name"]).inc()


#            # Save the packet capture with a timestamp with GUID in the file name
            formatted_datetime = end_timestamp.strftime("%Y-%m-%d%H:%M:%S")
            timestamp = formatted_datetime 
            new_file_path = f"{ga['name']}_{timestamp}_{guid}_{pcap_file}"

            subprocess.run(["mv", pcap_file, new_file_path])


            # Push the saved packet capture to an S3 bucket
            push_to_s3(s3_bucket_name, new_file_path)
