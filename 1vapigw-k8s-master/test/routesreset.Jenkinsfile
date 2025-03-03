pipeline {
    agent any

    stages {
        stage('Revert Argo Changes') {
            matrix {
                axes {
                    axis {
                        name 'REGION'
                        values 'EUW1_C2', 'USE1_C2', 'EUW1_C1', 'USE1_C1'
                    }
                }
                stages {
                    stage('Revert Argocd Target Branch') {
                        environment {
                            KUBE_HOST = credentials("DEV_${REGION}_HOST")
                            AUTHORIZATION_TOKEN = credentials("DEV_${REGION}_TOKEN")
                        }
                        steps {
                            script {
                                sh """
                                    python3 scripts/enable_route_auto_sync.py
                                """
                            }
                        }
                    }    
                }    
            }    
        }
    }
}
