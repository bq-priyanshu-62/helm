
NAME :=1v-apigw-identity-config-monitor
TAG :=`git rev-parse --short HEAD`

DEV_PROFILE := 1v-apigw-dev
QA_PROFILE := 1v-apigw-qa
PROD_PROFILE := 1v-apigw-prod

# Note: ECR is configured and managed only on us-east-1, images will be pulled from other regions
DEV_ECR:=684154893900.dkr.ecr.us-east-1.amazonaws.com
QA_USE1_ECR:=507728974998.dkr.ecr.us-east-1.amazonaws.com
PROD_USE1_ECR:=275313334716.dkr.ecr.us-east-1.amazonaws.com


# Parameters
# $1 -- AWS_ECR
# $2 -- TAG
define tag_and_push
	@docker tag ${NAME} "${1}/${NAME}:${2}"
	@docker push ${1}/${NAME}:${2}
endef

build:
	@docker build --platform=linux/amd64 -t ${NAME} .

dev-login:
	@aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${DEV_ECR}

dev-push:
	$(call tag_and_push,${DEV_ECR},${TAG})
	$(call tag_and_push,${DEV_ECR},latest)

dev: build dev-login dev-push

qa-login:
	@aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${QA_USE1_ECR}

qa-push:
	$(call tag_and_push,${QA_USE1_ECR},${TAG})
	$(call tag_and_push,${QA_USE1_ECR},latest)

qa: build qa-login qa-push

prod-login:
	@aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${PROD_USE1_ECR}

prod-push:
	$(call tag_and_push,${PROD_USE1_ECR},${TAG})
	$(call tag_and_push,${PROD_USE1_ECR},latest)

prod: build prod-login prod-push

