require "nexmo-common"

wrk.headers["Host"] = "identity-apigw.eks-2-eu-west-1.dev.nexmo.xxx"
wrk.headers["x-original-client-ip-address"] = "0.0.0.0"
