pipeline {
  agent {
    docker {
      image "node:8-alpine"
      args "--network=skynet
    }
  }
  stages {
    stage("Build")
      steps {
        sh "apk add --no-cache mongodb"
        sh "chmod +x ./scripts/dropdb.sh"
        sh "npm install"
      }
    }
    stage("Test") {
      steps{
        sh "npm run test:ci"
      }
    }
  }
}
    
