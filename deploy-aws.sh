#!/bin/bash

# AWS Deployment Script for Virtual AI Salon
# This script helps automate the deployment process

set -e

echo "🚀 Starting AWS Deployment Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
    echo "Please create a .env file with all required environment variables"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build the application
echo -e "${GREEN}📦 Building application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"

# Check deployment method
echo ""
echo "Select deployment method:"
echo "1) AWS Elastic Beanstalk"
echo "2) Docker (for ECS/Fargate)"
echo "3) Manual (EC2)"
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo -e "${GREEN}Deploying to Elastic Beanstalk...${NC}"
        if command -v eb &> /dev/null; then
            eb deploy
        else
            echo -e "${RED}EB CLI not installed. Install with: pip install awsebcli${NC}"
            exit 1
        fi
        ;;
    2)
        echo -e "${GREEN}Building Docker image...${NC}"
        if command -v docker &> /dev/null; then
            read -p "Enter ECR repository URI: " ecr_uri
            docker build -t virtual-ai-salon .
            docker tag virtual-ai-salon:latest $ecr_uri:latest
            aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ecr_uri
            docker push $ecr_uri:latest
            echo -e "${GREEN}✅ Docker image pushed to ECR!${NC}"
        else
            echo -e "${RED}Docker not installed${NC}"
            exit 1
        fi
        ;;
    3)
        echo -e "${YELLOW}Manual deployment selected${NC}"
        echo "Please follow the EC2 deployment steps in AWS_DEPLOYMENT_GUIDE.md"
        echo ""
        echo "Quick commands:"
        echo "  - Build: npm run build"
        echo "  - Start with PM2: pm2 start ecosystem.config.js"
        echo "  - View logs: pm2 logs"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Deployment process completed!${NC}"

