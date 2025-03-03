#!/usr/bin/env bash

set +e

./utils/run-tests.sh prod apse1 1 
./utils/run-tests.sh prod apse1 2
./utils/run-tests.sh prod use1 1
./utils/run-tests.sh prod use1 2
./utils/run-tests.sh prod usw2 1
./utils/run-tests.sh prod usw2 2
./utils/run-tests.sh prod euw1 1
./utils/run-tests.sh prod euw1 2
./utils/run-tests.sh prod euc1 1
./utils/run-tests.sh prod euc1 2
