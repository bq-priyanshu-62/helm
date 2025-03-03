#!/usr/bin/env bash

handle_error() {
  JSON_BODY="{
    \"text\": \"\`$APIGW_ENV\`, \`$AWS_REGION\`, \`$CLUSTER_NAME\`, \`$1\`, glooctl check error:\n\`\`\`$2\`\`\`\"
  }"
  echo "curl -X POST $SLACK_WEBHOOK -H 'Content-Type: application/json' --data-raw $JSON_BODY"
  curl -X POST "$SLACK_WEBHOOK" -H 'Content-Type: application/json' --data-raw "$JSON_BODY"
}

handle_nexmo_error() {
  ESCAPE_JSON_STRING=$(jq --raw-input --slurp '.' <nexmo.log | sed -e 's/^"//' -e 's/"$//')
  handle_error "nexmo-gloo" "$ESCAPE_JSON_STRING"
}

handle_vbc_error() {
  ESCAPE_JSON_STRING=$(jq --raw-input --slurp '.' <vbc.log | sed -e 's/^"//' -e 's/"$//')
  handle_error "vbc-gloo" "$ESCAPE_JSON_STRING"
}

check() {
  local -r -i max_attempts="$1"
  shift
  local -r namespace="$1"
  shift
  local -i attempt_num=1
  echo "Max attempt(s): $max_attempts"
  echo "Attempt $attempt_num start"
  until "$@"; do
    if ((attempt_num == max_attempts)); then
      echo "Attempt $attempt_num failed. Notify slack."
      handle_nexmo_error
      return 0
    else
      echo "Attempt $attempt_num failed! Trying again in 10 seconds."
      ((attempt_num++))
      sleep 10
      echo "Attempt $attempt_num start"
    fi
  done
}

nexmo() {
  echo "------------------------------" >>nexmo-full.log
  glooctl check -x proxies -n nexmo-gloo 2>&1 >nexmo.log
  cat nexmo.log >>nexmo-full.log
  if [ "$(grep -c "No problems detected." nexmo.log)" -eq 0 ]; then
    echo "Problems detected. - nexmo-gloo"
    return 1
  fi
}

echo "aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME"
aws eks update-kubeconfig --region "$AWS_REGION" --name "$CLUSTER_NAME"

echo '"glooctl check -n nexmo-gloo" started'
check "$MAX_ATTEMPTS" "nexmo-gloo" nexmo
cat nexmo-full.log
echo '"glooctl check -n nexmo-gloo" finished'

echo "DONE"
