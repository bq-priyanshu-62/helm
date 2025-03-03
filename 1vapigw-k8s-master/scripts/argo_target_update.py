from kubernetes import client
from kubernetes.client.rest import ApiException
import sys, os, warnings

kube_host = os.getenv("KUBE_HOST")
bearer_token = os.getenv("AUTHORIZATION_TOKEN")

configuration = client.Configuration()
configuration.host = (kube_host)
configuration.verify_ssl = False  
configuration.api_key = {"authorization": f"Bearer {bearer_token}"}

v1 = client.CustomObjectsApi(client.ApiClient(configuration))
v2 = client.CoreV1Api(client.ApiClient(configuration))


# This function will be updating only those apps which are associated with the app-root and the apps which are associated with these apps.
def update_associate_apps(target_branch):
    root_app_json = v1.get_namespaced_custom_object(group="argoproj.io", version="v1alpha1", namespace="argocd", plural="applications", name="app-root" )
    warnings.filterwarnings("ignore")
    try:
        for associate_app in (root_app_json).get("status").get("resources", []):
            associate_app_name = associate_app.get("name")
            associate_app_json = v1.get_namespaced_custom_object(group="argoproj.io", version="v1alpha1", namespace="argocd", plural="applications", name=associate_app_name)
            warnings.filterwarnings("ignore")
            associate_app_json["spec"]["source"]["targetRevision"] = target_branch
            v1.patch_namespaced_custom_object(group="argoproj.io", version="v1alpha1", namespace="argocd", plural="applications", name=associate_app_name, body=associate_app_json)
            print(f"-----------------------------ArgoCD Application {associate_app_name} modified successfully.-----------------------------")
    except ApiException as e:
        print(f"Error patching ArgoCD Application {associate_app_name}")
        print(f"Error Code: {e.status} {e.reason}")

def main():
    if len(sys.argv) < 1:
        print("Usage: python argo_target_update.py <arg>")
        sys.exit(1)
    arg1 = sys.argv[1]
    update_associate_apps(arg1)

if __name__ == "__main__":
    main()
