pipeline {
    agent any

    parameters {
       choice(name: 'ENVIRONMENT', choices: ['Dev'], description: 'Select the environment')
       choice(name: 'REGION', choices: ['USE1_C1', 'USE1_C2', 'EUW1_C1', 'EUW1_C2'], description: 'Select the Region and cluster to test your routes')
       string(name: 'ARGO_APP_NAME', defaultValue: '', description: 'Enter Route name')
       string(name: 'TARGET_BRANCH', defaultValue: '', description: 'Enter Target branch name') 
    }

    environment {
        GH_TOKEN = credentials('GH_PAT')
        KUBE_HOST = credentials("DEV_${params.REGION}_HOST")
        AUTHORIZATION_TOKEN = credentials("DEV_${params.REGION}_TOKEN")
    }

    stages {
        stage('Validate Target Branch') {
            steps {
                script {
                    echo 'Validating remote branch in 1vapigw-routes repository'
                    def branchName = params.TARGET_BRANCH
    
                    sh "git remote add routes https://github.com/Vonage/1vapigw-routes"
                    sh "git fetch routes"

                    def result = sh(script: "git ls-remote --exit-code routes https://github.com/Vonage/1vapigw-routes ${branchName}", returnStatus: true)
                    sh "git remote remove routes"
                    if (result != 0) {
                        error "Branch ${branchName} not found"
                    } else {
                        echo "Branch ${branchName} exists"
                    }
                    if (sh(script: "python3 scripts/is_used_route.py ${params.ARGO_APP_NAME}", returnStatus: true) == 0) {
                        error "Input route is already being used by another for testing"
                    }
                }
            }
        }
        stage('Switching Argocd Target Branch') {
            steps {
                echo "Switching Argocd target branch for ${params.ARGO_APP_NAME}"
                script {
                    sh "python3 scripts/argo_route_target_update.py ${params.TARGET_BRANCH} ${params.ARGO_APP_NAME}"
                }
            }
        }
    }
}
