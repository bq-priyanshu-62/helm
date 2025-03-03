#!/usr/bin/env bash

# e.g. apigw-api-eu qa euw 1 nexmo
# $1 environment (dev|qa|prod)
# $2 region (euw1|euc1|apse1|apse2|use1|usw2)
# $3 cluster number (1|2|active) Where 1, 2 or active for cluster 1, 2 or active cluster alb respectively
# Optional params
# $4 primary only (true to run just for the main domain or false to run for all) default true
# $5 LOB specifics (nexmo|cc|uc)
# $6 Service filter
# $7 run only ga-tests (true|false) default false


if [[ -z "$JENKINS_URL" ]]; then
  echo "Fetching secrets please wait..."
  ./utils/fetch_secrets.sh
fi

# Run tests
echo "Running tests: 1v-apigw-${1} 1vapi-${3} $2"
export JEST_HTML_REPORTERS_FILE_NAME="Test-${1}-${2}-c${3}.html"
export JEST_JUNIT_OUTPUT_NAME="./Test-${1}-${2}-c${3}.xml"
export JEST_JUNIT_CLASSNAME="${1}-${2}-c${3}"
export CACHE_DIR="${1}-${2}-c${3}"

if [ "$3" != 0 ]; then
  echo "Running cluster based tests"
  npm i
  if npm run test -- --lob="${5}" --service="${6}" --test-env="${1}.${2}.c${3}" --primary-only=${4} --ga-test=$7; then
    echo "Pass"
  else
    echo "Sleep 60s and retry..."
    sleep 60
    export RERUN=true
    npm run test -- --lob="${5}" --service="${6}" --test-env="${1}.${2}.c${3}" --primary-only=${4} --ga-test=$7 --only-failures
  fi
  # rm -f ./results/report-${1}-${2}-${3}-${5}-${6}.html
  # mv ./results/report.html ./results/report-${1}-${2}-${3}-${5}-${6}.html
else
  echo "Running regional and global tests"
  npm i
  if npm run test -- --group="${5}/${2}" --test-env="${1}.${2}" --primary-only=${4} --ga-test=$7 -rr; then
    echo "Pass"
  else
    echo "Sleep 60s and retry..."
    sleep 60
    npm run test -- --group="${5}/${2}" --test-env="${1}.${2}" --primary-only=${4} --ga-test=$7 -rr --only-failures
  fi
fi

if [[ -z "$JENKINS_URL" ]]; then
  rm -rf $HOME/filtered_file.txt $HOME/secrets_values.json $HOME/secrets.json
fi

# exit 0
