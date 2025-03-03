@Library('jenkins-commons')
import utils.FileHandler
import config.ConfigLoader

node {
    checkout scm
    serviceParams = []
    configFile = "jenkins-config/${getActiveEnvironment(this)}.yaml"
    config = loadConfig(configFile)
    
    serviceParams.addAll([
        booleanParam(name: 'RELOAD_PARAMS', defaultValue: false, description: 'If selected, will reload the params without executing the pipeline stages. Useful when you change the config files.'),
        string(defaultValue: 'master', name: 'TEST_BRANCH', description: 'Service for which the tests need to be run. It allows partial name since it checks for contains. Leaving it empty will run all tests'),
        string(defaultValue: '', name: 'SERVICE', description: 'Service for which the tests need to be run. It allows partial name since it checks for contains. Leaving it empty will run all tests'),
        string(defaultValue: '', name: 'SLACKCHANNEL', description: 'slack channel you want failure alerts sent to else leave empty.'),
        booleanParam(name: 'cluster1', defaultValue: true, description: 'select to run tests on cluster 1'),
        booleanParam(name: 'cluster2', defaultValue: true, description: 'select to run tests on cluster 2'),
    ])
    properties([[$class: 'RebuildSettings', autoRebuild: false, rebuildDisabled: false], parameters(serviceParams)])
}

pipeline {
    agent any

    environment {
        FAILING_REGIONS = ' '
    }

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        durabilityHint('PERFORMANCE_OPTIMIZED')
        timeout(time: 15, unit: 'MINUTES')
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
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: "${TEST_BRANCH}"]],
                        doGenerateSubmoduleConfigurations: false,
                        extensions: [],
                        submoduleCfg: [],
                        userRemoteConfigs: [
                            [
                                credentialsId: 'global/api-gw/jenkins/api-gw-github-vonageorg',
                                url: 'https://github.com/Vonage/1vapigw-k8s'
                            ]
                        ]
                    ])
                    sh(script: "npm ci")
                    
                    sh(script: """
                        ./utils/fetch_secrets.sh
                    """)

                    config.tests.regions.each { regionMap ->
                        if((regionMap.cluster == 1 && params.cluster1) || (regionMap.cluster == 2 && params.cluster2)) {
                            parallelSteps[regionMap] = {
                                echo "Running sanity-parallel ${regionMap.environment} ${regionMap.region} ${regionMap.cluster} true '' ${SERVICE}"
                                def isTestSuccessful = sh(returnStatus: true, script: """
                                    export CI=true
                                    ./utils/run-tests.sh ${regionMap.environment} ${regionMap.region} ${regionMap.cluster} false '' ${SERVICE}
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

                notifyTeams()

                // Delete the reports after being published
                sh "rm -rf results"
            }
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

    if(params.SLACKCHANNEL && alerts[config.notification.slack_channel]) {
        slackSend channel: "${params.SLACKCHANNEL}", color: 'danger', message: ":no_smoking: The pipeline ${currentBuild.fullDisplayName} failed for ${SERVICE} in ${FAILING_REGIONS} (<${env.BUILD_URL}|Open>)\n${alerts[config.notification.slack_channel]}"
    }
}
