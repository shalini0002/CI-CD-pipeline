module.exports = {
  apps: [
    {
      name: "flask-app",
      cwd: "/home/ubuntu/apps/flask-app",
      script: "/home/ubuntu/apps/flask-app/.venv/bin/gunicorn",
      args: "-b 0.0.0.0:5000 app:app",
      env: {
        PYTHONUNBUFFERED: "1"
      }
    },
    {
      name: "express-app",
      cwd: "/home/ubuntu/apps/express-app",
      script: "npm",
      args: "start",
      env: {
        PORT: "3000",
        NODE_ENV: "production"
      }
    }
  ]
}
