MAKEFILE_DIR=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

# K8S contexts for all envs
DEV_EUW1_EKS1=arn:aws:eks:eu-west-1:684154893900:cluster/1vapi-1
DEV_EUW1_EKS2=arn:aws:eks:eu-west-1:684154893900:cluster/1vapi-2
DEV_USE1_EKS1=arn:aws:eks:us-east-1:684154893900:cluster/1vapi-1
DEV_USE1_EKS2=arn:aws:eks:us-east-1:684154893900:cluster/1vapi-2
DEV_USE1_NEXMO_CI=arn:aws:eks:us-east-1:684154893900:cluster/1vapi-nexmo-ci

QA_APSE1_EKS1=arn:aws:eks:ap-southeast-1:507728974998:cluster/1vapi-1
QA_APSE1_EKS2=arn:aws:eks:ap-southeast-1:507728974998:cluster/1vapi-2
QA_APSE2_EKS1=arn:aws:eks:ap-southeast-2:507728974998:cluster/1vapi-1
QA_APSE2_EKS2=arn:aws:eks:ap-southeast-2:507728974998:cluster/1vapi-2
QA_EUC1_EKS1=arn:aws:eks:eu-central-1:507728974998:cluster/1vapi-1
QA_EUC1_EKS2=arn:aws:eks:eu-central-1:507728974998:cluster/1vapi-2
QA_EUW1_EKS1=arn:aws:eks:eu-west-1:507728974998:cluster/1vapi-1
QA_EUW1_EKS2=arn:aws:eks:eu-west-1:507728974998:cluster/1vapi-2
QA_USE1_EKS1=arn:aws:eks:us-east-1:507728974998:cluster/1vapi-1
QA_USE1_EKS2=arn:aws:eks:us-east-1:507728974998:cluster/1vapi-2
QA_USE1_EKS3=arn:aws:eks:us-east-1:507728974998:cluster/1vapi-3
QA_USW2_EKS1=arn:aws:eks:us-west-2:507728974998:cluster/1vapi-1
QA_USW2_EKS2=arn:aws:eks:us-west-2:507728974998:cluster/1vapi-2

PROD_APSE1_EKS1=arn:aws:eks:ap-southeast-1:275313334716:cluster/1vapi-1
PROD_APSE1_EKS2=arn:aws:eks:ap-southeast-1:275313334716:cluster/1vapi-2
PROD_APSE2_EKS1=arn:aws:eks:ap-southeast-2:275313334716:cluster/1vapi-1
PROD_APSE2_EKS2=arn:aws:eks:ap-southeast-2:275313334716:cluster/1vapi-2
PROD_EUC1_EKS1=arn:aws:eks:eu-central-1:275313334716:cluster/1vapi-1
PROD_EUC1_EKS2=arn:aws:eks:eu-central-1:275313334716:cluster/1vapi-2
PROD_EUW1_EKS1=arn:aws:eks:eu-west-1:275313334716:cluster/1vapi-1
PROD_EUW1_EKS2=arn:aws:eks:eu-west-1:275313334716:cluster/1vapi-2
PROD_USE1_EKS1=arn:aws:eks:us-east-1:275313334716:cluster/1vapi-1
PROD_USE1_EKS2=arn:aws:eks:us-east-1:275313334716:cluster/1vapi-2
PROD_USW2_EKS1=arn:aws:eks:us-west-2:275313334716:cluster/1vapi-1
PROD_USW2_EKS2=arn:aws:eks:us-west-2:275313334716:cluster/1vapi-2

fmt:
	find . -type f -name "*.libsonnet" -o -name "*.jsonnet" | xargs -n 1 jsonnetfmt -i

tag-update:
	git fetch --tags -f


ARGOCD_LIB_TAG=argocd-lib-v0.7.4
ARGOCD_ENV_TAG=argocd-env-v1.6.4

tag-argocd-lib:
	git tag ${ARGOCD_LIB_TAG} && git push origin ${ARGOCD_LIB_TAG}

tag-argocd-env:
	git tag ${ARGOCD_ENV_TAG} && git push origin ${ARGOCD_ENV_TAG}

nexmo-gloo-ui:
	glooctl cluster register --cluster-name local --remote-namespace nexmo-gloo
	kubectl port-forward -n nexmo-gloo svc/gloo-fed-console 8090

vbc-gloo-ui:
	glooctl cluster register --cluster-name local --remote-namespace vbc-gloo
	kubectl port-forward -n vbc-gloo svc/gloo-fed-console 8090

jb-update:
	find ./environments -name "jsonnetfile.json" -execdir jb update \;

validate-jsonnet-manifests-dev:
	@find ./environments/dev -name "main.jsonnet" -execdir ${MAKEFILE_DIR}/../utils/check-jsonnet.sh \;

# note: doesn't validate c2 in all regions! need to update them
validate-jsonnet-manifests-qa:
	find ./environments/qa -name "main.jsonnet" -execdir ${MAKEFILE_DIR}/../utils/check-jsonnet.sh \;

validate-jsonnet-manifests-prod:
	find ./environments/prod -name "main.jsonnet" -execdir ${MAKEFILE_DIR}/../utils/check-jsonnet.sh \;

validate-jsonnet-manifests-all: validate-jsonnet-manifests-dev validate-jsonnet-manifests-qa validate-jsonnet-manifests-prod

######################################
# argocd ui ports: 9[7:dev|8:qa|9:prod][1:aps1|2:aps2|3:euc1|4:euw1|5:use1|6:usw2][1:c1|2:c2|3:c3|9:ci]
# Dev
argocd-ui-dev-euw1-c1:
	kubectl --context ${DEV_EUW1_EKS1} port-forward svc/argocd-server -n argocd 9741:443

argocd-ui-dev-euw1-c2:
	kubectl --context ${DEV_EUW1_EKS2} port-forward svc/argocd-server -n argocd 9742:443

argocd-ui-dev-use1-c1:
	kubectl --context ${DEV_USE1_EKS1} port-forward svc/argocd-server -n argocd 9751:443

argocd-ui-dev-use1-c2:
	kubectl --context ${DEV_USE1_EKS2} port-forward svc/argocd-server -n argocd 9752:443

argocd-ui-dev-use1-ci:
	kubectl --context ${DEV_USE1_NEXMO_CI} port-forward svc/argocd-server -n argocd 9759:443

# QA
argocd-ui-qa-apse1-c1:
	kubectl --context ${QA_APSE1_EKS1} port-forward svc/argocd-server -n argocd 9811:443

argocd-ui-qa-apse1-c2:
	kubectl --context ${QA_APSE1_EKS2} port-forward svc/argocd-server -n argocd 9812:443

argocd-ui-qa-apse2-c1:
	kubectl --context ${QA_APSE2_EKS1} port-forward svc/argocd-server -n argocd 9821:443

argocd-ui-qa-apse2-c2:
	kubectl --context ${QA_APSE2_EKS2} port-forward svc/argocd-server -n argocd 9822:443

argocd-ui-qa-euc1-c1:
	kubectl --context ${QA_EUC1_EKS1} port-forward svc/argocd-server -n argocd 9831:443

argocd-ui-qa-euc1-c2:
	kubectl --context ${QA_EUC1_EKS2} port-forward svc/argocd-server -n argocd 9832:443

argocd-ui-qa-euw1-c1:
	kubectl --context ${QA_EUW1_EKS1} port-forward svc/argocd-server -n argocd 9841:443

argocd-ui-qa-euw1-c2:
	kubectl --context ${QA_EUW1_EKS2} port-forward svc/argocd-server -n argocd 9842:443

argocd-ui-qa-use1-c1:
	kubectl --context ${QA_USE1_EKS1} port-forward svc/argocd-server -n argocd 9851:443

argocd-ui-qa-use1-c2:
	kubectl --context ${QA_USE1_EKS2} port-forward svc/argocd-server -n argocd 9852:443

argocd-ui-qa-use1-c3:
	kubectl --context ${QA_USE1_EKS3} port-forward svc/argocd-server -n argocd 9853:443

argocd-ui-qa-usw2-c1:
	kubectl --context ${QA_USW2_EKS1} port-forward svc/argocd-server -n argocd 9861:443

argocd-ui-qa-usw2-c2:
	kubectl --context ${QA_USW2_EKS2} port-forward svc/argocd-server -n argocd 9862:443

# Prod
argocd-ui-prod-apse1-c1:
	kubectl --context ${PROD_APSE1_EKS1} port-forward svc/argocd-server -n argocd 9911:443

argocd-ui-prod-apse1-c2:
	kubectl --context ${PROD_APSE1_EKS2} port-forward svc/argocd-server -n argocd 9912:443

argocd-ui-prod-apse2-c1:
	kubectl --context ${PROD_APSE2_EKS1} port-forward svc/argocd-server -n argocd 9921:443

argocd-ui-prod-apse2-c2:
	kubectl --context ${PROD_APSE2_EKS2} port-forward svc/argocd-server -n argocd 9922:443

argocd-ui-prod-euc1-c1:
	kubectl --context ${PROD_EUC1_EKS1} port-forward svc/argocd-server -n argocd 9931:443

argocd-ui-prod-euc1-c2:
	kubectl --context ${PROD_EUC1_EKS2} port-forward svc/argocd-server -n argocd 9932:443

argocd-ui-prod-euw1-c1:
	kubectl --context ${PROD_EUW1_EKS1} port-forward svc/argocd-server -n argocd 9941:443

argocd-ui-prod-euw1-c2:
	kubectl --context ${PROD_EUW1_EKS2} port-forward svc/argocd-server -n argocd 9942:443

argocd-ui-prod-use1-c1:
	kubectl --context ${PROD_USE1_EKS1} port-forward svc/argocd-server -n argocd 9951:443

argocd-ui-prod-use1-c2:
	kubectl --context ${PROD_USE1_EKS2} port-forward svc/argocd-server -n argocd 9952:443

argocd-ui-prod-usw2-c1:
	kubectl --context ${PROD_USW2_EKS1} port-forward svc/argocd-server -n argocd 9961:443

argocd-ui-prod-usw2-c2:
	kubectl --context ${PROD_USW2_EKS2} port-forward svc/argocd-server -n argocd 9962:443
