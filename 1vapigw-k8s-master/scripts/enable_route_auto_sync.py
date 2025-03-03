from kubernetes import client
from kubernetes.client.rest import ApiException
import sys, os

kube_host = os.getenv("KUBE_HOST")
bearer_token = os.getenv("AUTHORIZATION_TOKEN")

configuration = client.Configuration()
configuration.host = (kube_host)
configuration.verify_ssl = False  
configuration.api_key = {"authorization": f"Bearer {bearer_token}"}

k8s_custom_objects = client.CustomObjectsApi(client.ApiClient(configuration))

# This function will be enabling the auto sync for specific route applications.
def route_auto_sync_enable():
    try:
        nexmo_routes_json = k8s_custom_objects.get_namespaced_custom_object(group="argoproj.io", version="v1alpha1", namespace="argocd", plural="applications", name="gloo-nexmo-routes")
        nexmo_routes_json['spec']['syncPolicy'] = {'automated': {'prune': True, 'selfHeal': True}}
        k8s_custom_objects.patch_namespaced_custom_object(group="argoproj.io", version="v1alpha1", namespace="argocd", plural="applications", name="gloo-nexmo-routes", body=nexmo_routes_json)

        vcp_routes_json = k8s_custom_objects.get_namespaced_custom_object(group="argoproj.io", version="v1alpha1", namespace="argocd", plural="applications", name="gloo-vcp-routes")
        vcp_routes_json['spec']['syncPolicy'] = {'automated': {'prune': True, 'selfHeal': True}}
        k8s_custom_objects.patch_namespaced_custom_object(group="argoproj.io", version="v1alpha1", namespace="argocd", plural="applications", name="gloo-vcp-routes", body=vcp_routes_json)

    except ApiException as e:
        print(f"Error patching ArgoCD Application")
        print(f"Error Code: {e.status} {e.reason}")
        sys.exit(1)

if __name__ == "__main__":
    route_auto_sync_enable()
