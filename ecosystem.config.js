module.exports = {
  apps: [
    {
      name: 'express-app',
      script: 'app.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        FLASK_API: 'http://localhost:5000'
      }
    },
    {
      name: 'flask-app',
      script: 'flask_app.py',
      interpreter: 'python3',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        FLASK_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
