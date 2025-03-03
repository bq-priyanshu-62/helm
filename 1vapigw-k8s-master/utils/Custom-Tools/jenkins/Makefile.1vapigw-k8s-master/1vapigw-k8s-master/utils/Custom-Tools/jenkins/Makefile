NAME:=nexmo-jenkins
TAG:=`git rev-parse --short HEAD`

DEV_PROFILE:=nexmo-dev
QA_PROFILE:=nexmo-qa
PROD_PROFILE:=nexmo-prod

# Note: ECR is configured and managed only on us-east-1, images will be pulled from other regions
DEV_ECR:=564623767830.dkr.ecr.eu-west-1.amazonaws.com
QA_ECR:=349193123391.dkr.ecr.eu-west-1.amazonaws.com
PROD_ECR:=920763156836.dkr.ecr.eu-west-1.amazonaws.com

# Parameters
# $1 -- AWS_PROFILE
# $2 -- AWS_REGION
# $3 -- AWS_ECR
define ecr_login
	aws --profile ${1} --region ${2} ecr get-login-password | docker login --username AWS --password-stdin ${3}
endef

# Parameters
# $1 -- AWS_ECR
# $2 -- TAG
define tag_and_push
	@docker tag ${DEV_ECR}/${NAME}:${2} "${1}/${NAME}:${2}"
	@docker push ${1}/${NAME}:${2}
endef

build:
	@docker build --platform=linux/amd64 -t ${NAME} .

dev-login:
	$(call ecr_login, ${DEV_PROFILE}, 'eu-west-1', ${DEV_ECR})

dev-pull:
	@docker pull ${DEV_ECR}/${NAME}:${TAG}

dev: dev-login dev-pull

qa-login:
	$(call ecr_login, ${QA_PROFILE}, 'eu-west-1', ${QA_ECR})

qa-push:
	$(call tag_and_push,${QA_ECR},${TAG})

qa: dev-pull qa-push

prod-login:
	$(call ecr_login, ${PROD_PROFILE}, 'us-east-1', ${PROD_ECR})

prod-push:
	$(call tag_and_push,${PROD_ECR},${TAG})

prod: dev-pull prod-push
