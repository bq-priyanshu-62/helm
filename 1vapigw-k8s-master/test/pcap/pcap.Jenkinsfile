@Library('jenkins-commons')
import utils.FileHandler
import config.ConfigLoader

node {
    checkout scm
    serviceParams = []
    configFile = "env-config/${getActiveEnvironment(this)}.yaml"
    config = loadConfig(configFile)

    serviceParams.addAll([
        booleanParam(name: 'RELOAD_PARAMS', defaultValue: false, description: 'If selected, will reload the params without executing the pipeline stages. Useful when you change the config files.'),
        choice(choices: ['dev', 'qa', 'prod'], name: 'environment', description: 'env for which the curl request belongs'),
        string(name: 'curlRequest', defaultValue: 'curl https://gw-euw1.api-eu.qa.v1.vonagenetworks.net/gateway/load', description: 'Add a curl request to run for pcap'),
        string(name: 'requestTimeOutSecs', defaultValue: '2', description: 'Timeout for the request in secs, can be fractional like 0.5'),
        string(name: 'sleepSecs', defaultValue: '0.5', description: 'Delay between requests in secs, can be fractional like 0.5'),
        string(name: 'expectedResponseCode', defaultValue: '200', description: 'Timeout for the request in secs'),
        string(name: 'iterations', defaultValue: '100', description: 'Number of times the request should be run'),
    ])
    properties([[$class: 'RebuildSettings', autoRebuild: false, rebuildDisabled: false], parameters(serviceParams)])
}


pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        durabilityHint('PERFORMANCE_OPTIMIZED')
        // timeout(time: 25, unit: 'MINUTES')
        buildDiscarder(
            BuildHistoryManager([
                [
                    conditions: [ BuildAgeRange(minDaysAge: 30, maxDaysAge: 30) ],
                    continueAfterMatch: true,
                    actions: [ DeleteBuild() ]
                ],
                [
                    conditions: [ BuildResult(matchSuccess: true) ],
                    continueAfterMatch: false,
                    matchAtMost: 20,
                ],
                [
                    conditions: [ BuildResult(matchAborted: true, matchFailure: true, matchUnstable: true) ],
                    continueAfterMatch: false,
                ],
                [
                    actions: [ DeleteBuild() ]
                ]
            ])
        )
    }

    stages {
        stage("Reload Params") {
            steps {
                script {
                    if (params.RELOAD_PARAMS) {
                        currentBuild.result = 'ABORTED'
                        errorMessage = "This is a dry run to reload job parameters."
                        error('DRY RUN COMPLETED. JOB PARAMETERIZED.')
                    }
                }
            }
        }
        stage('Run PCAP TRACE') {
            steps {
                script {
                    sh(script: """
                            cd test/pcap
                            rm -rf report
                            mkdir -p report
                            chmod -R 777 report
                            eval \$(aws sts assume-role --role-arn ${config.aws_config.role} --role-session-name jenkins-session | jq -r '.Credentials | "export AWS_ACCESS_KEY_ID=\\(.AccessKeyId)\nexport AWS_SECRET_ACCESS_KEY=\\(.SecretAccessKey)\nexport AWS_SESSION_TOKEN=\\(.SessionToken)\n"')
                            aws ecr get-login-password --region ${config.aws_config.ecr_region} | docker login --username AWS --password-stdin ${config.aws_config.ecr}
                            docker run --pull=always --name apigw-pcap-test -v "\$WORKSPACE/test/pcap/report":/app/report --rm ${config.aws_config.ecr}/${config.aws_config.ecr_image}  -c "$curlRequest" -t "$requestTimeOutSecs" -s "$sleepSecs" -e "$expectedResponseCode" -n "$iterations" 2>&1 | tee pcap_test_capture.txt
                        """)
                }
            }
        }
        stage('Save PCAP TRACE') {
            steps {
                script {
                    sh(script: """
                            cd test/pcap
                            eval \$(aws sts assume-role --role-arn ${config.aws_config.role} --role-session-name jenkins-session | jq -r '.Credentials | "export AWS_ACCESS_KEY_ID=\\(.AccessKeyId)\nexport AWS_SECRET_ACCESS_KEY=\\(.SecretAccessKey)\nexport AWS_SESSION_TOKEN=\\(.SessionToken)\n"')
                            s3_key=`echo ${environment}/\$(date '+%Y')/\$(date '+%m')/\$(date '+%d')/pcap_test_capture_\$BUILD_NUMBER.pcap`
                            s3_key_txt=`echo ${environment}/\$(date '+%Y')/\$(date '+%m')/\$(date '+%d')/pcap_test_capture_\$BUILD_NUMBER.txt`
                            aws s3api put-object --bucket ${config.aws_config.s3_bucket} --key \$s3_key --body "\$WORKSPACE/test/pcap/report/pcap_test_capture.pcap"
                            aws s3api put-object --bucket ${config.aws_config.s3_bucket} --key \$s3_key_txt --body "\$WORKSPACE/test/pcap/pcap_test_capture.txt"
                        """)
                }
            }
        }
    }
    post {
        always {
            slackSend channel: "${config.notification.slack_channel}", color: 'warning', message: ":alert-cyan: The pipeline ${currentBuild.fullDisplayName} was run (<${env.BUILD_URL}|Open>)\n```Environment: ${environment}\nRequest: ${curlRequest}\nRequestTimeOut: ${requestTimeOutSecs}\nSleepSecs: ${sleepSecs}\nExpectedResponseCode: ${expectedResponseCode}\nIterations: ${iterations}```"
        }
    }
}

// Determine if it is aws-dev or aws-prod jenkins box
def getActiveEnvironment(jenkinsScript) {
    return (jenkinsScript.env.JENKINS_URL.contains("dev.nexmo") || jenkinsScript.env.JENKINS_URL.contains("nexmo.dev")) ? "dev" : "prod"
}

// Load YAML config
def loadConfig(configName) {
    def configFilePath = new FileHandler(this).getFileRelativePath(configName)
    sh "echo $configFilePath"
    def config = new ConfigLoader("$WORKSPACE/$configFilePath").load()
    return config
}
