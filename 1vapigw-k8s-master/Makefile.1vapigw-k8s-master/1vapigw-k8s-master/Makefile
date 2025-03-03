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
PROD_USW2_EKS1=arn:aws:eks:us-west-2:275313334716:cluster/1vapi-2

PROFILE_DEV=1v-apigw-dev
PROFILE_QA=1v-apigw-qa
PROFILE_PROD=1v-apigw-prod

c1=1vapi-1
c2=1vapi-2
c3=1vapi-3

apse1=ap-southeast-1
apse2=ap-southeast-2
euc1=eu-central-1
euw1=eu-west-1
use1=us-east-1
usw2=us-west-2

dev-init:
	agc ${PROFILE_DEV}
	aws eks update-kubeconfig --region eu-west-1 --name 1vapi-1 --profile ${PROFILE_DEV}
	aws eks update-kubeconfig --region eu-west-1 --name 1vapi-2 --profile ${PROFILE_DEV}
	aws eks update-kubeconfig --region us-east-1 --name 1vapi-1 --profile ${PROFILE_DEV}
	aws eks update-kubeconfig --region us-east-1 --name 1vapi-2 --profile ${PROFILE_DEV}
	aws eks update-kubeconfig --region us-east-1 --name 1vapi-nexmo-ci --profile ${PROFILE_DEV}

qa-init:
	agc ${PROFILE_QA}
	aws eks update-kubeconfig --region ap-southeast-1 --name 1vapi-1 --profile ${PROFILE_QA}
	aws eks update-kubeconfig --region ap-southeast-1 --name 1vapi-2 --profile ${PROFILE_QA}
	aws eks update-kubeconfig --region ap-southeast-2 --name 1vapi-1 --profile ${PROFILE_QA}
	aws eks update-kubeconfig --region ap-southeast-2 --name 1vapi-2 --profile ${PROFILE_QA}
	aws eks update-kubeconfig --region eu-central-1 --name 1vapi-1 --profile ${PROFILE_QA}
	aws eks update-kubeconfig --region eu-central-1 --name 1vapi-2 --profile ${PROFILE_QA}
	aws eks update-kubeconfig --region eu-west-1 --name 1vapi-1 --profile ${PROFILE_QA}
	aws eks update-kubeconfig --region eu-west-1 --name 1vapi-2 --profile ${PROFILE_QA}
	aws eks update-kubeconfig --region us-east-1 --name 1vapi-1 --profile ${PROFILE_QA}
	aws eks update-kubeconfig --region us-east-1 --name 1vapi-2 --profile ${PROFILE_QA}
	aws eks update-kubeconfig --region us-east-1 --name 1vapi-3 --profile ${PROFILE_QA}
	aws eks update-kubeconfig --region us-west-2 --name 1vapi-1 --profile ${PROFILE_QA}
	aws eks update-kubeconfig --region us-west-2 --name 1vapi-2 --profile ${PROFILE_QA}

prod-init:
	agc ${PROFILE_PROD}
	aws eks update-kubeconfig --region ap-southeast-1 --name 1vapi-1 --profile ${PROFILE_PROD}
	aws eks update-kubeconfig --region ap-southeast-1 --name 1vapi-2 --profile ${PROFILE_PROD}
	aws eks update-kubeconfig --region ap-southeast-2 --name 1vapi-1 --profile ${PROFILE_PROD}
	aws eks update-kubeconfig --region ap-southeast-2 --name 1vapi-2 --profile ${PROFILE_PROD}
	aws eks update-kubeconfig --region eu-central-1 --name 1vapi-1 --profile ${PROFILE_PROD}
	aws eks update-kubeconfig --region eu-central-1 --name 1vapi-2 --profile ${PROFILE_PROD}
	aws eks update-kubeconfig --region eu-west-1 --name 1vapi-1 --profile ${PROFILE_PROD}
	aws eks update-kubeconfig --region eu-west-1 --name 1vapi-2 --profile ${PROFILE_PROD}
	aws eks update-kubeconfig --region us-east-1 --name 1vapi-1 --profile ${PROFILE_PROD}
	aws eks update-kubeconfig --region us-east-1 --name 1vapi-2 --profile ${PROFILE_PROD}
	aws eks update-kubeconfig --region us-west-2 --name 1vapi-1 --profile ${PROFILE_PROD}
	aws eks update-kubeconfig --region us-west-2 --name 1vapi-2 --profile ${PROFILE_PROD}

#### Get Global Accelerator Weight Settings #####
get-qa-ga-us-uc:
	${MAKEFILE_DIR}/utils/ga-config.sh ${PROFILE_QA} apigw-api-us-uc

get-qa-ga-eu-api:
	${MAKEFILE_DIR}/utils/ga-config.sh ${PROFILE_QA} apigw-api-eu

get-prod-ga-us-uc:
	${MAKEFILE_DIR}/utils/ga-config.sh ${PROFILE_PROD} apigw-api-us-uc

get-prod-ga-eu-api:
	${MAKEFILE_DIR}/utils/ga-config.sh ${PROFILE_PROD} apigw-api-eu

split_by_dot = $(word $2,$(subst ., ,$1))

# Parameters
# $1 -- LOB
# $2 -- ENV
# "npm run test -- --group=nexmo/euw1 --test-env=qa.euw1.c1"
# npm i; npx run test:${1}:${2} || true
define run_tests
	@echo "--- running ${1} tests, env: ${2} ---"
	$(shell npm i; npx run test:${1}:${2}) || true
	$(if $(call split_by_dot,${2},3), $(call gloo_check,${1},${2}))
endef

# $1 -- LOB
# $2 -- ENV
define gloo_check
	@echo "Gloo check for env: $(call split_by_dot,${2},1), region: $(call split_by_dot,${2},2), cluster=$(call split_by_dot,${2},3), lob: ${1}"
	aws eks update-kubeconfig --kubeconfig ${MAKEFILE_DIR}/.k8s-config/$2.cfg --region $($(call split_by_dot,${2},2)) --name $($(call split_by_dot,${2},3)) --profile 1v-apigw-$(call split_by_dot,${2},1)
	glooctl --kubeconfig ${MAKEFILE_DIR}/.k8s-config/$2.cfg -n $1-gloo check
endef

###############
# NEXMO tests #
###############
# todo: add api.dev|qa.v1.vonagenetworks.net when ready
# todo: update prod eu-west-1 sanity tests once dns is done

INTERNAL_DOMAIN_SUFFIX=v1.vonagenetworks.net
QA_GLOBAL_DNS_NEXMO=api.qa.${INTERNAL_DOMAIN_SUFFIX}
QA_EU_DOMAIN_NEXMO=api-eu.qa.${INTERNAL_DOMAIN_SUFFIX}
QA_EUW1_DNS_NEXMO=${QA_EU_DOMAIN_NEXMO}
QA_EUW1_C1_HOST_NEXMO=gw-euw1-c1.${QA_EU_DOMAIN_NEXMO}
QA_EUW1_C2_HOST_NEXMO=gw-euw1-c2.${QA_EU_DOMAIN_NEXMO}
QA_AUTH_NEXMO=Basic dmVyaWZ5MjM6VmVyaWZ5MjM=

PROD_GLOBAL_DNS_NEXMO=api.vonage.com
PROD_EU_DOMAIN_NEXMO=api-eu.vonage.com
PROD_EUW1_DNS_NEXMO=api-eu-3.vonage.com
PROD_EUC1_DNS_NEXMO=api-eu-4.vonage.com
PROD_EUW1_C1_HOST_NEXMO=gw-euw1-c1.api-eu.prod.${INTERNAL_DOMAIN_SUFFIX}
PROD_EUW1_C2_HOST_NEXMO=gw-euw1-c2.api-eu.prod.${INTERNAL_DOMAIN_SUFFIX}
PROD_EUC1_C1_HOST_NEXMO=gw-euc1-c1.api-eu.prod.${INTERNAL_DOMAIN_SUFFIX}
PROD_EUC1_C2_HOST_NEXMO=gw-euc1-c2.api-eu.prod.${INTERNAL_DOMAIN_SUFFIX}

# Parameters
# $1 -- CLUSTER_HOST
# $2 -- NEXMO_AUTH
# $3 -- HOST_HEADER
define nexmo_identity_tests
	@echo "--- identity via gloo route tests ---"
	curl -I -w "%{http_code}\n\n" \
		-H "Host: ${3}" \
		https://${1}/identity/ping

	curl -I -w "%{http_code}\n\n" \
		-H "Host: ${3}" \
		-H "Authorization: ${2}" \
		https://${1}/identity/envoy-auth

	curl -I -w "%{http_code}\n\n" \
		-H "Host: ${3}" \
		-H 'Authorization: Basic INVALID' \
		https://${1}/identity/envoy-auth

	@echo "--- check rate limit - see that we get 429 response ---"
	for i in {1..10}; do \
		curl -s -o /dev/null -w "%{http_code}\n" -H "Host: ${3}" https://${1}/identity/ping; \
	done
endef

# Parameters
# $1 -- CLUSTER_HOST
# $2 -- NEXMO_AUTH
# $3 -- HOST_HEADER
define nexmo_throttling_tests
	curl -I -w "%{http_code}\n\n" -H "Host: ${3}" https://${1}/throttling/ping

	curl --location --request POST \
		-H "Host: ${3}" \
		-H "Authorization: ${2}" \
		-H 'Content-Type: application/json' \
		-H 'Cookie: sails.sid=s%3As24_X1pu1W1nbtrEJihWVKeH8q2EW0YU.KZKxobnGkP0aAMWR8uGJHcJOSiA98qzfsjE5%2FJif3kQ' \
		--data-raw '{ "rate": 5, "account_id": "verify23", "from_number": "1234567890" }' \
		https://${1}/throttling/rate-limit/services/voice/rules

	curl --location --request GET \
		-H "Host: ${3}" \
		-H "Authorization: ${2}" \
		-H 'Cookie: sails.sid=s%3As24_X1pu1W1nbtrEJihWVKeH8q2EW0YU.KZKxobnGkP0aAMWR8uGJHcJOSiA98qzfsjE5%2FJif3kQ' \
		https://${1}/throttling/rate-limit/force-update
endef

# DEV-EUW1 API
dev-euw1-c1-gloo-sanity:
	./utils/run-tests.sh dev euw1 1 true
	./utils/run-gloo-check.sh dev eu-west-1 1 nexmo ${MAKEFILE_DIR}

dev-euw1-c2-gloo-sanity:
	./utils/run-tests.sh dev euw1 2 true
	./utils/run-gloo-check.sh dev eu-west-1 2 nexmo ${MAKEFILE_DIR}

# DEV-USE1 API
dev-use1-c1-gloo-sanity:
	./utils/run-tests.sh dev use1 1 true
	./utils/run-gloo-check.sh dev us-east-1 1 nexmo ${MAKEFILE_DIR}
	./utils/run-gloo-check.sh dev us-east-1 1 vbc ${MAKEFILE_DIR}

dev-use1-c2-gloo-sanity:
	./utils/run-tests.sh dev use1 2 true
	./utils/run-gloo-check.sh dev us-east-1 2 nexmo ${MAKEFILE_DIR}
	./utils/run-gloo-check.sh dev us-east-1 2 vbc ${MAKEFILE_DIR}

# QA-APSE1 API
qa-apse1-c1-gloo-sanity:
	./utils/run-tests.sh qa apse1 1 true
	./utils/run-gloo-check.sh qa ap-southeast-1 1 nexmo ${MAKEFILE_DIR}

qa-apse1-c2-gloo-sanity:
	./utils/run-tests.sh qa apse1 2 true
	./utils/run-gloo-check.sh qa ap-southeast-1 2 nexmo ${MAKEFILE_DIR}

# QA-APSE2 API
qa-apse2-c1-gloo-sanity:
	./utils/run-tests.sh qa apse2 1 true
	./utils/run-gloo-check.sh qa ap-southeast-2 1 nexmo ${MAKEFILE_DIR}

qa-apse2-c2-gloo-sanity:
	./utils/run-tests.sh qa apse2 2 true
	./utils/run-gloo-check.sh qa ap-southeast-2 2 nexmo ${MAKEFILE_DIR}

# QA-EUW1 API
qa-euw1-c1-gloo-sanity:
	./utils/run-tests.sh qa euw1 1 true
	./utils/run-gloo-check.sh qa eu-west-1 1 nexmo ${MAKEFILE_DIR}

qa-euw1-c2-gloo-sanity:
	./utils/run-tests.sh qa euw1 2 true
	./utils/run-gloo-check.sh qa eu-west-1 2 nexmo ${MAKEFILE_DIR}

qa-euw1-c3-gloo-sanity:
	./utils/run-tests.sh qa euw1 3 true
	./utils/run-gloo-check.sh qa eu-west-1 3 nexmo ${MAKEFILE_DIR}

# QA-EUC1 API
qa-euc1-c1-gloo-sanity:
	./utils/run-tests.sh qa euc1 1 true
	./utils/run-gloo-check.sh qa eu-central-1 1 nexmo ${MAKEFILE_DIR}

qa-euc1-c2-gloo-sanity:
	./utils/run-tests.sh qa euc1 2 true
	./utils/run-gloo-check.sh qa eu-central-1 2 nexmo ${MAKEFILE_DIR}

qa-euc1-c3-gloo-sanity:
	./utils/run-tests.sh qa euc1 3 true
	./utils/run-gloo-check.sh qa eu-central-1 3 nexmo ${MAKEFILE_DIR}

# QA-USE1 API
qa-use1-c1-gloo-sanity:
	./utils/run-tests.sh qa use1 1 true
	./utils/run-gloo-check.sh qa us-east-1 1 nexmo ${MAKEFILE_DIR}
	./utils/run-gloo-check.sh qa us-east-1 1 vbc ${MAKEFILE_DIR}

qa-use1-c2-gloo-sanity:
	./utils/run-tests.sh qa use1 2 true
	./utils/run-gloo-check.sh qa us-east-1 2 nexmo ${MAKEFILE_DIR}
	./utils/run-gloo-check.sh qa us-east-1 2 vbc ${MAKEFILE_DIR}

qa-use1-c3-gloo-sanity:
	./utils/run-tests.sh qa use1 3 true
	./utils/run-gloo-check.sh qa us-east-1 3 nexmo ${MAKEFILE_DIR}
	./utils/run-gloo-check.sh qa us-east-1 3 vbc ${MAKEFILE_DIR}

# QA-USW2 API
qa-usw2-c1-gloo-sanity:
	./utils/run-tests.sh qa usw2 1 true
	./utils/run-gloo-check.sh qa us-west-2 1 nexmo ${MAKEFILE_DIR}

qa-usw2-c2-gloo-sanity:
	./utils/run-tests.sh qa usw2 2 true
	./utils/run-gloo-check.sh qa us-west-2 2 nexmo ${MAKEFILE_DIR}

qa-usw2-c3-gloo-sanity:
	./utils/run-tests.sh qa usw2 3 true
	./utils/run-gloo-check.sh qa us-west-2 3 nexmo ${MAKEFILE_DIR}

# PROD-EUW1 API
prod-euw1-c1-gloo-sanity:
	./utils/run-tests.sh prod euw1 1 false
	./utils/run-gloo-check.sh prod eu-west-1 1 nexmo ${MAKEFILE_DIR}

prod-euw1-c2-gloo-sanity:
	./utils/run-tests.sh prod euw1 2 false
	./utils/run-gloo-check.sh prod eu-west-1 2 nexmo ${MAKEFILE_DIR}

prod-euw1-c3-gloo-sanity:
	./utils/run-tests.sh prod euw1 3 false
	./utils/run-gloo-check.sh prod eu-west-1 3 nexmo ${MAKEFILE_DIR}

# PROD-EUC1 API
prod-euc1-c1-gloo-sanity:
	./utils/run-tests.sh prod euc1 1 false
	./utils/run-gloo-check.sh prod eu-central-1 1 nexmo ${MAKEFILE_DIR}

prod-euc1-c2-gloo-sanity:
	./utils/run-tests.sh prod euc1 2 false
	./utils/run-gloo-check.sh prod eu-central-1 2 nexmo ${MAKEFILE_DIR}

prod-euc1-c3-gloo-sanity:
	./utils/run-tests.sh prod euc1 3 false
	./utils/run-gloo-check.sh prod eu-central-1 3 nexmo ${MAKEFILE_DIR}

# PROD-USE1 API
prod-use1-c1-gloo-sanity:
	./utils/run-tests.sh prod use1 1 false
	./utils/run-gloo-check.sh prod us-east-1 1 nexmo ${MAKEFILE_DIR}
	./utils/run-gloo-check.sh prod us-east-1 1 vbc ${MAKEFILE_DIR}

prod-use1-c2-gloo-sanity:
	./utils/run-tests.sh prod use1 2 false
	./utils/run-gloo-check.sh prod us-east-1 2 nexmo ${MAKEFILE_DIR}
	./utils/run-gloo-check.sh prod us-east-1 2 vbc ${MAKEFILE_DIR}

# PROD-USW2 API
prod-usw2-c1-gloo-sanity:
	./utils/run-tests.sh prod usw2 1 false
	./utils/run-gloo-check.sh prod us-west-2 1 nexmo ${MAKEFILE_DIR}
	
prod-usw2-c2-gloo-sanity:
	./utils/run-tests.sh prod usw2 2 false
	./utils/run-gloo-check.sh prod us-west-2 2 nexmo ${MAKEFILE_DIR}

# PROD-APSE1 API
prod-apse1-c1-gloo-sanity:
	./utils/run-tests.sh prod apse1 1 false
	./utils/run-gloo-check.sh prod ap-southeast-1 1 nexmo ${MAKEFILE_DIR}
	
prod-apse1-c2-gloo-sanity:
	./utils/run-tests.sh prod apse1 2 false
	./utils/run-gloo-check.sh prod ap-southeast-1 2 nexmo ${MAKEFILE_DIR}

# PROD-APSE2 API
prod-apse2-c1-gloo-sanity:
	./utils/run-tests.sh prod apse2 1 false
	./utils/run-gloo-check.sh prod ap-southeast-2 1 nexmo ${MAKEFILE_DIR}
	
prod-apse2-c2-gloo-sanity:
	./utils/run-tests.sh prod apse2 2 false
	./utils/run-gloo-check.sh prod ap-southeast-2 2 nexmo ${MAKEFILE_DIR}

#############
# VBC Tests #
#############

# Parameters
# $1 -- CLUSTER_URL
define vbc_gloo_tests
	@echo "--- vbc gloo sanity ${1} ---"
	curl -s -o /dev/null -w "%{http_code}" https://${1}/health | grep "200" && echo "Success\n" || echo "Failed\n"
	curl -s -o /dev/null -w "%{http_code}" https://${1}/gateway/ping | grep "200" && echo "Success\n" || echo "Failed\n"
	curl -s -w '\n\n' https://${1}/ | jq '.error_description' | grep "Full authentication is required to access this resource" && echo "Success\n" || echo "Failed\n"
endef

dev-use1-c1-vbc-gloo-sanity:
	./utils/run-tests.sh dev use1 1 true uc
	./utils/run-gloo-check.sh dev us-east-1 1 vbc ${MAKEFILE_DIR}

dev-use1-c2-vbc-gloo-sanity:
	./utils/run-tests.sh dev use1 2 true uc
	./utils/run-gloo-check.sh dev us-east-1 2 vbc ${MAKEFILE_DIR}

qa-use1-c1-vbc-gloo-sanity:
	./utils/run-tests.sh qa use1 1 true uc
	./utils/run-gloo-check.sh qa us-east-1 1 vbc ${MAKEFILE_DIR}

qa-use1-c2-vbc-gloo-sanity:
	./utils/run-tests.sh qa use1 2 true uc
	./utils/run-gloo-check.sh qa us-east-1 2 vbc ${MAKEFILE_DIR}

qa-use1-c3-vbc-gloo-sanity:
	./utils/run-tests.sh qa use1 3 true uc
	./utils/run-gloo-check.sh qa us-east-1 3 vbc ${MAKEFILE_DIR}

qa-vbc-gloo-sanity: qa-use1-vbc-gloo-sanity
	@echo "Zuul gateway:"
	curl -s -w '\n\n' https://api.qa7.vocal-qa.com/meetings/guests/926888088/rooms | jq '.error_description' | grep "Full authentication is required to access this resource" && echo "Success - protected route\n" || echo "Failed\n"
	curl -s -w '\n\n' https://api.qa7.vocal-qa.com/meetings/phones | jq || echo 'Failed\n'

prod-use1-c1-vbc-gloo-sanity:
	./utils/run-tests.sh prod use1 1 false uc
	./utils/run-gloo-check.sh prod us-east-1 1 vbc ${MAKEFILE_DIR}

prod-use1-c2-vbc-gloo-sanity:
	./utils/run-tests.sh prod use1 2 false uc
	./utils/run-gloo-check.sh prod us-east-1 2 vbc ${MAKEFILE_DIR}

prod-use1-c3-vbc-gloo-sanity:
	./utils/run-tests.sh prod use1 3 false uc
	./utils/run-gloo-check.sh prod us-east-1 3 vbc ${MAKEFILE_DIR}

prod-use1-vbc-gloo-sanity:
	curl -s -w "%{http_code}" https://api.uc.vonage.com | grep 401 && echo "Got valid 401 response\n" || echo "Bad response, should be 401\n"


######################################
# argocd sync & hard refresh scripts,
# First port-forward to the correct cluster then run any of the following
argocd-sync:
	./utils/argocd-sync.sh argocd admin admin

argocd-sync-and-hard-refresh:
	./utils/argocd-sync.sh argocd admin admin --hard-refresh

argocd-fmt:
	find ./argocd -type f -name "*.libsonnet" -o -name "*.jsonnet" | xargs -n 1 jsonnetfmt -i
