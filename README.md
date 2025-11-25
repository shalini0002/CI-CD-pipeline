# Flask + Express CI/CD Deployment

## Overview
This project demonstrates a complete CI/CD pipeline for a Flask backend and Express frontend application, deployed on a single EC2 instance using Jenkins for automation.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       User's Browser                        │
└───────────────┬───────────────────────────────────────┬─────┘
                │                                       │
                ▼                                       ▼
┌──────────────────────────┐                ┌──────────────────────────┐
│     Express Frontend     │                │       Flask Backend      │
│     (Port 3000)          │                │      (Port 5000)         │
│     - Serves static      │◄─── API ──────▶│     - Handles API        │
│       files & proxies    │    Requests    │       requests           │
│       API requests       │                │     - Business logic     │
└─────────────┬────────────┘                └──────────────────────────┘
              │
              │
    ┌─────────▼─────────────────────────────┐
    │           Jenkins Pipeline            │
    │  - Listens to GitHub webhooks         │
    │  - Runs tests                         │
    │  - Deploys updates                   │
    └───────────────────────────────────────┘
```

## Prerequisites

### Local Development
- Node.js 20.x
- Python 3.8+
- npm 10.x
- PM2 (for process management)
- Git

### Production (EC2)
- Ubuntu 22.04 LTS
- Node.js 20.x
- Python 3.8+
- PM2
- Nginx (optional, for reverse proxy)
- Jenkins

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd final-devops
   ```

2. **Set up the Flask backend**
   ```bash
   # Create and activate virtual environment
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Start Flask development server
   python flask_app.py
   ```

3. **Set up the Express frontend**
   ```bash
   # Install dependencies
   npm install
   
   # Start Express development server
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## Production Deployment (EC2)

### 1. Provision EC2 Instance
- Launch an Ubuntu 22.04 LTS instance
- Open ports: 22 (SSH), 80 (HTTP), 3000 (Express), 5000 (Flask)
- SSH into the instance

### 2. Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python and pip
sudo apt install -y python3-pip python3-venv

# Install PM2 globally
sudo npm install -g pm2

# Install Jenkins (optional)
wget -q -O - https://pkg.jenkins.io/debian/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb http://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt update
sudo apt install -y jenkins
```

### 3. Deploy the Application
```bash
# Clone the repository
mkdir -p ~/apps && cd ~/apps
git clone <repository-url> final-devops
cd final-devops

# Install dependencies
npm install
pip3 install -r requirements.txt

# Start applications with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Generate startup script
pm2 startup
# Run the generated command to enable PM2 on system boot
```

### 4. Configure Nginx (Optional)
```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/final-devops
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/final-devops /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

## Jenkins Pipeline Setup

1. **Install required plugins**
   - Git
   - NodeJS
   - Pipeline
   - GitHub Integration

2. **Configure Global Tools**
   - Go to Jenkins > Manage Jenkins > Global Tool Configuration
   - Add NodeJS installation (e.g., NodeJS 20.x)

3. **Create a new Pipeline job**
   - Select "Pipeline script from SCM"
   - Enter your repository URL
   - Set the script path to `jenkins/Express.Jenkinsfile`

4. **Set up GitHub Webhook**
   - Go to your GitHub repository > Settings > Webhooks
   - Add webhook URL: `http://<jenkins-server>/github-webhook/`
   - Set content type to `application/json`
   - Select "Just the push event"

## CI/CD Pipeline Stages

1. **Checkout** - Pulls the latest code from the repository
2. **Install Dependencies** - Installs Node.js and Python dependencies
3. **Run Tests** - Executes unit and integration tests
4. **Build** - Builds the frontend assets (if any)
5. **Deploy** - Deploys the application using PM2
6. **Verify** - Runs health checks to ensure the application is running

## Accessing the Application

- **Frontend**: http://your-ec2-public-ip:3000
- **Backend API**: http://your-ec2-public-ip:5000/api
- **Jenkins Dashboard**: http://your-ec2-public-ip:8080

## Monitoring and Maintenance

### View Logs
```bash
# View PM2 logs
pm2 logs

# View specific application logs
pm2 logs express-app
pm2 logs flask-app
```

### Restart Services
```bash
# Restart all applications
pm2 restart all

# Restart specific application
pm2 restart express-app
pm2 restart flask-app
```

### Update the Application
```bash
# Pull the latest changes
git pull

# Install/update dependencies
npm install
pip install -r requirements.txt

# Restart applications
pm2 restart all
```

## Troubleshooting

### Application Not Starting
- Check PM2 logs: `pm2 logs`
- Verify ports are open: `sudo netstat -tuln | grep -E '3000|5000'`
- Check if processes are running: `pm2 status`

### Jenkins Build Failing
- Check Jenkins console output
- Verify all required plugins are installed
- Ensure proper permissions for the Jenkins user

### Nginx 502 Bad Gateway
- Check if the application is running: `pm2 status`
- Verify Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- Check if the proxy_pass URL in Nginx config is correct
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
