from kubernetes import client
from kubernetes.client.rest import ApiException
import sys, os, warnings

kube_host = os.getenv("KUBE_HOST")
bearer_token = os.getenv("AUTHORIZATION_TOKEN")

configuration = client.Configuration()
configuration.host = (kube_host)
configuration.verify_ssl = False  
configuration.api_key = {"authorization": f"Bearer {bearer_token}"}

k8s_custom_objects = client.CustomObjectsApi(client.ApiClient(configuration))

def is_route_being_used(route):
    try:
       app_json = k8s_custom_objects.get_namespaced_custom_object(group="argoproj.io", version="v1alpha1", namespace="argocd", plural="applications", name=route)
    except ApiException as e:
       print(f"Error occurred while trying to find the application {route}")
       print(f"Error Code: {e.status} {e.reason}")
       sys.exit(1) 

    warnings.filterwarnings("ignore")
        
    if app_json["spec"]["source"]["targetRevision"] != "master":
        isUsed = True
        print(f"Alreade used")
    else:
        isUsed = False
        print(f"Not used by other")
    return isUsed

def main():
    if len(sys.argv) < 1:
        print("Usage: python is_used_route.py <arg>")
        sys.exit(1)
    arg1 = sys.argv[1]
    used = is_route_being_used(arg1)
    if used:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
