#!/usr/bin/env sh
set -eux
DIRECTORY="$( cd "$( dirname "$0" )" >/dev/null 2>&1 && pwd -P)"
for chart in $(cat ${DIRECTORY}/apigw-charts.json | jq . | jq -r @sh)
do
  stripped=$(echo $chart | xargs)
  cd $DIRECTORY/../../../${stripped}
  rm -rf ./charts
  helm dependency update .
done
