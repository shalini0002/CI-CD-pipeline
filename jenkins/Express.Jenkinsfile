pipeline {
    agent any

    environment {
        APP_DIR = "./app"
        PM2_APP = "express-app"
        NODE_ENV = "production"
    }

    tools {
        // This requires NodeJS plugin to be installed
        nodejs 'NodeJS_20'  // Make sure this matches the name in Jenkins Global Tool Configuration
    }

    stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Sync to Server') {
      steps {
        sh '''
          set -e
          mkdir -p ${APP_DIR}
          rsync -av --delete --exclude 'node_modules' --exclude '.git' ./ ${APP_DIR}/
        '''
      }
    }

    stage('Install deps') {
      steps {
        sh '''
          set -e
          cd ${APP_DIR}
          if [ -f package-lock.json ]; then npm ci; else npm install; fi
        '''
      }
    }

    stage('Tests') {
      when { expression { return fileExists('package.json') } }
      steps {
        sh '''
          set -e
          cd ${APP_DIR}
          if npm run | grep -q "^  test$"; then npm test --silent; else echo "No test script, skipping"; fi
        '''
      }
    }

    stage('Build') {
      when { expression { return fileExists('package.json') } }
      steps {
        sh '''
          set -e
          cd ${APP_DIR}
          if npm run | grep -q "^  build$"; then npm run build; else echo "No build script, skipping"; fi
        '''
      }
    }

    stage('Reload PM2') {
      steps {
        sh '''
          set -e
          pm2 describe ${PM2_APP} >/dev/null 2>&1 || pm2 start /home/ubuntu/apps/ecosystem.config.js --only ${PM2_APP}
          pm2 reload ${PM2_APP}
          pm2 save
        '''
      }
    }
  }

  post {
    always {
      sh 'pm2 status || true'
      archiveArtifacts artifacts: '**/build/**', allowEmptyArchive: true
    }
  }
}
