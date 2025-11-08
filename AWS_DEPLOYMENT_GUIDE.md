# AWS Deployment Guide for Virtual AI Salon

This guide covers multiple deployment options for deploying your Virtual AI Salon application to Amazon Web Services (AWS).

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Option 1: AWS Elastic Beanstalk (Recommended for Beginners)](#option-1-aws-elastic-beanstalk)
4. [Option 2: AWS EC2 with PM2](#option-2-aws-ec2-with-pm2)
5. [Option 3: AWS ECS/Fargate (Containerized)](#option-3-aws-ecsfargate-containerized)
6. [Option 4: AWS Amplify + Lambda](#option-4-aws-amplify--lambda)
7. [Database Setup (RDS PostgreSQL)](#database-setup-rds-postgresql)
8. [Environment Variables](#environment-variables)
9. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Node.js 18+ installed locally
- Git installed
- Basic knowledge of AWS services

### Install AWS CLI
```bash
# Windows (PowerShell)
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### Configure AWS CLI
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter default region (e.g., us-east-1)
# Enter default output format (json)
```

---

## Architecture Overview

Your application consists of:
- **Frontend**: React + Vite (static files)
- **Backend**: Express.js + TypeScript (Node.js server)
- **Database**: PostgreSQL (needs RDS or external service)
- **Optional**: Python voice/AI services

---

## Option 1: AWS Elastic Beanstalk (Recommended for Beginners)

Elastic Beanstalk is the easiest way to deploy Node.js applications to AWS.

### Step 1: Install EB CLI
```bash
pip install awsebcli
```

### Step 2: Initialize Elastic Beanstalk
```bash
cd "E:\Salon Booking\temp\VirtualAiSalon-main"
eb init
```

**Configuration:**
- Select region (e.g., `us-east-1`)
- Select application type: `Node.js`
- Select Node.js version: `18` or `20`
- Set up SSH: `Yes` (recommended)
- Select key pair or create new one

### Step 3: Create `.ebextensions` Configuration

Create directory and configuration file:
```bash
mkdir .ebextensions
```

Create `.ebextensions/nodecommand.config`:
```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    PORT: 8080
```

Create `.ebextensions/01_environment.config`:
```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    DATABASE_URL: "postgresql://user:password@your-rds-endpoint:5432/salon_db"
    JWT_SECRET: "your-jwt-secret-key-here"
    GEMINI_API_KEY: "your-gemini-api-key"
    GOOGLE_CLIENT_ID: "your-google-client-id"
    EMAIL_USER: "your-email@gmail.com"
    EMAIL_PASSWORD: "your-app-password"
    OPENAI_API_KEY: "your-openai-api-key"
    # Add other environment variables as needed
```

### Step 4: Create `Procfile` (if not exists)
```bash
echo "web: npm start" > Procfile
```

### Step 5: Update `package.json` Start Script
Ensure your `package.json` has:
```json
{
  "scripts": {
    "start": "cross-env NODE_ENV=production node dist/index.js"
  }
}
```

### Step 6: Build and Deploy
```bash
# Build the application
npm run build

# Create environment
eb create salon-production

# Or deploy to existing environment
eb deploy
```

### Step 7: Set Environment Variables
```bash
eb setenv DATABASE_URL="postgresql://user:pass@host:5432/db" \
          JWT_SECRET="your-secret" \
          GEMINI_API_KEY="your-key"
```

### Step 8: Open Application
```bash
eb open
```

---

## Option 2: AWS EC2 with PM2

This gives you full control over the server.

### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. **AMI**: Amazon Linux 2023 or Ubuntu 22.04 LTS
3. **Instance Type**: t3.medium or larger (2 vCPU, 4 GB RAM minimum)
4. **Key Pair**: Create or select existing
5. **Security Group**: 
   - Allow HTTP (port 80)
   - Allow HTTPS (port 443)
   - Allow SSH (port 22)
   - Allow custom TCP (port 5000) for Node.js
6. **Storage**: 20 GB minimum
7. Launch instance

### Step 2: Connect to EC2 Instance
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
# For Ubuntu: ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 3: Install Dependencies on EC2

**For Amazon Linux:**
```bash
# Update system
sudo yum update -y

# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install Git
sudo yum install -y git

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx (for reverse proxy)
sudo yum install -y nginx
```

**For Ubuntu:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install -y git

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### Step 4: Clone and Setup Application
```bash
# Clone your repository (or upload files)
git clone your-repo-url
cd VirtualAiSalon-main

# Install dependencies
npm install

# Build the application
npm run build
```

### Step 5: Create Environment File
```bash
nano .env
```

Add all environment variables:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@your-rds-endpoint:5432/salon_db
JWT_SECRET=your-jwt-secret-key-here
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_CLIENT_ID=your-google-client-id
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
OPENAI_API_KEY=your-openai-api-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_FROM_NUMBER=your-twilio-number
```

### Step 6: Setup PM2
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'virtual-ai-salon',
    script: 'dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
```

```bash
# Create logs directory
mkdir logs

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions shown
```

### Step 7: Configure Nginx Reverse Proxy
```bash
sudo nano /etc/nginx/conf.d/virtual-ai-salon.conf
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Test Nginx configuration
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 8: Setup SSL with Let's Encrypt (Optional but Recommended)
```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx
# For Ubuntu: sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is set up automatically
```

---

## Option 3: AWS ECS/Fargate (Containerized)

This option uses Docker containers for deployment.

### Step 1: Create Dockerfile

Create `Dockerfile` in root directory:
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci
RUN cd client && npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/client/public ./client/public

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "dist/index.js"]
```

### Step 2: Create `.dockerignore`
```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
.DS_Store
*.log
dist
client/dist
client/node_modules
```

### Step 3: Build and Push Docker Image

```bash
# Install Docker Desktop or Docker Engine

# Build image
docker build -t virtual-ai-salon .

# Tag for ECR
docker tag virtual-ai-salon:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/virtual-ai-salon:latest

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account-id.dkr.ecr.us-east-1.amazonaws.com

# Create ECR repository
aws ecr create-repository --repository-name virtual-ai-salon --region us-east-1

# Push image
docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/virtual-ai-salon:latest
```

### Step 4: Create ECS Task Definition

1. Go to ECS → Task Definitions → Create new
2. Configure:
   - **Task Definition Name**: virtual-ai-salon
   - **Container Name**: salon-app
   - **Image**: your-account-id.dkr.ecr.us-east-1.amazonaws.com/virtual-ai-salon:latest
   - **Port Mappings**: 5000
   - **Environment Variables**: Add all required env vars
   - **Memory**: 1024 MB
   - **CPU**: 512

### Step 5: Create ECS Cluster and Service

1. Create ECS Cluster (Fargate)
2. Create Service:
   - **Task Definition**: virtual-ai-salon
   - **Service Name**: salon-service
   - **Number of tasks**: 2
   - **Load Balancer**: Application Load Balancer
   - **Health Check**: /api/health (if available)

---

## Option 4: AWS Amplify + Lambda

Separate frontend and backend deployment.

### Frontend (Amplify)

1. Go to AWS Amplify Console
2. Connect repository (GitHub, GitLab, etc.)
3. Build settings (auto-detected):
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd client
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: client/dist
    files:
      - '**/*'
  cache:
    paths:
      - client/node_modules/**/*
```

### Backend (Lambda + API Gateway)

1. Use AWS SAM or Serverless Framework
2. Create Lambda functions for API endpoints
3. Setup API Gateway
4. Configure environment variables in Lambda

---

## Database Setup (RDS PostgreSQL)

### Step 1: Create RDS PostgreSQL Instance

1. Go to RDS Console → Create Database
2. **Engine**: PostgreSQL
3. **Version**: 15.x or 16.x
4. **Template**: Free tier (for testing) or Production
5. **DB Instance Identifier**: salon-db
6. **Master Username**: admin (or your choice)
7. **Master Password**: Strong password
8. **Instance Class**: db.t3.micro (free tier) or db.t3.small
9. **Storage**: 20 GB
10. **VPC**: Default or create new
11. **Public Access**: Yes (or configure VPC security)
12. **Security Group**: Allow PostgreSQL (port 5432) from your application

### Step 2: Get Connection String
```
postgresql://username:password@your-rds-endpoint.region.rds.amazonaws.com:5432/salon_db
```

### Step 3: Run Migrations
```bash
# On your local machine or EC2 instance
export DATABASE_URL="postgresql://..."
npm run db:push
```

---

## Environment Variables

Create a `.env` file or set in your deployment platform:

```env
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
GOOGLE_CLIENT_ID=your-google-oauth-client-id

# AI Services
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# SMS/Voice (Optional)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_FROM_NUMBER=+1234567890

# Text Local (Optional)
TEXTLOCAL_API_KEY=your-textlocal-key
TEXTLOCAL_SENDER=GLAMOR

# MSG91 (Optional)
MSG91_API_KEY=your-msg91-key
MSG91_SENDER_ID=GLAMOR
MSG91_TEMPLATE_ID=your-template-id
```

---

## Post-Deployment Checklist

- [ ] Database connection working
- [ ] Environment variables set correctly
- [ ] Application builds successfully
- [ ] Frontend assets loading
- [ ] API endpoints responding
- [ ] SSL certificate installed (HTTPS)
- [ ] Domain name configured
- [ ] Health checks passing
- [ ] Logs accessible
- [ ] Monitoring set up (CloudWatch)
- [ ] Backup strategy configured
- [ ] Security groups configured correctly
- [ ] CORS settings verified
- [ ] QR code URL updated to production domain

---

## Monitoring and Logs

### CloudWatch Logs
- View application logs in CloudWatch
- Set up log groups for your application
- Configure log retention

### PM2 Monitoring (EC2)
```bash
pm2 monit
pm2 logs
```

### Health Check Endpoint
Add to your `server/routes.ts`:
```typescript
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

---

## Troubleshooting

### Application won't start
- Check environment variables
- Verify database connection
- Check port availability
- Review application logs

### Database connection issues
- Verify security group allows PostgreSQL port
- Check database endpoint and credentials
- Ensure database is publicly accessible (or in same VPC)

### Build failures
- Check Node.js version (18+)
- Verify all dependencies installed
- Check for TypeScript errors

### 502 Bad Gateway (Nginx)
- Check if Node.js app is running
- Verify proxy_pass URL
- Check application logs

---

## Cost Estimation

**Free Tier (12 months):**
- EC2 t2.micro: 750 hours/month
- RDS db.t2.micro: 750 hours/month
- S3: 5 GB storage

**Estimated Monthly Cost (After Free Tier):**
- EC2 t3.medium: ~$30/month
- RDS db.t3.small: ~$25/month
- Data transfer: ~$10/month
- **Total: ~$65/month**

---

## Security Best Practices

1. **Never commit `.env` files** to Git
2. Use **AWS Secrets Manager** for sensitive data
3. Enable **HTTPS/SSL** for all traffic
4. Configure **Security Groups** restrictively
5. Use **IAM roles** instead of access keys when possible
6. Enable **RDS encryption** at rest
7. Regular **security updates** on EC2 instances
8. Use **WAF** (Web Application Firewall) for production

---

## Additional Resources

- [AWS Elastic Beanstalk Documentation](https://docs.aws.amazon.com/elasticbeanstalk/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## Support

For issues specific to this application, check:
- Application logs
- AWS CloudWatch logs
- PM2 logs (if using EC2)
- Database connection logs

For AWS-specific issues, refer to AWS documentation or AWS Support.

