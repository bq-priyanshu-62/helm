#!/usr/bin/env bash

#set -x
# Parameters
# $1 -- PROFILE
# $2 -- GA_NAME
# $3 -- CLUSTER
# $4 -- REGION

GA_REGION=us-west-2

euc1=eu-central-1
euw1=eu-west-1
use1=us-east-1
usw2=us-west-2
apse1=ap-southeast-1
apse2=ap-southeast-2
C_REGION=${!4}

if [[ -z ${C_REGION} ]]; then
  echo 'cluster region is not defined'
  exit 1
fi

echo "Checking if cluster is active, profile: ${1}, ga-name: ${2}, cluster: ${3}, region: ${C_REGION}"

GA_ARN=$(aws globalaccelerator list-accelerators --profile "${1}" --region "${GA_REGION}" --o text --query "Accelerators[?Name=='${2}'].AcceleratorArn")
GA_LISTENER_ARN=$(aws globalaccelerator list-listeners --profile "${1}" --region "${GA_REGION}" --accelerator-arn "$GA_ARN" --o text --query 'Listeners[*].ListenerArn')
ALBS_WITH_TRAFFIC=$(aws globalaccelerator list-endpoint-groups --profile "${1}" --region "${GA_REGION}" --listener-arn "$GA_LISTENER_ARN"  --query "EndpointGroups[?EndpointGroupRegion==\`${C_REGION}\`].EndpointDescriptions | []|[?Weight>\`0\`&&HealthState==\`HEALTHY\`]")

#echo $ALBS_WITH_TRAFFIC | jq .

if [[ $ALBS_WITH_TRAFFIC == *${3}* ]]; then
  echo "Cluster ${3} is active!"; exit 1;
fi

echo "Cluster ${3} is inactive!"; exit 0;
