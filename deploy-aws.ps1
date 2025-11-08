# AWS Deployment Script for Virtual AI Salon (PowerShell)
# This script helps automate the deployment process

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting AWS Deployment Process..." -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Warning: .env file not found" -ForegroundColor Yellow
    $continue = Read-Host "Please create a .env file with all required environment variables. Continue anyway? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

# Build the application
Write-Host "📦 Building application..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Check deployment method
Write-Host ""
Write-Host "Select deployment method:"
Write-Host "1) AWS Elastic Beanstalk"
Write-Host "2) Docker (for ECS/Fargate)"
Write-Host "3) Manual (EC2)"
$choice = Read-Host "Enter choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host "Deploying to Elastic Beanstalk..." -ForegroundColor Green
        if (Get-Command eb -ErrorAction SilentlyContinue) {
            eb deploy
        } else {
            Write-Host "❌ EB CLI not installed. Install with: pip install awsebcli" -ForegroundColor Red
            exit 1
        }
    }
    "2" {
        Write-Host "Building Docker image..." -ForegroundColor Green
        if (Get-Command docker -ErrorAction SilentlyContinue) {
            $ecrUri = Read-Host "Enter ECR repository URI"
            docker build -t virtual-ai-salon .
            docker tag virtual-ai-salon:latest "${ecrUri}:latest"
            $region = Read-Host "Enter AWS region (default: us-east-1)"
            if ([string]::IsNullOrWhiteSpace($region)) { $region = "us-east-1" }
            aws ecr get-login-password --region $region | docker login --username AWS --password-stdin $ecrUri
            docker push "${ecrUri}:latest"
            Write-Host "✅ Docker image pushed to ECR!" -ForegroundColor Green
        } else {
            Write-Host "❌ Docker not installed" -ForegroundColor Red
            exit 1
        }
    }
    "3" {
        Write-Host "Manual deployment selected" -ForegroundColor Yellow
        Write-Host "Please follow the EC2 deployment steps in AWS_DEPLOYMENT_GUIDE.md"
        Write-Host ""
        Write-Host "Quick commands:"
        Write-Host "  - Build: npm run build"
        Write-Host "  - Start with PM2: pm2 start ecosystem.config.js"
        Write-Host "  - View logs: pm2 logs"
    }
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🎉 Deployment process completed!" -ForegroundColor Green

