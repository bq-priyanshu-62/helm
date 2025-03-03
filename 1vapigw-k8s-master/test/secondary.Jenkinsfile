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
        timeout(time: 30, unit: 'MINUTES')
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
        stage('Run sanity tests') {
            steps {
                script {
                    def parallelSteps = [:]
                    sh(script: "npm ci")

                    sh(script: """
                        ./utils/fetch_secrets.sh
                    """)

                    config.tests.regions.each { regionMap ->
                        parallelSteps[regionMap] = {
                            echo "Running sanity-parallel ${regionMap.environment} ${regionMap.region} ${regionMap.cluster} false"
                            def isTestSuccessful = sh(returnStatus: true, script: """
                                export ENABLE_REPORTPORTAL=${config.report_portal.enabled}
                                export RP_API_KEY=${config.report_portal.rp_api_key}
                                export RP_ENDPOINT=${config.report_portal.rp_endpoint}
                                export RP_PROJECT_NAME=${config.report_portal.rp_project}
                                export RP_LAUNCH="${config.report_portal.rp_launch}-AllDomains-${regionMap.environment}-${regionMap.region}-c${regionMap.cluster}"
                                export RP_ATTRIBUTES="${config.report_portal.rp_launch_attributes},env:${regionMap.environment},region:${regionMap.region},cluster:c${regionMap.cluster}"
                                export CI=true
                                
                                ./utils/run-tests.sh ${regionMap.environment} ${regionMap.region} ${regionMap.cluster} false
                            """) == 0

                            if(!isTestSuccessful) {
                                if (FAILING_REGIONS.length() == 1) {
                                    FAILING_REGIONS = "${regionMap.environment}-${regionMap.region}-c${regionMap.cluster}"
                                }else {
                                    FAILING_REGIONS += ", ${regionMap.environment}-${regionMap.region}-c${regionMap.cluster}"
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

                //Slack alerts to teams
                notifyTeams()

                // Delete the reports after being published
                sh "rm -rf results"
            }
        }
       failure {
            script {
                if (FAILING_REGIONS.trim().isEmpty()) {
                    slackSend(channel: "${config.notification.slack_channel}", color: 'danger', message: ":no_smoking: The pipeline ${currentBuild.fullDisplayName} failed due to a pipeline error (<${env.BUILD_URL}|Open>)")
                }
            }
        }

        // failure {
        //     slackSend channel: "${config.notification.slack_channel}", color: 'danger', message: ":no_smoking: The pipeline ${currentBuild.fullDisplayName} failed for ${FAILING_REGIONS} (<${env.BUILD_URL}|Open>)"
        //     script {
        //         if (params.ALLOW_EMAILS) {
        //                 emailext(body: '''${SCRIPT, template="groovy-html.template"}''', mimeType: 'text/html', subject: "${currentBuild.fullDisplayName}", to: "${config.notification.email_list}", attachLog: 'true', attachmentsPattern: 'build.log')
        //         }
        //     }
        // }
        // unstable {
        //     slackSend channel: "${config.notification.slack_channel}", color: 'danger', message: ":no_smoking: The pipeline ${currentBuild.fullDisplayName} has failing tests for ${FAILING_REGIONS} (<${env.BUILD_URL}|Open>)"
        //     script {
        //         if (params.ALLOW_EMAILS) {
        //                 emailext(body: '''${SCRIPT, template="groovy-html.template"}''', mimeType: 'text/html', subject: "${currentBuild.fullDisplayName}", to: "${config.notification.email_list}", attachLog: 'true', attachmentsPattern: 'build.log')
        //         }
        //     }
        // }

        // aborted {
        //     slackSend channel: "${config.notification.slack_channel}", color: 'danger', message: ":no_smoking: The pipeline ${currentBuild.fullDisplayName} was aborted for ${FAILING_REGIONS} (<${env.BUILD_URL}|Open>)"
        // }

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
    String cronLine = "H 9 * * *"
    return cronLine
}

def notifyTeams() {
    def alerts = [:]
    def passiveAlerts = [:]

    config.tests.regions.each { regionMap ->
        if(fileExists("results/${regionMap.environment}-${regionMap.region}-c${regionMap.cluster}-notifications.yaml")) {
            def notifyyaml = loadConfig("results/${regionMap.environment}-${regionMap.region}-c${regionMap.cluster}-notifications.yaml")

            if(notifyyaml.active) {
                notifyyaml.notifications.each { notification ->
                    if(alerts["${notification.channel}"]) {
                        alerts["${notification.channel}"] += "*${regionMap.environment} ${regionMap.region} c${regionMap.cluster} active*\n"
                    } else {
                        alerts["${notification.channel}"] = "*${regionMap.environment} ${regionMap.region} c${regionMap.cluster} active*\n"
                    }
                    
                    notification.suites.each { suite ->
                        alerts["${notification.channel}"] += ">${suite}\n"
                    }
                }
            } else {
                notifyyaml.notifications.each { notification ->
                    if(passiveAlerts["${notification.channel}"]) {
                        passiveAlerts["${notification.channel}"] += "*${regionMap.environment} ${regionMap.region} c${regionMap.cluster} passive*\n"
                    } else {
                        passiveAlerts["${notification.channel}"] = "*${regionMap.environment} ${regionMap.region} c${regionMap.cluster} passive*\n"
                    }
                    
                    notification.suites.each { suite ->
                        passiveAlerts["${notification.channel}"] += ">${suite}\n"
                    }
                }
            }
        }
    }
    
    passiveAlerts.each { chnl, mgs ->
        if (alerts[chnl]) {
            alerts[chnl] += passiveAlerts[chnl]
        } else {
            alerts[chnl] = passiveAlerts[chnl]
        }
    }

    alerts.each { chnl, msg ->
        slackSend channel: "${chnl}", color: 'danger', message: ":no_smoking: The pipeline ${currentBuild.fullDisplayName} failed for ${FAILING_REGIONS} (<${env.BUILD_URL}|Open>)\n${msg}"
    }
}
