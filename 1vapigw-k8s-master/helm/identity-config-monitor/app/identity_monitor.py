import logging
import requests
from kubernetes import client, config
from flask import Flask

from http.server import BaseHTTPRequestHandler, HTTPServer

# Configure logging
logging.basicConfig(level=logging.INFO)

# Don't show the empty log messages on healthcheck calls
class HealthcheckFilter(logging.Filter):
    def filter(self, record):  
        return "healthcheck" not in record.getMessage()

log = logging.getLogger('werkzeug')
log.addFilter(HealthcheckFilter())

config.load_incluster_config()
v1 = client.CoreV1Api()

api = Flask(__name__)

@api.route('/healthcheck', methods=['GET'])
def healthcheck():
    return "healthy", 200

@api.route('/refresh', methods=['GET'])
def refresh_config():
    logging.log(logging.INFO, "Refreshing Identity config")
    pods = v1.list_pod_for_all_namespaces(label_selector="k8s-app=identity", watch=False)
    for pod in pods.items:
        logging.log(logging.INFO, "Found pod with ip {0} and name {1}".format(pod.status.pod_ip, pod.metadata.name))
        response = requests.get("http://" + pod.status.pod_ip + ":{0}/auth/refresh-config".format("4152"))
        if response.status_code == 200:
            logging.log(logging.INFO, "Successfully updated pod {0}".format(pod.metadata.name))
        else:
            logging.log(logging.ERROR, "Failed to update config on pod {0}".format(pod.metadata.name))
    return "success", 200

if __name__ == '__main__':
    api.run(host='0.0.0.0', port=3000)
