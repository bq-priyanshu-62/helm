#!/usr/bin/env bash

set +e

# e.g. apigw-api-eu qa euw 1 nexmo 
# $1 environment (dev|qa|prod)
# $2 full region name (eu-west-1|eu-central-1|ap-southeast-1|us-east-1|us-west-2)
# $3 cluster number (0|1|2|3) Where 0 means the regional endpoint not cluster specific
# $4 LOB specifics (nexmo|cc|uc)
# $5 Makefile dir

# Run glooctl check
echo "Gloo check for env: ${1}, region: ${2}, cluster=1vapi-${3}, lob: ${4}"
aws eks update-kubeconfig --kubeconfig ${5}/.k8s-config/${1}.${2}.${3}.${4}.cfg --region ${2} --name 1vapi-$3 --profile 1v-apigw-$1
glooctl --kubeconfig ${5}/.k8s-config/${1}.${2}.${3}.${4}.cfg -n ${4}-gloo check 2>&1|grep -v roundTripper

exit 0
