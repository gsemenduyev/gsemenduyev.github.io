def BRANCH_NAME = 'master'

pipeline {
    options {
        ansiColor('xterm')
    }
    agent {
        docker {
            label 'al2'
            image 'cypress/browsers:node18.12.0-chrome107'
            args '--ipc=host'
        }
    }
    triggers {
        cron("0 9 8-14 * 0")
    }
    stages {
        stage('Clone Repository') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'sabuildserver_GIT_PAT', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD')]) {
                        def githubReport = "https://${GIT_USERNAME}:${GIT_PASSWORD}@github.freewheel.tv/gsemenduyev/gsemenduyev.github.io.git"
                        env.GITHUB_USERNAME = "${GIT_USERNAME}"
                        git url: githubReport, branch: "${BRANCH_NAME}", changelog: false, poll: false
                    }
                }
            }
        }
        stage('Delete old reports') {
            steps {
                sh 'node delete-old-reports.js'
            }
        }    
        stage('Publish updated reports') {
            steps {
                sh "git config user.name \"${env.GITHUB_USERNAME}\""
                sh "git config user.email \"${env.GITHUB_USERNAME}@freewheel.com\""
                sh 'git add .'
                sh 'git commit -m "Add multi-html-report and report link"'
                sh "git push origin ${BRANCH_NAME}"
            }
        }       
    }
    post {
        always {
            cleanWs()
        }
    }
}