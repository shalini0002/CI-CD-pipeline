pipeline {
  agent any

  environment {
    APP_DIR = "/home/ubuntu/apps/flask-app"
    VENV = "${APP_DIR}/.venv"
    PM2_APP = "flask-app"
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
          rsync -av --delete --exclude '.venv' --exclude '.git' ./ ${APP_DIR}/
        '''
      }
    }

    stage('Install Python deps') {
      steps {
        sh '''
          set -e
          cd ${APP_DIR}
          if [ ! -d "${VENV}" ]; then
            python3 -m venv ${VENV}
          fi
          . ${VENV}/bin/activate
          pip install --upgrade pip
          if [ -f requirements.txt ]; then
            pip install -r requirements.txt
          fi
          pip show gunicorn >/dev/null 2>&1 || pip install gunicorn
        '''
      }
    }

    stage('Tests') {
      when { expression { return fileExists('tests') || fileExists('pytest.ini') } }
      steps {
        sh '''
          set -e
          cd ${APP_DIR}
          . ${VENV}/bin/activate
          if [ -f requirements-dev.txt ]; then pip install -r requirements-dev.txt; fi
          if command -v pytest >/dev/null 2>&1; then pytest -q; else echo "pytest not found, skipping"; fi
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
      archiveArtifacts artifacts: '**/gunicorn*', allowEmptyArchive: true
    }
  }
}
