

pipeline {
    agent any

    parameters {
        string( name: 'JMETER_VERSION', defaultValue: '5.5', description: 'The version of jmeter image to build')
    }

    options {
        disableConcurrentBuilds()
    }

    stages {
        stage('Push Docker image to ECRs') {
            steps {
                script {
                    def imageTag         = params.JMETER_VERSION
                    def awsAccount       = getAWSAccount()

                    pushToEnvironment(awsAccount, imageTag)
                }
            }
        }
    }
}

def getActiveEnvironment(jenkinsScript) {
    if (jenkinsScript.env.JENKINS_URL.contains("dev.nexmo") || jenkinsScript.env.JENKINS_URL.contains("nexmo.dev")) {
        return "dev"
    } else if (jenkinsScript.env.JENKINS_URL.contains("qa.nexmo") || jenkinsScript.env.JENKINS_URL.contains("nexmo.qa")) {
        return "qa"
    } else if (jenkinsScript.env.JENKINS_URL.contains("prd.nexmo") || jenkinsScript.env.JENKINS_URL.contains("nexmo.prd")) {
        return "prd"
    } else {
        echo "Invalid jenkins instance."
        exit 1
    }
}

def getAWSAccount() {
    def env = getActiveEnvironment(this)

    if (env == "dev") {
        return "684154893900"
    } else if (env == "qa") {
        return "507728974998"
    } else if (env == "prd") {
        return "275313334716"
    } else {
        echo "Invalid jenkins instance."
        exit 1
    }
}

def pushToEnvironment(originAwsAccount, imageTag) {
    sh """
        cd test/performance
        eval \$(aws sts assume-role --role-arn arn:aws:iam::${originAwsAccount}:role/nexmo-jenkins-role  --role-session-name jenkins-session | jq -r '.Credentials | "export AWS_ACCESS_KEY_ID=\\(.AccessKeyId)\nexport AWS_SECRET_ACCESS_KEY=\\(.SecretAccessKey)\nexport AWS_SESSION_TOKEN=\\(.SessionToken)\n"')
        aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${originAwsAccount}.dkr.ecr.us-east-1.amazonaws.com
        
        docker build --build-arg="JMETER_VERSION=${imageTag}" -t ${originAwsAccount}.dkr.ecr.us-east-1.amazonaws.com/1v-apigw-perf-jmeter:${imageTag} .
        docker push ${originAwsAccount}.dkr.ecr.us-east-1.amazonaws.com/1v-apigw-perf-jmeter:${imageTag}
    """
}
