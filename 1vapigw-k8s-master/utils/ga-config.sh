PROFILE=${1}
GA_NAME=${2}

REGION=us-west-2

GA_API_EU_ARN=$(aws globalaccelerator list-accelerators --profile ${PROFILE} --region ${REGION} --o text --query "Accelerators[?Name=='${GA_NAME}'].AcceleratorArn")
echo GA_API_EU_ARN: ${GA_API_EU_ARN}
GA_API_EU_LISTENER_ARN=$(aws globalaccelerator list-listeners --profile ${PROFILE} --region ${REGION} --accelerator-arn $GA_API_EU_ARN --o text --query 'Listeners[*].ListenerArn')
echo GA_API_EU_LISTENER_ARN: ${GA_API_EU_LISTENER_ARN}
aws globalaccelerator list-endpoint-groups --profile ${PROFILE} --region ${REGION} --listener-arn $GA_API_EU_LISTENER_ARN --o text --query 'EndpointGroups[*].EndpointDescriptions' | cat

