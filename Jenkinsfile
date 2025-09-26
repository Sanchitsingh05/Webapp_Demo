pipeline {
  agent { label 'docker-node' }

  environment {
    IMAGE_NAME = "todo-dashboard"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        echo "Branch: ${env.BRANCH_NAME}"
      }
    }

    stage('Install') {
      steps {
        sh 'node --version || true'
        sh 'npm ci'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Docker: build') {
      steps {
        sh "docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} ."
      }
    }

    stage('Docker: (optional) push') {
      when {
        expression { return false } // Change to true to enable pushing
      }
      steps {
        // Add docker login and push steps here if you want to publish image to a registry
        echo "Skipping Docker push stage"
      }
    }
  }

  post {
    success {
      echo "Build succeeded"
      // Example: post a comment to Jira issue extracted from branch name
      script {
        def m = (env.BRANCH_NAME =~ /([A-Z]+-\d+)/)
        if (m) {
          def issue = m[0][1]
          withCredentials([
            string(credentialsId: 'JIRA_API_TOKEN', variable: 'JIRA_API_TOKEN'),
            string(credentialsId: 'JIRA_USER_EMAIL', variable: 'JIRA_USER_EMAIL')
          ]) {
            sh """
              curl -s -u ${JIRA_USER_EMAIL}:${JIRA_API_TOKEN} \\
              -X POST -H 'Content-Type: application/json' \\
              ${JIRA_BASE_URL:-'https://your-domain.atlassian.net'}/rest/api/3/issue/${issue}/comment \\
              -d '{\"body\": \"Jenkins build ${env.BUILD_NUMBER} succeeded: ${env.BUILD_URL}\"}' || true
            """
          }
        }
      }
    }

    failure {
      echo "Build failed"
    }
  }
}
