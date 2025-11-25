pipeline {
    agent any

    environment {
        // Using relative paths to avoid permission issues
        APP_DIR = "./app"
        PM2_APP = "express-app"
        NODE_ENV = "production"
        // Add Homebrew's Node.js to PATH
        PATH = "/opt/homebrew/opt/node@20/bin:/opt/homebrew/bin:${env.PATH}"
    }

    stages {
        stage('Check Dependencies') {
            steps {
                script {
                    // Check if Node.js is installed
                    def nodeVersion = sh(script: 'node --version || echo "NODE_NOT_FOUND"', returnStdout: true).trim()
                    if (nodeVersion == 'NODE_NOT_FOUND') {
                        error('Node.js is not installed. Please install Node.js on the Jenkins server.')
                    } else {
                        echo "Found Node.js version: ${nodeVersion}"
                    }
                    
                    // Check if npm is installed
                    def npmVersion = sh(script: 'npm --version || echo "NPM_NOT_FOUND"', returnStdout: true).trim()
                    if (npmVersion == 'NPM_NOT_FOUND') {
                        error('npm is not installed. Please install npm on the Jenkins server.')
                    } else {
                        echo "Found npm version: ${npmVersion}"
                    }
                    
                    // Check if PM2 is installed (not required for basic pipeline)
                    def pm2Version = sh(script: 'pm2 --version || echo "PM2_NOT_FOUND"', returnStdout: true).trim()
                    if (pm2Version == 'PM2_NOT_FOUND') {
                        echo 'Warning: PM2 is not installed. The deployment step will be skipped.'
                        env.PM2_AVAILABLE = 'false'
                    } else {
                        echo "Found PM2 version: ${pm2Version}"
                        env.PM2_AVAILABLE = 'true'
                    }
                }
            }
        }
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Install deps') {
      steps {
        sh '''
          set -e
          echo "Installing Node.js dependencies..."
          npm install
        '''
      }
    }

    stage('Test') {
      steps {
        sh '''
          echo "Running tests..."
          npm test
        '''
      }
    }

    stage('Start Application') {
      steps {
        sh '''
          echo "Starting the application..."
          nohup node app.js > app.log 2>&1 &
          echo $! > app.pid
          sleep 5  # Give the app some time to start
          echo "Application started with PID $(cat app.pid)"
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
        when {
            expression { return env.PM2_AVAILABLE == 'true' }
        }
        steps {
            script {
                echo 'Skipping PM2 reload as it is not installed.'
                // Uncomment and modify the following if you want to install PM2 during the build
                // sh 'npm install -g pm2'
                // sh '''
                //   set -e
                //   pm2 describe ${PM2_APP} >/dev/null 2>&1 || pm2 start ${APP_DIR}/ecosystem.config.js --only ${PM2_APP}
                //   pm2 reload ${PM2_APP}
                //   pm2 save
                // '''
            }
        }
    }
  }

  post {
    always {
      script {
        // Stop the application if it's running
        sh '''
          if [ -f app.pid ]; then
            echo "Stopping application..."
            kill $(cat app.pid) || true
            rm -f app.pid
          fi
        '''
        
        // Archive any important files
        archiveArtifacts artifacts: 'app.log', allowEmptyArchive: true
      }
    }
  }
}
