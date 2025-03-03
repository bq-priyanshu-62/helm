#!/usr/bin/env bash

set +e

./utils/run-tests.sh dev use1 1 nexmo
./utils/run-tests.sh dev use1 2 nexmo
./utils/run-tests.sh dev euw1 1 nexmo
./utils/run-tests.sh dev euw1 2 nexmo
