@Library ('jenkins-commons') _

node {
    checkout scm
}

pipeline {
    agent any

    parameters {
        string(name: 'SOURCE_REPOSITORY', defaultValue: '564623767830.dkr.ecr.eu-west-1.amazonaws.com')
        string(name: 'TARGET_REPOSITORY', defaultValue: '920763156836.dkr.ecr.eu-west-1.amazonaws.com')
        string(name: 'ECR_REPO_NAME', description: 'The ecr repository to pull and push your image to.')
        string(name: 'DOCKER_PULL_TAG', description: 'Image tag to be promoted.')
    }

    stages {
        stage ('Setup AWS Config') {
            steps {
                script {
                    sh '''
                        set -eu

                        aws ecr get-login-password --region eu-west-1 --profile nexmo-dev | docker login --username AWS --password-stdin ${SOURCE_REPOSITORY}
                        aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin ${TARGET_REPOSITORY}

                        echo "Pulling from $SOURCE_REPOSITORY/$ECR_REPO_NAME"
                        docker pull ${SOURCE_REPOSITORY}/${ECR_REPO_NAME}:${DOCKER_PULL_TAG}

                        echo "Pushing to $TARGET_REPOSITORY/${ECR_REPO_NAME}"
                        docker tag ${SOURCE_REPOSITORY}/${ECR_REPO_NAME}:${DOCKER_PULL_TAG} ${TARGET_REPOSITORY}/${ECR_REPO_NAME}:${DOCKER_PULL_TAG}
                        docker push ${TARGET_REPOSITORY}/${ECR_REPO_NAME}:${DOCKER_PULL_TAG}

                        echo "Deleting local $TARGET_REPOSITORY/${ECR_REPO_NAME} image"
                        docker rmi ${TARGET_REPOSITORY}/${ECR_REPO_NAME}:${DOCKER_PULL_TAG}

                        echo "Deleting local $SOURCE_REPOSITORY/${ECR_REPO_NAME} image"
                        docker rmi ${SOURCE_REPOSITORY}/${ECR_REPO_NAME}:${DOCKER_PULL_TAG}
                    '''
                }
            }
        }
    }
}
