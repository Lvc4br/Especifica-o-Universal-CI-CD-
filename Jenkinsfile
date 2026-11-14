pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/powershell:7.4-ubuntu-22.04'
        }
    }
    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
    }
    stages {
        stage('Initialize') {
            steps { sh 'pwsh ./cicd.ps1 init -ProjectPath "$WORKSPACE"' }
        }
        stage('Validate configuration') {
            steps { sh 'pwsh ./cicd.ps1 validate-config -ProjectPath "$WORKSPACE"' }
        }
        stage('Plan') {
            steps { sh 'pwsh ./cicd.ps1 plan -ProjectPath "$WORKSPACE"' }
        }
        stage('Approve and execute') {
            steps {
                input message: 'Review the pipeline plan and authorize project commands?'
                sh 'pwsh ./cicd.ps1 run -ProjectPath "$WORKSPACE" -Approve -TimeoutSeconds 1800'
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: '.cicd/reports/**,.cicd/artifacts/**', allowEmptyArchive: true
        }
    }
}
