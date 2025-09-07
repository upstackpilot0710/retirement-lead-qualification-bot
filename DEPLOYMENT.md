# Deployment Guide

Complete guide to deploying the retirement qualification bot to production.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] MongoDB production instance set up
- [ ] API keys obtained and stored securely
- [ ] HTTPS configured
- [ ] Error logging and monitoring set up
- [ ] Rate limiting implemented
- [ ] Authentication added to admin endpoints
- [ ] Backup strategy established

## Option 1: Deploy to Heroku

### 1. Install Heroku CLI
```bash
npm install -g heroku
heroku login
```

### 2. Create Heroku App
```bash
heroku create retirement-bot-prod
```

### 3. Set Environment Variables
```bash
heroku config:set OPENAI_API_KEY=sk_...
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set ELEVENLABS_API_KEY=...
heroku config:set CALENDLY_API_TOKEN=...
heroku config:set NODE_ENV=production
```

### 4. Deploy Code
```bash
git push heroku main
```

### 5. Monitor Logs
```bash
heroku logs --tail
```

### 6. Scale Dynos
```bash
heroku ps:scale web=2
```

## Option 2: Deploy to AWS

### 1. Prepare Application
```bash
npm run build
```

### 2. Create Elastic Beanstalk Application
```bash
eb init -p "Node.js 18 running on 64bit Amazon Linux 2" retirement-bot
eb create retirement-bot-prod
```

### 3. Configure Environment
Create `.ebextensions/01_env.config`:
```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    OPENAI_API_KEY: your_key
    MONGODB_URI: your_uri
    NODE_ENV: production
```

### 4. Deploy
```bash
eb deploy
```

## Option 3: Deploy to DigitalOcean

### 1. Create Droplet
- Select: 2GB RAM, Ubuntu 22.04, Basic
- Add MongoDB app from App Platform

### 2. SSH into Droplet
```bash
ssh root@your_droplet_ip
```

### 3. Install Dependencies
```bash
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs npm
```

### 4. Clone Repository
```bash
cd /var/www
git clone https://github.com/upstackpilot0710/retirement-lead-qualification-bot.git
cd retirement-lead-qualification-bot
npm install
npm run build
```

### 5. Create `.env` File
```bash
cat > .env << EOF
OPENAI_API_KEY=your_key
MONGODB_URI=mongodb://connection_string
NODE_ENV=production
PORT=5000
EOF
```

### 6. Set Up PM2 Process Manager
```bash
sudo npm install -g pm2
pm2 start npm --name retirement-bot -- start
pm2 startup
pm2 save
```

### 7. Set Up Nginx Reverse Proxy
```bash
sudo apt-get install nginx
```

Create `/etc/nginx/sites-available/default`:
```nginx
upstream retirement_bot {
  server 127.0.0.1:5000;
}

server {
  listen 80 default_server;
  server_name your_domain.com;

  location / {
    proxy_pass http://retirement_bot;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

```bash
sudo systemctl restart nginx
```

### 8. Enable HTTPS with Let's Encrypt
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your_domain.com
```

## Option 4: Deploy to Docker Swarm

### 1. Build Docker Image
```bash
docker build -t retirement-bot:latest .
docker tag retirement-bot:latest your_registry/retirement-bot:latest
docker push your_registry/retirement-bot:latest
```

### 2. Create Docker Stack
Create `docker-stack.yml`:
```yaml
version: '3.8'

services:
  app:
    image: your_registry/retirement-bot:latest
    ports:
      - "5000:5000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - MONGODB_URI=${MONGODB_URI}
      - NODE_ENV=production
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
    networks:
      - app_network

networks:
  app_network:
    driver: overlay
```

### 3. Deploy Stack
```bash
docker stack deploy -c docker-stack.yml retirement_bot
```

## Option 5: Deploy to Kubernetes

### 1. Create Deployment Manifest
Create `k8s/deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: retirement-bot
spec:
  replicas: 3
  selector:
    matchLabels:
      app: retirement-bot
  template:
    metadata:
      labels:
        app: retirement-bot
    spec:
      containers:
      - name: app
        image: your_registry/retirement-bot:latest
        ports:
        - containerPort: 5000
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: retirement-bot-secrets
              key: openai-key
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: retirement-bot-secrets
              key: mongodb-uri
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: retirement-bot-service
spec:
  type: LoadBalancer
  selector:
    app: retirement-bot
  ports:
    - protocol: TCP
      port: 80
      targetPort: 5000
```

### 2. Create Secrets
```bash
kubectl create secret generic retirement-bot-secrets \
  --from-literal=openai-key=sk_... \
  --from-literal=mongodb-uri=mongodb+srv://...
```

### 3. Deploy
```bash
kubectl apply -f k8s/deployment.yaml
kubectl get pods
kubectl logs -f deployment/retirement-bot
```

## Post-Deployment Configuration

### 1. Monitor Performance
- Set up CloudWatch (AWS), Datadog, or New Relic
- Monitor: Response times, error rates, API quotas
- Set up alerts for failures

### 2. Database Backups
**MongoDB Atlas:**
```bash
# Automatic backups enabled in Atlas dashboard
```

**Self-hosted:**
```bash
# Daily backup script
0 2 * * * mongodump --uri "mongodb://..." --out /backups/$(date +\%Y\%m\%d)
```

### 3. Security Hardening
- Enable HTTPS/TLS
- Set up Web Application Firewall (WAF)
- Enable rate limiting
- Add authentication to admin endpoints
- Use secrets manager for API keys

### 4. Set Up Logging
Add to `src/server.ts`:
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 5. Implement Rate Limiting
```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 6. Add Authentication
```typescript
import jwt from 'jsonwebtoken';

function verifyToken(req, res, next) {
  const token = req.headers['authorization'].split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    req.user = decoded;
    next();
  });
}

// Use on admin routes
app.get('/api/leads', verifyToken, leadController.getAll);
```

## Environment Variables for Production

```env
# App
NODE_ENV=production
PORT=5000
JWT_SECRET=very_long_random_string_256_chars
CLIENT_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/retirement-bot

# APIs
OPENAI_API_KEY=sk_live_...
ELEVENLABS_API_KEY=live_key_...
CALENDLY_API_TOKEN=live_token_...

# CRM
CRM_WEBHOOK_URL=https://your-crm.com/webhooks/leads
EMAIL_PROVIDER=sendgrid
MAIL_SERVICE_ENDPOINT=https://api.sendgrid.com/v3/mail/send

# Monitoring
SENTRY_DSN=https://your_sentry_dsn
LOG_LEVEL=info
```

## Monitoring & Alerts

### Health Check
```bash
curl https://yourdomain.com/api/health
```

### Metrics to Monitor
- API response time (target: < 500ms)
- Error rate (target: < 0.1%)
- Database connections
- OpenAI API quota usage
- Email delivery rate

### Set Up Alerts
- Slack notifications for errors
- SMS for critical issues
- Daily summary emails

## Scaling Considerations

### Vertical Scaling
- Increase CPU/RAM for better performance
- Useful for: Initial growth (< 10k requests/day)

### Horizontal Scaling
- Run multiple app instances
- Use load balancer (nginx, AWS Load Balancer)
- Share MongoDB across instances
- Recommended for: > 10k requests/day

### Database Scaling
- Add read replicas for MongoDB
- Shard collection for very large datasets
- Archive old conversations monthly

## Rollback Procedure

### Heroku
```bash
heroku releases
heroku rollback v12
```

### Docker
```bash
docker service update --image retirement-bot:old_version retirement_bot
```

### Kubernetes
```bash
kubectl rollout history deployment/retirement-bot
kubectl rollout undo deployment/retirement-bot --to-revision=2
```

## Performance Tuning

### Database Optimization
```javascript
// Add indexes
db.leads.createIndex({ email: 1 });
db.leads.createIndex({ createdAt: -1 });
db.leads.createIndex({ qualified: 1 });
```

### API Optimization
- Enable gzip compression
- Use CDN for static files
- Cache responses with Redis
- Paginate large datasets

### Frontend Optimization
- Lazy load components
- Minimize bundle size with tree-shaking
- Use service workers for offline support
- Compress images

## Troubleshooting Production Issues

### High Memory Usage
```bash
# Check memory
free -h

# Find memory-intensive processes
top -b -n 1 | head -20

# Restart if needed
pm2 restart all
```

### Database Connection Issues
```bash
# Test MongoDB connection
mongosh "mongodb+srv://..."

# Check connection pool
db.serverStatus().connections
```

### SSL Certificate Renewal
```bash
# Let's Encrypt auto-renewal
sudo certbot renew --dry-run
```

## Success Metrics

Track these KPIs after deployment:
- Uptime: > 99.5%
- Response Time: < 500ms average
- Error Rate: < 0.1%
- Lead Qualification Rate: > 30%
- Conversion to Calls: > 10%
- Email Delivery Rate: > 95%

---

**For questions:** Open a GitHub issue or contact support.
