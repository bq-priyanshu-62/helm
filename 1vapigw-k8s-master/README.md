# 1vapigw-k8s

## Argo-CD
### Setting up argo-cd

argo-cd is installed by terraform from the 1vapigw-tf repo. See the module argocd and the eks-1-argocd implementation in each region. 

## Accessing the argo-cd server

### Privatelink

Access ArgoCD UI via your LDAP account

[List of ArgoCD privatelink URL](https://confluence.vonage.com/display/APISRE/Service+Runbook%3A+API+Gateway#ServiceRunbook:APIGateway-ListofArgoCDprivatelinkURL)


### Port forwarding

https://argo-cd.readthedocs.io/en/stable/getting_started/#port-forwarding


```shell
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

then you can log-in to argocd server from localhost:8080

### Admin user and password

user: admin

password: stored in AWS secret manager, can be fetched using the following command:


```shell
aws --profile ${account_profile} --region ${region} secretsmanager get-secret-value --secret-id global/api-gw/other/${region}/${eks_cluster_name}/argocd/admin-credentials | jq -r '.SecretString'
```

Example:
```shell
aws --profile 1v-apigw-prod --region ap-southeast-2 secretsmanager get-secret-value --secret-id global/api-gw/other/ap-southeast-2/1vapi-2/argocd/admin-credentials | jq -r '.SecretString'
```


### vieweing argocd current configuration:

    kubectl config --namespace=argocd view

# Testing
To run tests from makefile start by running ```npm i```.
After installing dependencies you can run:

Nexmo QA - ```make qa-euw1-nexmo```

Nexmo PROD - ```make prod-euw1-sanity```

VBC QA - ```qa-vbc-sanity```

VBC PROD - ```prod-vbc-sanity```

To run tests refer to running the tests section in https://confluence.vonage.com/display/1APIG/Test+in+Dev+and+QA

# Tips:

### Customize helm chart:
#### Value override available for the gloo-enterprise chart:
* Enterprise: https://docs.solo.io/gloo/latest/installation/enterprise/#list-of-gloo-helm-chart-values
* Open source: https://docs.solo.io/gloo/latest/reference/helm_chart_values/

#### Modify deployment not available in values overrides:
* https://docs.solo.io/gloo/latest/installation/gateway/kubernetes/helm_advanced/

For example, applying the rate limit to the gloo settings:
Note: remove the dry-run option to apply changes
```
helm template gateway glooe/gloo-ee --post-renderer ./utils/kustomize/qa/kustomize.sh --version 1.3.9 --dry-run
helm upgrade -i gateway glooe/gloo-ee --post-renderer ./utils/kustomize/qa/kustomize.sh -n vbc-gloo -f helm/gateways/values.yaml -f helm/gateways/uc.yaml --version 1.3.9
```

## Checking the deployment?
### Specific cluster
Substitute onevapi-1 with <cluster number> and us-east with desired region

```shell script
curl -H 'Host: echo.qa.api.vonage.com' https://onevapi-1-us-east.qa.api-us.vonage.com/health
curl -H 'Host: meetings.qa.api.vonage.com' https://onevapi-1-us-east.qa.api-us.vonage.com/meetings/health
```

### vbc + meetings sanity
Set kubectl context before using glooctl
```
curl -v -H "Host: meetings.api.vonage.com" $(glooctl -n vbc-gloo proxy url)/meetings/health

kubectl get all -A
kubectl -n vbc-gloo get proxy gateway-proxy -o yaml
kubectl -n vbc-gloo get settings/default --output yaml

glooctl -n vbc-gloo get u
glooctl -n vbc-gloo get vs

glooctl -n vbc-gloo debug logs -f gloo-logs.log
glooctl -n vbc-gloo debug logs --errors-only

Extract envoy configuration
glooctl proxy dump -n vbc-gloo

# envoy access log
kubectl -n vbc-gloo logs deploy/gateway-proxy -f

kubectl -n vbc-gloo logs deploy/gateway -f
kubectl -n vbc-gloo logs deploy/rate-limit -f
```

glooctl proxy logs -f -n <namespace>

###Troubleshoot pod status in Amazon EKS
See https://aws.amazon.com/premiumsupport/knowledge-center/eks-pod-status-troubleshooting/
kubectl -n <namespace> get pods -o wide
kubectl -n <namespace> describe pod <pod name>

### Connect to the rate limit redis instance
* Connect to the k8s cluster
* Get the pod running redis
```
REDIS_POD=`kubectl get all -n nexmo-gloo | grep redis | grep pod | cut -d' ' -f1`
```
* Connect to the redis server
```
kubectl -n nexmo-gloo exec -it ${REDIS_POD} -- redis-cli
```
* List all keys
```shell script
keys *
```
You should be able to see keys with your machine public ip (`curl ifconfig.me`). For example:
```
crd_generic_key_vbc-gloo.sanity-service-remote-address-20-rpm_remote_address_69.59.241.10_1608070800
```

### How to validate what's going to change by running helm update command?
* Install helm diff plugin https://github.com/databus23/helm-diff
* Update the helm upgrade command adding helm diff and removing flags like -i/--install, --wait, --create-namespace:
```shell script
helm diff upgrade <rest of command>
```

# Fluentd
Project github repository: https://github.com/Vonage/1v-fluentd
Cd helm
For example, to deploy fluentd to qa / us-east-1 / cluster 1, run:
```
helm upgrade -i fluentd . -n monitoring -f values.yaml -f 1vapi-c1-qa_values.yaml
```
Note: Set team tag to '1v-apigw-qa' to enable logs

### How to remove aws-alb-ingress-controller before applying new one
helm list -A --kube-context=<context> | grep aws-alb-ingress-controller
if found
helm delete --kube-context=<context> -n aws-system aws-alb-ingress

#### Jsonnet commands
```shell
brew install jsonnet
brew install jsonnet-bundler

# reformat jsonnet files
find . -type f -name "*.libsonnet" -o -name "*.jsonnet" | xargs -n 1 jsonnetfmt -i

# jb install github.com/<user>/<repo>/<subdir>@<version - can be tag or branch with no />
jb init
jb install https://github.com/Vonage/1vapigw-k8s/argocd/lib@argocd-lib-v0.2.0
jb install ../helm/gloo

After updating the a jb lib version, remeber to run jb update

cd argocd
jsonnet -J . environments/dev/eu-west-1/1vapi-2/main.jsonnet
```
####idea libsonnet plugin
* Install plugin: https://github.com/databricks/intellij-jsonnet
Note: If .libsonnet file syntax is not working:
* Go to 'File' -> 'File Properties' -> 'Associate with Filetype'
* Choose jsonnet

# Gloo 1.7 UI

In the upgrade to Gloo 1.7 the normal Gloo UI has been removed and moved to Gloo Fed. This is installed as part of the deployment now but the UI has a few issues at present:
1. The glooctl tool expects gloo-fed to reside in the namespace gloo-fed. We install it to nexmo-gloo. This is hardcoded in the glooctl tool
2. Gloo fed requires that the cluster is registered with it. This cannot be done automatically so requires some manual intervention to configure post-install

You can register the cluster by running: 
```shell
glooctl cluster register --cluster-name local --remote-namespace nexmo-gloo
```
You can access the UI by port forwarding:
```shell
kubectl port-forward -nnexmo-gloo svc/gloo-fed-console 8090
```
You can then access the UI via localhost:8090

# BORS branch protections

The bors config is in this repo in the file bors.toml. This works by branching from the PR branch, running its checks and then merging that change back to master. This requires some unintuitive branch protections:
* The branch should not require a PR before merging to master. Bors changes will not be in a PR. 
* The branch should not require approvals before merging. Bors will validate that the PR has approvals before it applies the change but if you separately require approvals then when Bors branches that branch needs to be approved which it won't be.
* The branch must require that the bors status check is passing - this will prevent non-bors merges
* Also require the fmt check to ensure code is well formatted
* Include administrators in the restrictions

This will prevent a user from manually merging or pushing to master. It will ensure that only bors bot can merge and only after a PR has been approved by a code owner
