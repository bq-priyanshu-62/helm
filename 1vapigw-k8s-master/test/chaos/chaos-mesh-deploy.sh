#!/bin/bash

while [ "$#" -gt 0 ]
do
    case "$1" in
    -d) deploy="$2" ;;
    -h) hostnet="$2" ;;
    --) break   ;;
    -*) echo "Invalid option '$1'. Use --help to see the valid options" >&2
        exit 1  ;;
    # an option argument, continue
    *)  ;;
    esac
    shift
done

cd $(dirname "$0")
echo "deploy: $deploy"
echo "hostnetwork: $hostnet"

if [[ "$deploy" == "true" ]] && [[ "$hostnet" == "true" ]]
then
    echo "deploying with host network"
    curl -sSL https://mirrors.chaos-mesh.org/v2.3.0/install.sh | bash -s -- --host-network
elif [[ "$deploy" == "true"  ]] && [[ "$hostnet" == "false" ]]
then
    curl -sSL https://mirrors.chaos-mesh.org/v2.3.0/install.sh | bash
elif [[ "$deploy" == "false" ]]
then
    if [ $(kubectl get namespace | grep chaos-mesh | wc -l) -gt 0 ]
    then
        echo "uninstall chaos-mesh ..."
        curl -sSL https://mirrors.chaos-mesh.org/v2.3.0/install.sh | bash -s -- --template | kubectl delete -f -
    fi

    while [[ $(kubectl get namespace | grep chaos | wc -l) -gt 0 ]]
    do
        sleep 5
    done
else
    echo "Please pass -d as true if you want to deploy and false to delete deployment"
    echo "Please pass -h as true if you want to deploy with host network and false to deploy without host network"
    exit 1
fi
