#!/bin/bash
cmd="curl https://gw-euw1.api-eu.qa.v1.vonagenetworks.net/gateway/load"
loopCount=10
timeOut=2
sleepTime=0.5
expectedResponseCode="200"
pcap_file="pcap_test_capture.pcap"

while [ "$#" -gt 0 ]
do
    case "$1" in
    # -x) cmd="$2" shift   ;;
    -c) cmd="$2"    ;;
    -n) loopCount=$2    ;;
    -t) timeOut=$2   ;;
    -s) sleepSecs=$2    ;;
    -e) expectedResponseCode="$2"   ;;
    --) break   ;;
    -*) echo "Invalid option '$1'. Use --help to see the valid options" >&2
        exit 1  ;;
    # an option argument, continue
    *)  ;;
    esac
    shift
done

echo "request: $cmd"
echo "iterations: $loopCount"
echo "request time out: $timeOut"
echo "expected response code: $expectedResponseCode"

TIMEFORMAT=%R
rm -f "$pcap_file"
tcpdump -i eth0 -w "$pcap_file" port 443 &
tcpdump_pid=$!
sleep 2
failedRequest=0

echo "*************************************"
full_cmd=`echo "$cmd -A 'pcap_test_script' -s -w '%{http_code} %{time_total}\n' -m $timeOut -o /dev/null"`
echo "final request: $full_cmd"
echo "iteration : response_code : duration (secs) : status"

for (( i=1 ; i<=$loopCount ; i++ ));
do
    curl_output=`eval $full_cmd`
    response_code=$(echo "$curl_output" | awk '{print $1}')
    duration=$(echo "$curl_output" | awk '{print $2}' | tr -d '[:alpha:]') # Remove all non-numeric characters

    if [ "$response_code" -ne "$expectedResponseCode" ]; then
        echo "iteration $i : $response_code : $duration : FAILED"
        failedRequest=$((failedRequest+1))
    else
        echo "iteration $i : $response_code : $duration : PASSED"
    fi

    sleep $sleepSecs
done

echo "*************************************"
echo "$failedRequest/$loopCount requests failed"
sleep 1
kill $tcpdump_pid
sleep 2
mv "$pcap_file" "report/$pcap_file"
echo "***PCAP Completed***"
