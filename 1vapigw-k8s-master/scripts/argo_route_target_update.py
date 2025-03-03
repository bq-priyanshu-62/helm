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

# This function will be updating the specific route application with target barnch.
def update_specific_route(target_branch, target_route):
    try:
       app_json = k8s_custom_objects.get_namespaced_custom_object(group="argoproj.io", version="v1alpha1", namespace="argocd", plural="applications", name=target_route)
    except ApiException as e:
       print(f"Error occurred while trying to find the application {target_route}")
       print(f"Error Code: {e.status} {e.reason}")
       sys.exit(1) 

    warnings.filterwarnings("ignore")

    associate_app = app_json["metadata"]["labels"]["argocd.argoproj.io/instance"]
    associate_app_json = k8s_custom_objects.get_namespaced_custom_object(group="argoproj.io", version="v1alpha1", namespace="argocd", plural="applications", name= associate_app)
    try:
        associate_app_json["spec"]["syncPolicy"] = None
        k8s_custom_objects.patch_namespaced_custom_object(group="argoproj.io", version="v1alpha1", namespace="argocd", plural="applications", name=associate_app, body=associate_app_json)
        
        app_json["spec"]["source"]["targetRevision"] = target_branch
        k8s_custom_objects.patch_namespaced_custom_object(group="argoproj.io", version="v1alpha1", namespace="argocd", plural="applications", name=target_route, body=app_json)

    except ApiException as e:
        print(f"Error patching ArgoCD Application")
        print(f"Error Code: {e.status} {e.reason}")
        sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print("Usage: python argo_target_update.py <arg> <arg>")
        sys.exit(1)
    arg1 = sys.argv[1]
    arg2 = sys.argv[2]
    update_specific_route(arg1,arg2)

if __name__ == "__main__":
    main()
