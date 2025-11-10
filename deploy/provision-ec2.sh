#!/usr/bin/env bash
set -euo pipefail

# EC2 provisioning for Flask + Express + PM2 + (optional Nginx) + Jenkins prerequisites

sudo apt-get update -y && sudo apt-get upgrade -y

# Essentials
sudo apt-get install -y build-essential git curl ufw ca-certificates gnupg lsb-release

# Python 3, pip, venv
sudo apt-get install -y python3 python3-venv python3-pip

# Node.js LTS (20.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v && npm -v

# PM2
audit_ret=0 || true
sudo npm install -g pm2
pm2 -v

# Nginx (optional but recommended)
sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# UFW firewall (optional)
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full' # allows 80/443
# If not using Nginx, uncomment the following lines to expose app ports directly
# sudo ufw allow 3000
# sudo ufw allow 5000
sudo ufw --force enable

# Jenkins prerequisites (Java 17)
sudo apt-get install -y fontconfig openjdk-17-jre

echo "Provisioning complete. Next steps: clone your repos into ~/apps and configure PM2 & Jenkins."
