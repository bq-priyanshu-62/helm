#!/usr/bin/env bash

set -e

CONTEXT="$1"

if [[ -z ${CONTEXT} ]]; then
  echo "Usage: $0 KUBE-CONTEXT"
  exit 1
fi

NAMESPACES=$(kubectl --context ${CONTEXT} get -o json namespaces|jq '.items[].metadata.name'|sed "s/\"//g")
RESOURCES="configmap secret daemonset deployment service ingress hpa"

for ns in ${NAMESPACES};do
  echo "Starting namespace: ${ns}"
  for resource in ${RESOURCES};do
    echo "Starting resource: ${resource}"
    rsrcs=$(kubectl --context ${CONTEXT} -n ${ns} get -o json ${resource}|jq '.items[].metadata.name'|sed "s/\"//g")
    for r in ${rsrcs};do
      echo "Starting r: ${r}"
      dir=".tmp/${CONTEXT}/${ns}/${resource}"
      mkdir -p "${dir}"
      kubectl --context ${CONTEXT} -n ${ns} get -o yaml ${resource} ${r} > "${dir}/${r}.yaml"
    done
  done
done