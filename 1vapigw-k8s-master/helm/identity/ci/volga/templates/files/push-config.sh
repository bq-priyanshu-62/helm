{{- define "startup" }}
#!/bin/sh -e

echo "Pushing source config to Consul..."
curl -v --request PUT \
    --data-binary  "@/usr/local/volga-notifier/config/source" \
    http://${NEXMO_CONSUL_HOST}:${NEXMO_CONSUL_HTTP_PORT}/v1/kv/volga-notifier/source
echo "...source config pushed to Consul"

echo "Pushing service config to Consul..."
curl -v --request PUT \
    --data-binary  "@/usr/local/volga-notifier/config/accounts-jmx" \
    http://${NEXMO_CONSUL_HOST}:${NEXMO_CONSUL_HTTP_PORT}/v1/kv/volga-notifier/config/accounts-jmx

curl -v --request PUT \
    --data-binary  "@/usr/local/volga-notifier/config/numbers-jmx" \
    http://${NEXMO_CONSUL_HOST}:${NEXMO_CONSUL_HTTP_PORT}/v1/kv/volga-notifier/config/numbers-jmx
echo "...service config pushed to Consul"

{{- end }}
