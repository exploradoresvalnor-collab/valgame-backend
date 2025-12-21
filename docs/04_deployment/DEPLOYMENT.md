# 🚀 DEPLOYMENT - GUÍA DE DEPLOYMENT

**Documentación completa de deployment en AWS**

---

## 📋 TABLA DE CONTENIDOS

1. [Prerequisites](#prerequisites)
2. [Configuración](#configuración)
3. [AWS Setup](#aws-setup)
4. [Docker](#docker)
5. [CI/CD](#cicd)
6. [Monitoreo](#monitoreo)

---

## 📋 PREREQUISITES {#prerequisites}

```bash
Requerido:
□ AWS Account
□ Docker installed locally
□ Node.js 18+
□ MongoDB Atlas account
□ Git

Tools:
□ AWS CLI v2
□ Docker Desktop
□ Postman (testing)
```

---

## ⚙️ CONFIGURACIÓN {#configuración}

### **Environment Production**
```bash
NODE_ENV=production
API_URL=https://api.valgame.com
API_PORT=8080

# Database
MONGODB_URI=mongodb+srv://user:pass@prod-cluster...

# Auth
JWT_SECRET=your_long_secret_key
JWT_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@valgame.com
SMTP_PASS=app_password

# Payment
STRIPE_SECRET_KEY=sk_live_...
RPC_URL=https://mainnet.infura.io/v3/...

# Storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=valgame-prod

# Monitoring
SENTRY_DSN=https://...
DATADOG_API_KEY=...
```

---

## ☁️ AWS SETUP {#aws-setup}

### **Opción 1: EC2 (Tradicional)**

```bash
1. Launch EC2 Instance
   - AMI: Ubuntu 22.04 LTS
   - Type: t3.medium (8 GB RAM)
   - Storage: 50 GB

2. Security Group (inbound)
   - Port 22 (SSH) - Your IP only
   - Port 80 (HTTP) - 0.0.0.0
   - Port 443 (HTTPS) - 0.0.0.0
   - Port 8080 (App) - Internal only

3. Install en servidor
   ssh ubuntu@your-instance-ip
   
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y nodejs npm docker.io git
   
   sudo usermod -aG docker ubuntu
   
4. Clone repo
   git clone https://github.com/your-repo/valgame-backend
   cd valgame-backend
   
5. Setup
   npm install
   cp .env.example .env
   # Editar .env con valores production
   
6. Run
   npm run build
   npm run start
```

### **Opción 2: ECS (Containers)**

```bash
1. Create ECR Repository
   aws ecr create-repository --repository-name valgame-backend

2. Build & push Docker image
   docker build -t valgame-backend:latest .
   docker tag valgame-backend:latest your-account.dkr.ecr.us-east-1.amazonaws.com/valgame-backend:latest
   
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
   
   docker push your-account.dkr.ecr.us-east-1.amazonaws.com/valgame-backend:latest

3. Create ECS Cluster
   AWS Console → ECS → Create Cluster

4. Create Task Definition
   Container name: valgame-backend
   Image: your-account.dkr.ecr.us-east-1.amazonaws.com/valgame-backend:latest
   Memory: 512 MB
   CPU: 256

5. Create Service
   ECS Service → Use Task Definition
   Desired count: 2 (auto-scaling)
```

### **Opción 3: Elastic Beanstalk (Easiest)**

```bash
1. Install EB CLI
   pip install awsebcli

2. Init project
   eb init -p node.js-18 valgame-backend

3. Create environment
   eb create valgame-prod

4. Deploy
   eb deploy

5. Monitorar
   eb logs
   eb health
```

---

## 🐳 DOCKER {#docker}

### **Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
```

### **docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=valgame

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mongodb_data:
```

---

## 🔄 CI/CD {#cicd}

### **GitHub Actions**
```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint
      run: npm run lint
    
    - name: Build
      run: npm run build
    
    - name: Run tests
      run: npm run test
    
    - name: Build Docker image
      run: |
        docker build -t valgame-backend:${{ github.sha }} .
        docker tag valgame-backend:${{ github.sha }} valgame-backend:latest
    
    - name: Push to ECR
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      run: |
        aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${{ secrets.AWS_ACCOUNT }}.dkr.ecr.us-east-1.amazonaws.com
        docker push ${{ secrets.AWS_ACCOUNT }}.dkr.ecr.us-east-1.amazonaws.com/valgame-backend:latest
    
    - name: Deploy to ECS
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      run: |
        aws ecs update-service --cluster valgame-prod --service valgame-backend-service --force-new-deployment
```

---

## 📊 MONITOREO {#monitoreo}

### **CloudWatch**
```bash
# Crear log group
aws logs create-log-group --log-group-name /aws/ecs/valgame

# Ver logs
aws logs tail /aws/ecs/valgame --follow
```

### **Sentry (Error Tracking)**
```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### **Datadog (APM)**
```javascript
const tracer = require('dd-trace').init();

// Automático tracking de:
// - HTTP requests
// - Database queries
// - Errors
```

---

## ✅ CHECKLIST PRE-DEPLOYMENT

- [ ] Tests pasando (npm run test)
- [ ] Build sin errores (npm run build)
- [ ] Linting limpio (npm run lint)
- [ ] .env.production configurado
- [ ] Database backups
- [ ] SSL/TLS certificate (Let's Encrypt)
- [ ] CloudFlare CDN
- [ ] AWS security groups
- [ ] Monitoring habilitado
- [ ] Error tracking (Sentry)
- [ ] Log aggregation
- [ ] Auto-scaling configurado
- [ ] Load balancer
- [ ] Health checks
- [ ] Rollback procedure

---

**Última actualización:** 1 de diciembre, 2025  
**Status:** ✅ Listo para producción
