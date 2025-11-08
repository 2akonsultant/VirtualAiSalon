# AWS Quick Start Guide

This is a condensed version of the full deployment guide. Use this for a quick deployment.

## Prerequisites
- AWS Account
- AWS CLI installed and configured
- Node.js 18+ installed

## Fastest Deployment: Elastic Beanstalk

### 1. Install EB CLI
```bash
pip install awsebcli
```

### 2. Initialize and Deploy
```bash
# Initialize
eb init

# Create environment (first time)
eb create salon-production

# Deploy updates
eb deploy
```

### 3. Set Environment Variables
```bash
eb setenv DATABASE_URL="postgresql://..." \
          JWT_SECRET="your-secret" \
          GEMINI_API_KEY="your-key" \
          GOOGLE_CLIENT_ID="your-client-id" \
          EMAIL_USER="your-email" \
          EMAIL_PASSWORD="your-password"
```

### 4. Open Application
```bash
eb open
```

## Alternative: EC2 with PM2

### 1. Launch EC2 Instance
- AMI: Ubuntu 22.04 LTS
- Type: t3.medium
- Security Group: Allow ports 22, 80, 443, 5000

### 2. Connect and Setup
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# Install PM2
sudo npm install -g pm2

# Clone and build
git clone your-repo
cd VirtualAiSalon-main
npm install
npm run build

# Create .env file
nano .env
# Add all environment variables

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Setup Nginx
```bash
sudo nano /etc/nginx/sites-available/salon
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/salon /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Database Setup (RDS)

1. Go to RDS Console → Create Database
2. Select PostgreSQL
3. Choose Free tier or Production
4. Set master username and password
5. Create database
6. Get connection string: `postgresql://user:pass@endpoint:5432/dbname`
7. Update `DATABASE_URL` in environment variables

## Required Environment Variables

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-key
GOOGLE_CLIENT_ID=your-client-id
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Verify Deployment

1. Check health endpoint: `https://your-domain.com/api/health`
2. Test homepage: `https://your-domain.com`
3. Check logs: `eb logs` (Elastic Beanstalk) or `pm2 logs` (EC2)

## Troubleshooting

- **Build fails**: Check Node.js version (18+)
- **Database connection**: Verify security groups and credentials
- **502 error**: Check if app is running on port 5000
- **Environment variables**: Verify all required vars are set

For detailed instructions, see [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)

