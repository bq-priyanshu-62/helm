#!/usr/bin/env bash

echo "-------------- Validating folder: $(pwd) --------------"
APPS=$(jsonnet cluster.jsonnet | jq -r '.gitTags."root-apps" | ["root-apps"] + keys | join(" ")')
echo "${APPS}"
for app in ${APPS}; do
  pwd
  jsonnet -J vendor main.jsonnet -J vendor --ext-str appsGroup=${app}
done
