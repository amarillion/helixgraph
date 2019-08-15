#!groovy
import groovy.json.JsonSlurper

def branch = env.BRANCH_NAME

node {
	
	catchError {

		stage('CheckOut') {

		   checkout scm

		}

		stage('Build') {

			echo "Running ${env.BUILD_ID} on ${env.JENKINS_URL}."
			docker.image('node:latest').inside() {
				withEnv(['HOME=.']) {
					sh "npm install"
				}
			}
		}

		stage('Lint') {

			docker.image('node:latest').inside() {
				withEnv(['HOME=.']) {
					sh "npm run lint"
				}
			}

		}

		stage('Test') {

			docker.image('node:latest').inside() {
				withEnv(['HOME=.']) {
					sh "npm test"
				}
			}

		}

	}
	
//	mailIfStatusChanged env.EMAIL_RECIPIENTS
	mailIfStatusChanged "mvaniersel@gmail.com"

}


//see: https://github.com/triologygmbh/jenkinsfile/blob/4b-scripted/Jenkinsfile
def mailIfStatusChanged(String recipients) {
    
	// Also send "back to normal" emails. Mailer seems to check build result, but SUCCESS is not set at this point.
    if (currentBuild.currentResult == 'SUCCESS') {
        currentBuild.result = 'SUCCESS'
    }
    step([$class: 'Mailer', recipients: recipients])
}
