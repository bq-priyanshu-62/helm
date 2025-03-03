#!/usr/bin/env bash

set +e

./utils/run-tests.sh qa apse1 1 
./utils/run-tests.sh qa apse1 2
./utils/run-tests.sh qa use1 1
./utils/run-tests.sh qa use1 2
./utils/run-tests.sh qa usw2 1
./utils/run-tests.sh qa usw2 2
./utils/run-tests.sh qa euw1 1
./utils/run-tests.sh qa euw1 2
./utils/run-tests.sh qa euc1 1
./utils/run-tests.sh qa euc1 2
