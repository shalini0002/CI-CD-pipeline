# Flask + Express on EC2 with Jenkins CI/CD

## Overview
This repository contains deployment scripts, PM2 config, Nginx config, and Jenkins pipeline definitions to deploy a Flask backend and an Express frontend on a single Amazon EC2 instance with CI/CD via Jenkins.

Replace placeholders (like repository URLs) with your actual values.

## Architecture
- EC2 (Ubuntu 22.04) runs:
  - Express on port 3000 via PM2
  - Flask via Gunicorn on port 5000 via PM2
  - Nginx reverse proxy on port 80
- Jenkins on the same EC2 (or separate) triggers deployments from GitHub webhooks.

## Repo layout (this repo)
- deploy/
  - provision-ec2.sh
  - ecosystem.config.js
  - nginx-apps.conf
- jenkins/
  - Flask.Jenkinsfile
  - Express.Jenkinsfile

## Prerequisites
- AWS EC2 Ubuntu 22.04 with security group allowing 22, 80 (and optionally 3000, 5000)
- DNS (optional)
- Two GitHub repositories:
  - Flask: https://github.com/<org>/<flask-repo>
  - Express: https://github.com/<org>/<express-repo>

## 1) Provision EC2
SSH to the instance as ubuntu and run:

```bash
bash deploy/provision-ec2.sh
```

If you use Nginx, copy the site config and reload:

```bash
sudo cp deploy/nginx-apps.conf /etc/nginx/sites-available/apps
sudo ln -sf /etc/nginx/sites-available/apps /etc/nginx/sites-enabled/apps
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## 2) Clone application repos
```bash
mkdir -p ~/apps && cd ~/apps
# Replace with your repos
git clone https://github.com/<org>/<flask-repo>.git flask-app
git clone https://github.com/<org>/<express-repo>.git express-app
```

## 3) Install app dependencies
```bash
# Flask
cd ~/apps/flask-app
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt || true
pip install gunicorn
deactivate

# Express
cd ~/apps/express-app
npm ci || npm install
```

Ensure your apps bind to 0.0.0.0
- Flask (gunicorn): `gunicorn -b 0.0.0.0:5000 app:app`
- Express: `app.listen(process.env.PORT || 3000, '0.0.0.0')`

## 4) PM2 process manager
```bash
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu
# Follow the printed sudo command if shown, then re-run pm2 save
```

## 5) Jenkins install
Run on EC2:
```bash
sudo apt-get update -y
sudo apt-get install -y fontconfig openjdk-17-jre
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y jenkins
sudo systemctl enable jenkins && sudo systemctl start jenkins
```
Open port 8080 in the security group or proxy via Nginx. Retrieve `initialAdminPassword` and finish setup. Install plugins: Git, NodeJS, Pipeline, (optional) Python.

Configure Global Tools: NodeJS 20 and JDK 17.

## 6) Jenkins pipelines
Commit the corresponding Jenkinsfile into each app repo root:
- Flask repo: use `jenkins/Flask.Jenkinsfile`
- Express repo: use `jenkins/Express.Jenkinsfile`

Create Pipeline jobs that pull from each repo and point to the Jenkinsfile path.

## 7) GitHub webhooks
In GitHub repo Settings → Webhooks → Add webhook:
- Payload URL: `http://<JENKINS_HOST>:8080/github-webhook/`
- Content type: `application/json`
- Event: Just the push event
Enable “Build when a change is pushed to GitHub” in Jenkins.

## Verification
- http://<EC2_IP>/ → Express
- http://<EC2_IP>/api/ → Flask
- `pm2 status` shows `express-app` and `flask-app` online
- Jenkins pipelines succeed and logs show PM2 reload

## Screenshots to capture
- EC2 console with running instance
- Browser: `/` (Express) and `/api/` (Flask)
- Jenkins console logs with successful build/deploy
