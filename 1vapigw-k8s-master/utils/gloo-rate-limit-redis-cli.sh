set -x

NAMESPACE=${1:-"nexmo-gloo"}
REDIS_POD=$(kubectl get all -n ${NAMESPACE} | grep redis | grep pod | cut -d' ' -f1)
[ -n "${REDIS_POD}" ] && kubectl -n nexmo-gloo exec -it ${REDIS_POD} -- redis-cli
