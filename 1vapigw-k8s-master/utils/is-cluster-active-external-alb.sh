#!/usr/bin/env bash

# set -x
# Parameters
# $1 -- PROFILE
# $2 -- GA_NAME
# $3 -- CLUSTER
# $4 -- Cluster region

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
ALBS_WITH_TRAFFIC=$(aws globalaccelerator list-endpoint-groups --profile "${1}" --region "${GA_REGION}" --listener-arn "$GA_LISTENER_ARN"  --o text --query "EndpointGroups[?EndpointGroupRegion==\`${C_REGION}\`].EndpointDescriptions | []|[?Weight>\`0\`&&HealthState==\`HEALTHY\`].EndpointId")

LISTENERS=$(aws elbv2  describe-listeners  --profile "${1}" --region "${C_REGION}" --load-balancer-arn "$ALBS_WITH_TRAFFIC"  --o text --query "Listeners[?Port==\`443\`].ListenerArn")
TG_ARNS=$(aws elbv2  describe-rules  --profile "${1}" --region "${C_REGION}" --listener-arn "$LISTENERS" --o text --query "Rules[?Priority=='1'].Actions|[]|[?Order==\`1\`].ForwardConfig.TargetGroups|[]|[?Weight>\`0\`].TargetGroupArn")
TG_CLUSTERS=$(aws elbv2  describe-tags  --profile "${1}" --region "${C_REGION}" --resource-arns $TG_ARNS --query "TagDescriptions[].Tags[?Key=='elbv2.k8s.aws/cluster'].Value" --o text)

CLUSTER_NUMBER="${3: -1}"

if [[ $TG_CLUSTERS == *-${CLUSTER_NUMBER}* ]]; then
  echo "Cluster ${3} is active!"; exit 1;
fi

echo "Cluster ${3} is inactive!"; exit 0;
