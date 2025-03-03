#!/bin/bash

set -e

AP=$(curl -m 1 -s 'https://api-ap.vonage.com/gateway/ping' | jq -r '[.region, .cluster] | join(" - ")')
EU=$(curl -m 1 -s 'https://api-eu.vonage.com/gateway/ping' | jq -r '[.region, .cluster] | join(" - ")')
US=$(curl -m 1 -s 'https://api-us.vonage.com/gateway/ping' | jq -r '[.region, .cluster] | join(" - ")')

APSE1=$(curl -m 1 -s 'https://api-ap-3.vonage.com/gateway/ping' | jq -r '.cluster')
APSE2=$(curl -m 1 -s 'https://api-ap-4.vonage.com/gateway/ping' | jq -r '.cluster')
EUC1=$(curl -m 1 -s 'https://api-eu-4.vonage.com/gateway/ping' | jq -r '.cluster')
EUW1=$(curl -m 1 -s 'https://api-eu-3.vonage.com/gateway/ping' | jq -r '.cluster')
USE1=$(curl -m 1 -s 'https://api-us-3.vonage.com/gateway/ping' | jq -r '.cluster')
USW2=$(curl -m 1 -s 'https://api-us-4.vonage.com/gateway/ping' | jq -r '.cluster')

echo "Prod active clusters:"
echo "Geo:"
echo "ap: $AP"
echo "eu: $EU"
echo "us: $US"
echo "Regional:"
echo "ap-southeast-1: $APSE1"
echo "ap-southeast-2: $APSE2"
echo "eu-central-1: $EUC1"
echo "eu-west-1: $EUW1"
echo "us-east-1: $USE1"
echo "us-west-2: $USW2"
