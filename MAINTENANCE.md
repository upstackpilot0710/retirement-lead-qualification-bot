# Maintenance & Support Guide

How to keep your retirement qualification bot running smoothly.

## Regular Maintenance Tasks

### Daily (Automated)

- ✅ Conversation logging (automatic)
- ✅ Lead data backup (configure with MongoDB Atlas)
- ✅ Follow-up email scheduling (automatic)
- ✅ Error monitoring (set up alerts)

### Weekly

- [ ] Review qualified leads
- [ ] Check booked calls
- [ ] Monitor API response times
- [ ] Verify email delivery rates
- [ ] Check Calendly integration status

```bash
# Check qualified leads
curl http://localhost:5000/api/leads/qualified/only | jq '.count'

# Check booked calls
curl http://localhost:5000/api/leads/booked/calls | jq '.count'

# Check pending follow-ups
curl http://localhost:5000/api/calendar/pending/followups | jq '.count'
```

### Monthly

- [ ] Review lead conversion metrics
- [ ] Analyze conversation patterns
- [ ] Update bot responses if needed
- [ ] Check API quota usage
- [ ] Review and optimize performance
- [ ] Backup MongoDB data
- [ ] Security audit

```bash
# Backup MongoDB
mongodump --uri "mongodb://..." --out ./backups/$(date +%Y%m%d)

# Get lead statistics
curl http://localhost:5000/api/leads | jq '.count'
```

### Quarterly

- [ ] Update dependencies (`npm update`)
- [ ] Review and rotate API keys
- [ ] Update SSL certificates
- [ ] Performance optimization review
- [ ] Security assessment
- [ ] Cost analysis

```bash
# Check for outdated packages
npm outdated

# Update to latest versions
npm update
```

## Common Issues & Solutions

### Issue: Bot Not Responding

**Symptoms:** Chat interface frozen, no response after sending message

**Diagnosis:**
```bash
# Check server status
curl http://localhost:5000/api/health

# Check logs
docker logs retirement-bot-app  # if using Docker
# or
pm2 logs retirement-bot  # if using PM2
```

**Solutions:**

1. **Server Down**
   ```bash
   # Restart server
   npm start
   # or with PM2
   pm2 restart retirement-bot
   # or with Docker
   docker-compose up -d
   ```

2. **OpenAI API Error**
   ```bash
   # Check API key in .env
   echo $OPENAI_API_KEY
   # Verify key validity at https://platform.openai.com/account/api-keys
   ```

3. **MongoDB Connection Failed**
   ```bash
   # Verify MongoDB is running
   mongosh "mongodb://localhost:27017"
   # Check connection string in .env
   MONGODB_URI=mongodb://localhost:27017/retirement-bot
   ```

4. **Network/Timeout**
   ```bash
   # Increase timeout in .env
   REQUEST_TIMEOUT=30000  # 30 seconds
   ```

---

### Issue: Messages Not Saving

**Symptoms:** Conversation history lost, can't retrieve past messages

**Diagnosis:**
```bash
# Check MongoDB
mongosh "mongodb://localhost:27017/retirement-bot"
use retirement-bot
db.conversations.count()
```

**Solutions:**

1. **Rebuild Indexes**
   ```bash
   mongosh "mongodb://localhost:27017/retirement-bot"
   db.conversations.createIndex({ sessionId: 1 })
   db.leads.createIndex({ sessionId: 1 })
   ```

2. **Check Database Permissions**
   ```bash
   # Verify user has write access
   db.auth("username", "password")
   db.test.insertOne({ test: true })
   ```

3. **Clear Old Data**
   ```bash
   # Remove conversations older than 90 days
   db.conversations.deleteMany({
     createdAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
   })
   ```

---

### Issue: Calendar Booking Not Working

**Symptoms:** "Book Call" button doesn't open Calendly or send emails

**Diagnosis:**
```bash
# Check Calendly connection
curl http://localhost:5000/api/calendar/booking-link

# Verify token in .env
echo $CALENDLY_API_TOKEN
```

**Solutions:**

1. **Refresh Calendly Token**
   - Go to https://calendly.com/app/integrations
   - Generate new API token
   - Update `CALENDLY_API_TOKEN` in .env
   - Restart server

2. **Check Email Configuration**
   ```env
   EMAIL_PROVIDER=sendgrid
   MAIL_SERVICE_ENDPOINT=https://api.sendgrid.com/v3/mail/send
   ELEVENLABS_API_KEY=your_key
   ```

3. **Test Email Webhook**
   ```bash
   curl -X POST http://localhost:5000/api/calendar/book/test-session
   # Check email logs
   ```

---

### Issue: High Memory Usage

**Symptoms:** Server slow, crashes, memory usage high

**Diagnosis:**
```bash
# Check memory usage
ps aux | grep node

# Monitor in real-time
top -p $(pgrep -f "node")
```

**Solutions:**

1. **Limit Conversation History**
   ```javascript
   // In conversation.ts
   const maxMessages = 50;  // Limit to last 50 messages
   ```

2. **Clear Old Data**
   ```bash
   # Archive conversations older than 30 days
   mongosh "mongodb://..."
   db.conversations.deleteMany({
     createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
   })
   ```

3. **Enable Garbage Collection**
   ```bash
   node --max-old-space-size=2048 dist/server.js
   ```

4. **Use PM2 Watch**
   ```bash
   pm2 start dist/server.js --watch --max-memory-restart 500M
   ```

---

### Issue: Slow Response Times

**Symptoms:** Messages take > 5 seconds to respond

**Diagnosis:**
```bash
# Check OpenAI API latency
time curl https://api.openai.com/v1/models

# Check database query times
mongosh "mongodb://..."
db.setProfilingLevel(1)  # Enable profiling
```

**Solutions:**

1. **Add Response Caching**
   ```javascript
   // Implement Redis or in-memory cache for common questions
   ```

2. **Optimize Database Queries**
   ```bash
   # Add indexes
   db.conversations.createIndex({ sessionId: 1, createdAt: -1 })
   
   # Check query plans
   db.conversations.explain('executionStats').find({ sessionId: "..." })
   ```

3. **Upgrade Infrastructure**
   - Add more CPU cores
   - Increase RAM
   - Use faster SSD storage
   - Add read replicas for MongoDB

4. **Implement Load Balancing**
   ```bash
   # Run multiple instances behind nginx
   # See DEPLOYMENT.md for setup
   ```

---

## Monitoring & Alerts

### Set Up Error Tracking

**Option 1: Sentry (Recommended)**

1. Create account at https://sentry.io
2. Add to `package.json`:
   ```bash
   npm install @sentry/node
   ```

3. Initialize in server.ts:
   ```typescript
   import * as Sentry from "@sentry/node";
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });
   ```

4. Set environment variable:
   ```env
   SENTRY_DSN=https://your_sentry_dsn
   ```

**Option 2: Simple File Logging**

```typescript
// src/utils/logger.ts
import fs from 'fs';
import path from 'path';

export function logError(error: Error) {
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] ${error.message}\n${error.stack}\n\n`;
  fs.appendFileSync(
    path.join(process.cwd(), 'logs', 'error.log'),
    message
  );
}
```

### Monitor Key Metrics

```bash
# Create monitoring script
cat > monitor.sh << 'EOF'
#!/bin/bash

while true; do
  echo "===$(date) ==="
  
  # API Health
  echo "API Status: $(curl -s http://localhost:5000/api/health | jq .)"
  
  # Lead Count
  echo "Total Leads: $(curl -s http://localhost:5000/api/leads | jq '.count')"
  
  # Qualified
  echo "Qualified: $(curl -s http://localhost:5000/api/leads/qualified/only | jq '.count')"
  
  # Booked
  echo "Booked Calls: $(curl -s http://localhost:5000/api/leads/booked/calls | jq '.count')"
  
  # Memory
  echo "Memory: $(free -h | grep Mem)"
  
  echo ""
  sleep 300  # Every 5 minutes
done
EOF

chmod +x monitor.sh
./monitor.sh
```

### Alert on Failures

```bash
# Use cron for periodic health checks
crontab -e

# Add this line to check every 5 minutes
*/5 * * * * curl -f http://localhost:5000/api/health || \
  echo "Server down at $(date)" | mail -s "ALERT: Bot Down" admin@example.com
```

## Data Management

### Backup Strategy

**Daily Backups:**
```bash
# MongoDB Atlas (recommended)
# Automatic snapshots every 24 hours

# Self-hosted MongoDB
0 2 * * * mongodump --uri "mongodb://..." --out /backups/$(date +\%Y\%m\%d)
```

**Document Backups:**
```bash
# Export leads as CSV
mongosh "mongodb://..." --eval "
  db.leads.find().forEach(function(doc){
    print(doc.sessionId + ',' + doc.email + ',' + doc.qualified)
  })
" > leads_backup.csv
```

### Data Retention

**Keep conversations for:**
- Active sessions: Forever
- Inactive (no messages for 90 days): Delete automatically
- Qualified leads: Forever (archived)

```javascript
// Scheduled cleanup
const cron = require('node-cron');

cron.schedule('0 3 * * *', async () => {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  await Conversation.deleteMany({
    updatedAt: { $lt: ninetyDaysAgo }
  });
  console.log('Cleanup completed');
});
```

## Performance Optimization

### Database Optimization

```bash
# Check index usage
db.conversations.aggregate([
  {
    $indexStats: {}
  }
])

# Rebuild indexes if needed
db.conversations.reIndex()
```

### Code Optimization

```bash
# Measure performance
npm install clinic
clinic doctor -- node dist/server.js

# Generate flamegraph
clinic flame -- node dist/server.js
```

### Caching Strategy

```typescript
// Add Redis for session caching
import redis from 'redis';

const client = redis.createClient({
  host: 'localhost',
  port: 6379
});

// Cache conversation for 1 hour
await client.setex(
  `conversation:${sessionId}`,
  3600,
  JSON.stringify(conversation)
);
```

## Security Maintenance

### Regular Updates

```bash
# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

### API Key Rotation

**Every 90 days:**

1. Generate new API keys:
   - OpenAI: https://platform.openai.com/account/api-keys
   - ElevenLabs: https://elevenlabs.io/app/settings
   - Calendly: https://calendly.com/app/integrations

2. Update `.env`:
   ```bash
   OPENAI_API_KEY=new_key
   ELEVENLABS_API_KEY=new_key
   CALENDLY_API_TOKEN=new_token
   ```

3. Restart server:
   ```bash
   docker-compose restart
   ```

### Log Review

```bash
# Check logs for suspicious activity
tail -f /var/log/retirement-bot.log

# Search for errors
grep "ERROR" /var/log/retirement-bot.log

# Count requests by IP
awk '{print $1}' /var/log/retirement-bot.log | sort | uniq -c
```

## Performance Tuning

### Connection Pooling

```typescript
// MongoDB connection pool settings
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
  connectTimeoutMS: 10000,
});
```

### Query Optimization

```typescript
// Good: Select only needed fields
const lead = await Lead.findById(id).select('name email qualified');

// Bad: Select all fields
const lead = await Lead.findById(id);
```

## Version Management

### Track Changes

```bash
# Tag releases
git tag -a v1.0.0 -m "Production release"
git push origin v1.0.0

# View release history
git log --oneline
```

### Rollback Procedure

```bash
# If something breaks
git revert <commit-hash>
git push origin main

# Or rollback to previous version
git checkout v1.0.0
npm install
npm run build
npm start
```

## Cost Optimization

### Monitor API Usage

```bash
# Check OpenAI costs at: https://platform.openai.com/account/usage

# Estimate monthly cost
# ~$0.002 per 1K tokens (Claude 3.5 Sonnet input)
# ~$0.006 per 1K tokens (Claude 3.5 Sonnet output)

# Example: 1000 conversations = ~$2-5/month
```

### Database Optimization

**MongoDB Atlas:**
- Use shared clusters for development
- Upgrade to dedicated M10+ for production
- Enable automatic backups
- Monitor storage usage monthly

**Cost estimate:**
- Free tier: $0/month (development)
- M10 cluster: ~$50/month (production)

## Support Resources

- **Knowledge Base:** https://docs.openai.com
- **Community Forum:** https://community.openai.com
- **Status Page:** https://status.openai.com
- **Support Email:** support@openai.com

## Escalation Path

**Issue Level:**
1. Self-service (check documentation)
2. Community (Stack Overflow, GitHub Issues)
3. Paid support (if applicable)
4. Emergency hotline (for production outages)

## Troubleshooting Checklist

- [ ] Check server health: `curl http://localhost:5000/api/health`
- [ ] Review error logs: `docker logs retirement-bot-app`
- [ ] Check database connection: `mongosh "mongodb://..."`
- [ ] Verify API keys: `echo $OPENAI_API_KEY`
- [ ] Test with curl: `curl -X POST http://localhost:5000/api/conversation/start`
- [ ] Check external service status (OpenAI, Calendly, etc.)
- [ ] Review recent code changes: `git log --oneline -10`
- [ ] Clear browser cache and retry
- [ ] Restart services: `docker-compose restart`
- [ ] Check disk space: `df -h`
- [ ] Monitor memory: `free -h`

## Emergency Procedures

### Server Crash

```bash
# Immediate restart
docker-compose up -d

# Or with PM2
pm2 restart retirement-bot

# Verify it's running
curl http://localhost:5000/api/health
```

### Data Loss

```bash
# Restore from backup
mongorestore --uri "mongodb://..." --dir ./backups/20240325
```

### Security Breach

1. Immediately revoke API keys
2. Rotate all credentials
3. Review access logs
4. Backup current state
5. Restore from clean backup
6. Revert any suspicious changes

---

## Next Steps

1. **Set up monitoring** - Implement error tracking
2. **Schedule maintenance** - Block time for updates
3. **Document changes** - Keep changelog updated
4. **Train team** - Ensure everyone knows procedures
5. **Test backups** - Verify restore process works

---

**Last Updated:** March 2026
**Support Contact:** support@example.com
