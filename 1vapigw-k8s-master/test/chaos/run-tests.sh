#!/bin/bash

#chaos yaml file relative path
ARG1=${1:-scenarios/identity-pod-kill-simulation.yaml}

#pytest marker to run
ARG2=${2:-identity_pod_kill}

#duration to run the test
ARG3=${3:-200}

#api-gateway regional cluster domain to run the test
ARG4=${4:-gw-euw1-sanity.api-eu.dev.v1.vonagenetworks.net}

yamlfile=$ARG1
marker=$ARG2
duration=$ARG3
domain=$ARG4
threads=5
delay=30
dockerimage=apigw-chaostest

cd $(dirname "$0")

install_chaos_mesh() {
    echo "install chaos mesh"
    bash ./chaos-mesh-deploy.sh -d true -h false

    if [[ $? == 1 ]]
    then
        echo "chaos mesh installation failed. try deleting chaos mesh if it already exists. exiting."
        exit 1
    fi
}

cleanup_docker() {
    if [[ $(docker ps -a | grep $1 | wc -l) -gt 0 ]]
    then
        echo "delete existing containers ..."
        docker rm -f $(docker ps -a | grep $1 | awk "{print \$1}")
    fi
}

cleanup_chaos_mesh() {
    if [[ $(kubectl get namespace | grep chaos | wc -l) -gt 0 ]]
    then
        echo "remove chaos mesh"
        bash ./chaos-mesh-deploy.sh -d false
    fi
}

cleanup_docker $dockerimage
cleanup_chaos_mesh

install_chaos_mesh

echo "sleep 10 secs"
sleep 5

mkdir -p reports
docker build -t $dockerimage .
echo "$dockerimage -m $marker --threads=$threads --domain=$domain --duration=$duration --delay=$delay"
docker run $dockerimage -m $marker --threads=$threads --domain=$domain --duration=$duration --delay=$delay --junitxml=${marker}_test_report.xml --alluredir=allure-results &

echo "sleep $delay secs"
sleep $delay

echo "trigger chaos event"
kubectl create -f $yamlfile

while [[ $(docker ps | grep $dockerimage | wc -l) -gt 0 ]]
do
    sleep 5
done

kubectl delete -f $yamlfile
cleanup_chaos_mesh

echo "save results"
# Go back to the workspace folder
cd ../..
mkdir junit
docker cp $(docker ps -a | grep $dockerimage | awk "{print \$1}"):/app/${marker}_test_report.xml junit/${marker}_test_report.xml
docker cp $(docker ps -a | grep $dockerimage | awk "{print \$1}"):/app/allure-results .
cleanup_docker $dockerimage
