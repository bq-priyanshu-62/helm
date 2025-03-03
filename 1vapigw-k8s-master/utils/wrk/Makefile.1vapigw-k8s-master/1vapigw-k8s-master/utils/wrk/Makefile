qa-euw1-auth-load:
	rm -vfr wrk.log
	wrk2 -t4 -c50 -R1 -d20s -L -s nexmo-auth.lua https://gw-euw1-c1.api-eu.qa.v1.vonagenetworks.net/gateway/ping-protected
	#wrk2 -t4 -c50 -R1 -d30s -L -s nexmo-auth.lua https://gw-euw1-c1.api-eu.qa.v1.vonagenetworks.net/v0.1/whatsapp-manager

qa-euw1-identity-load:
	#wrk2 -t4 -c100 -d30s -L -R100 -s utils/wrk/nexmo-identity.lua https://gw-euw1-c1.api-eu.qa.v1.vonagenetworks.net/envoy-auth
	wrk2 -t4 -c100 -R100 -d20s -L -s nexmo-identity.lua https://identity-apigw.eks-2-eu-west-1.dev.nexmo.xxx/envoy-auth

qa-euw1-slow-load:
	rm -vfr wrk.log
	wrk2 -t1 -c100 -R100 -d60s -L -s slow.lua https://gw-euw1-c1.api-eu.qa.v1.vonagenetworks.net

qa-euw1-ga-load:
	rm -vfr wrk.log
	wrk2 -t4 -c100 -R100 -d60s -L -s load.lua https://api-eu.qa.v1.vonagenetworks.net/gateway/load

qa-euw1-wam-load:
	rm -vfr wrk.log
	wrk2 -t1 -c1 -R1 -d20s -L -s wam.lua https://gw-euw1-c1.api-eu.qa.v1.vonagenetworks.net/v0.1/whatsapp-manager

prod-use1-rate-limit:
	rm -vfr wrk.log
	wrk2 -t1 -c10 -R20 -d10s -s log.lua -L https://api-us.uc.vonage.com/meetings/health
