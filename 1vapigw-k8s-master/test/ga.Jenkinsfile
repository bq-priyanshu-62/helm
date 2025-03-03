@Library('jenkins-commons')
import utils.FileHandler
import config.ConfigLoader

node {
    checkout scm
    serviceParams = []
    configFile = "jenkins-config/${getActiveEnvironment(this)}.yaml"
    config = loadConfig(configFile)
    cronSchedule = generateCronSchedule()
    
    serviceParams.addAll([
        booleanParam(name: 'RELOAD_PARAMS', defaultValue: false, description: 'If selected, will reload the params without executing the pipeline stages. Useful when you change the config files.'),
    ])
    properties([[$class: 'RebuildSettings', autoRebuild: false, rebuildDisabled: false], parameters(serviceParams)])
}


pipeline {
    agent any

    environment {
        FAILING_REGIONS = ' '
    }
    
    triggers {
        parameterizedCron(cronSchedule)
    }

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        durabilityHint('PERFORMANCE_OPTIMIZED')
        timeout(time: 25, unit: 'MINUTES')
        buildDiscarder(
            BuildHistoryManager([
                [
                    conditions: [ BuildAgeRange(minDaysAge: 3, maxDaysAge: 3) ],
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
        stage('Run GA tests') {
            steps {
                script {
                    def parallelSteps = [:]
                    def regionMaps = []
                    sh(script: "npm ci")

                    config.tests.regions.each { regionMap ->
                        if(!regionMaps.any { reg ->
                            reg.region == regionMap.region && reg.environment == regionMap.environment
                            }) {
                            regionMaps.add([
                                environment: regionMap.environment,
                                region: regionMap.region
                            ])
                        }
                    }
                    regionMaps.each { regionMap ->
                        parallelSteps[regionMap] = {
                            echo "Running sanity-parallel ${regionMap.environment} ${regionMap.region} false"
                            def isTestSuccessful = sh(returnStatus: true, script: """
                                export ENABLE_REPORTPORTAL=${config.report_portal.enabled}
                                export RP_API_KEY=${config.report_portal.rp_api_key}
                                export RP_ENDPOINT=${config.report_portal.rp_endpoint}
                                export RP_PROJECT_NAME=${config.report_portal.rp_project}
                                export RP_LAUNCH="${config.report_portal.rp_launch}-GA-${regionMap.environment}-${regionMap.region}-c1"
                                export CI=true
                                
                                export RP_ATTRIBUTES="${config.report_portal.rp_launch_attributes},env:${regionMap.environment},region:${regionMap.region},cluster:c1"
                                eval \$(aws sts assume-role --role-arn arn:aws:iam::${config.account.accountID}:role/nexmo-jenkins-role --role-session-name jenkins-session | jq -r '.Credentials | "export AWS_ACCESS_KEY_ID=\\(.AccessKeyId)\nexport AWS_SECRET_ACCESS_KEY=\\(.SecretAccessKey)\nexport AWS_SESSION_TOKEN=\\(.SessionToken)\n"')
                                ./utils/run-tests.sh ${regionMap.environment} ${regionMap.region} 1 false '' '' true    
                            """) == 0

                            if(!isTestSuccessful) {
                                if (FAILING_REGIONS.length() == 1) {
                                    FAILING_REGIONS = "${regionMap.environment}-c${regionMap.region}"
                                }else {
                                    FAILING_REGIONS += ", ${regionMap.environment}-c${regionMap.region}"
                                }
                            }
                        }
                    }

                    parallel parallelSteps
                }
            }
        }
    }
    post {
        always {
            script {
                 // Publish the XML report
                junit 'results/Test-*.xml'

                // Publish the HTML report
                publishHTML (target : [allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'results',
                    reportFiles: 'Test-*.html',
                    reportName: 'HTML Reports'])

                // Delete the reports after being published
                sh "rm -rf results/Test-*"
            }
        }
        failure {
            script {
                if (FAILING_REGIONS.trim().isEmpty()) {
                    slackSend(channel: "${config.notification.slack_channel}", color: 'danger', message: ":no_smoking: The pipeline ${currentBuild.fullDisplayName} failed due to a pipeline error (<${env.BUILD_URL}|Open>)")
                } else {
                    slackSend(channel: "${config.notification.slack_channel}", color: 'danger', message: ":no_smoking: The pipeline ${currentBuild.fullDisplayName} failed for regions: ${FAILING_REGIONS} (<${env.BUILD_URL}|Open>)")
                }
            }
        }

//        failure {
//            slackSend channel: "${config.notification.slack_channel}", color: 'danger', message: ":no_smoking: The pipeline ${currentBuild.fullDisplayName} failed for ${FAILING_REGIONS} (<${env.BUILD_URL}|Open>)"
//            script {
//                if (params.ALLOW_EMAILS) {
//                        emailext(body: '''${SCRIPT, template="groovy-html.template"}''', mimeType: 'text/html', subject: "${currentBuild.fullDisplayName}", to: "${config.notification.email_list}", attachLog: 'true', attachmentsPattern: 'build.log')
//                }
//            }
//        }
        unstable {
            slackSend channel: "${config.notification.slack_channel}", color: 'danger', message: ":no_smoking: The pipeline ${currentBuild.fullDisplayName} has failing tests for ${FAILING_REGIONS} (<${env.BUILD_URL}|Open>)"
            script {
                if (params.ALLOW_EMAILS) {
                        emailext(body: '''${SCRIPT, template="groovy-html.template"}''', mimeType: 'text/html', subject: "${currentBuild.fullDisplayName}", to: "${config.notification.email_list}", attachLog: 'true', attachmentsPattern: 'build.log')
                }
            }
        }

        aborted {
            slackSend channel: "${config.notification.slack_channel}", color: 'danger', message: ":no_smoking: The pipeline ${currentBuild.fullDisplayName} was aborted for ${FAILING_REGIONS} (<${env.BUILD_URL}|Open>)"
        }

        fixed {
            slackSend channel: "${config.notification.slack_channel}", color: 'good', message: ":weed: The pipeline ${currentBuild.fullDisplayName} is now fixed (<${env.BUILD_URL}|Open>)"
        }
    }
}

// Determine if it is aws-dev or aws-prod jenkins box
def getActiveEnvironment(jenkinsScript) {
    if(jenkinsScript.env.JENKINS_URL.contains("dev.nexmo") || jenkinsScript.env.JENKINS_URL.contains("nexmo.dev")) {
        return "dev"
    } else if (jenkinsScript.env.JENKINS_URL.contains("qa.nexmo") || jenkinsScript.env.JENKINS_URL.contains("nexmo.qa")) {
        return "qa"
    }else {
        return "prod"
    }
}

// Load YAML config
def loadConfig(configName) {
    def configFilePath = new FileHandler(this).getFileRelativePath(configName)
    def config = new ConfigLoader("$WORKSPACE/$configFilePath").load()
    return config
}

// Generate cron schedule
def generateCronSchedule() {
    String cronLine = "H/10 * * * *"
    return cronLine
}
