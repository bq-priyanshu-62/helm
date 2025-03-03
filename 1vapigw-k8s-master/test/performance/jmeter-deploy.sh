#!/bin/bash
# while getopts d:n:x:s:p:e:o:t:l: flag
# do
#     case "${flag}" in
#         d) deploy=${OPTARG};;
#         n) num=${OPTARG};;
#         x) inst=${OPTARG};;
#         s) script=${OPTARG};;
#         p) prop=${OPTARG};;
#         e) env=${OPTARG};;
#         o) overwrite=${OPTARG};;
#         t) threads=${OPTARG};;
#         l) duration=${OPTARG};;
#     esac
# done

while [ "$#" -gt 0 ]
do
    case "$1" in
    -d) deploy="$2" shift   ;;
    -n) num="$2"    ;;
    -x) inst="$2"   ;;
    -s) script="$2" ;;
    -p) prop="$2"   ;;
    -e) env="$2"    ;;
    -o) overwrite="$2"  ;;
    -t) threads="$2"    ;;
    -l) durationSecs="$2"   ;;
    -c) ctx="$2"  ;;
    --) break   ;;
    -*) echo "Invalid option '$1'. Use --help to see the valid options" >&2
        exit 1  ;;
    # an option argument, continue
    *)  ;;
    esac
    shift
done

curDir=$(dirname "$0")
cd ${curDir}
scriptpath="./scripts/${script}"
proppath="./config/${env}/${prop}"

kctl() {
  if [[ -z "$ctx" ]]
  then
    echo "kubectl without context"
    kubectl "$@"
  else
    kubectl --context="$ctx" "$@"
  fi
}

if [[ "$deploy" -eq "true"  ]] && [[ "$num" -gt "0" ]] && [[ "$inst" -gt "0" ]]
then
  if [[ ! -f $scriptpath ]]; then
    echo "Jmeter script file ${script} does not exist"
    exit 1
  fi

  if [[ ! -f $proppath ]]; then
    echo "Jmeter script file ${proppath} does not exist"
    exit 1
  fi

  jservice=''
  i=1

  if [ $(kctl get namespace | grep jmeter-${inst} | wc -l) -lt 1 ]
  then
    echo "Creating namespace jmeter-${inst} ..."
    kctl create namespace jmeter-${inst}
    sleep 1
  fi

  kctl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jmeter${inst}-server-deployment-${i}
  namespace: jmeter-${inst}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: jmeter${inst}-server-${i}
  template:
    metadata:
      labels:
        app: jmeter${inst}-server-${i}
    spec:
      containers:
        - name: jmeter${inst}-server-${i}
          image: 684154893900.dkr.ecr.us-east-1.amazonaws.com/1v-apigw-perf-jmeter:5.5
          command: ["sleep"]
          args: ["3600000"]
          imagePullPolicy: IfNotPresent
          resources:
            limits:
              cpu: 6
            requests:
              cpu: 6
EOF

  for i in $(eval echo "{1..$num}"); do
    if [[ $jservice == '' ]]
    then
        jservice="jmeter${inst}-service-${i}"
    else
        jservice="${jservice},jmeter${inst}-service-${i}"
    fi

kctl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jmeter${inst}-deployment-${i}
  namespace: jmeter-${inst}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: jmeter${inst}-${i}
  template:
    metadata:
      labels:
        app: jmeter${inst}-${i}
    spec:
      containers:
        - name: jmeter${inst}-${i}
          image: 684154893900.dkr.ecr.us-east-1.amazonaws.com/1v-apigw-perf-jmeter:5.5
          command: ["jmeter"]
          args: ["-s", "-Jserver.rmi.ssl.disable=true"]
          imagePullPolicy: IfNotPresent
          ports:
            - name: rmi-port
              containerPort: 1099
          resources:
            limits:
              cpu: 4
            requests:
              cpu: 4
---
apiVersion: v1
kind: Service
metadata:
  name: jmeter${inst}-service-${i}
  namespace: jmeter-${inst}
  labels:
    app: jmeter${inst}-${i}
spec:
  ports:
    - name: rmi-port
      port: 1099
      targetPort: rmi-port
      protocol: TCP
  selector:
    app: jmeter${inst}-${i}
---
EOF
done

while [ $(kctl get pods -n jmeter-${inst} | grep jmeter${inst}- | grep Terminating | wc -l) -gt 0 ]
do
  echo "Waiting for previous jmeter pods to terminate ..."
  sleep 10
done

while [ $(kctl get pods -n jmeter-${inst} | grep jmeter${inst}-server | grep Running | wc -l) -lt 1 ]
do
  echo "Waiting for jmeter-server ..."
  sleep 10
done

while [ $(kctl get pods -n jmeter-${inst} | grep jmeter${inst}-deployment | grep Running | wc -l) -lt $num ]
do
  echo "Waiting for jmeter-deployment ..."
  sleep 10
done

echo "copy files into jmeter-server"
jserver=$(kctl get pods -n jmeter-${inst} | grep jmeter${inst}-server | grep Running | awk "{print \$1}")
kctl cp -n jmeter-${inst} ${scriptpath} $jserver:./${script}
kctl cp -n jmeter-${inst} ${proppath} $jserver:./${prop}
echo "sleep for 30 secs before starting the test, allow pods to stabilize"
sleep 30
# Get the credentials from secret manager. Need to strip off any quotes from the response
AUTH="$(aws secretsmanager get-secret-value --secret-id gatewaytest/credentials --query SecretString --region eu-west-1 --output text | jq  '."api-hasQuotaAuthorization"' | jq -r '.')"

if [[ "$overwrite" == "true" ]]
then
    echo "overwriting threads and duration"
    kctl exec -n jmeter-${inst} $jserver -- ./bin/jmeter.sh -n -t ${script} -G${prop} -Gthreads=${threads} -GdurationSecs=${durationSecs} -Gauth="$AUTH" -Jserver.rmi.ssl.disable=true -R ${jservice} -l results.csv -e -o report | tee autoscale.txt
else
    kctl exec -n jmeter-${inst} $jserver -- ./bin/jmeter.sh -n -t ${script} -G${prop} -Gauth="$AUTH" -Jserver.rmi.ssl.disable=true -R ${jservice} -l results.csv -e -o report | tee autoscale.txt
fi

dir=$(kctl exec -n jmeter-${inst} $jserver -- pwd)
kctl cp -n jmeter-${inst} $jserver:$dir/report report

elif [[ "$deploy" -eq "false" ]] && [[ "$inst" -gt "0" ]]
then
    kctl delete deployment -n jmeter-${inst} $(kctl get deployment -n jmeter-${inst} | grep jmeter${inst} | awk "{print \$1}")
    kctl delete service -n jmeter-${inst} $(kctl get service -n jmeter-${inst} | grep jmeter${inst}-service | awk "{print \$1}")
    kctl delete namespace jmeter-${inst}
else
    echo "Please pass -d as true if you want to deploy and false to delete deployment"
    echo "Please pass -n as the number of agent pods required"
    echo "Please pass -x as the cluster number required"
    exit 1
fi
