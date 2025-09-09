# Pre-Launch Checklist

Complete this checklist before launching your retirement qualification bot to production.

## Phase 1: Development & Testing (Week 1-2)

### Backend Setup
- [ ] Clone repository
- [ ] Install dependencies: `npm install`
- [ ] Create `.env` file from `.env.example`
- [ ] Add API keys:
  - [ ] OpenAI API key
  - [ ] MongoDB connection string
  - [ ] ElevenLabs API key (optional)
  - [ ] Calendly API token (optional)
- [ ] Start MongoDB
- [ ] Run development server: `npm run dev`
- [ ] Test server health: `curl http://localhost:5000/api/health`

### Frontend Setup
- [ ] Verify React app loads at http://localhost:5173
- [ ] Test chat interface
- [ ] Verify quick reply buttons work
- [ ] Test message sending and responses

### API Testing
- [ ] **Conversation API**
  - [ ] POST /conversation/start
  - [ ] POST /conversation/message (multiple messages)
  - [ ] GET /conversation/:sessionId
  
- [ ] **Leads API**
  - [ ] GET /leads/:sessionId
  - [ ] PUT /leads/:sessionId
  - [ ] POST /leads/:sessionId/capture
  
- [ ] **Calendar API**
  - [ ] GET /calendar/booking-link
  - [ ] POST /calendar/book/:sessionId
  - [ ] POST /calendar/schedule-followups/:sessionId

### Workflow Testing
- [ ] Test complete 15-block workflow
  - [ ] Block 1: Welcome message displays
  - [ ] Block 2: Retirement status question
  - [ ] Block 3: Age range selection
  - [ ] Block 4: Retirement assets (qualification gate)
  - [ ] Block 5: Qualification logic (test both > $1M and < $500k paths)
  - [ ] Block 6: Tax awareness question
  - [ ] Block 7: Future tax expectation
  - [ ] Block 8: Income strategy
  - [ ] Block 9: Tax Avalanche explanation displays
  - [ ] Block 10: Tax visual chart option
  - [ ] Block 11: Strategy interest question
  - [ ] Block 12: Call offer
  - [ ] Block 13: Calendar booking
  - [ ] Block 14: CRM capture
  - [ ] Block 15: Follow-up automation

### Data Validation
- [ ] User data correctly extracted from messages
- [ ] Qualification status calculated correctly
- [ ] Lead records saved to MongoDB
- [ ] Conversation history persists
- [ ] Follow-ups created with correct dates

### Error Handling
- [ ] Test with invalid input
- [ ] Test with missing fields
- [ ] Test with very long messages
- [ ] Verify error messages are helpful
- [ ] Check error logging works

---

## Phase 2: Integration Testing (Week 2-3)

### OpenAI Integration
- [ ] Verify API responses are conversational
- [ ] Test data extraction accuracy (name, email, age, assets, etc.)
- [ ] Test qualification logic matches business rules
- [ ] Verify bot stays in character
- [ ] Check response quality and relevance
- [ ] Monitor API usage and costs
- [ ] Set up API quota alerts

### Calendar Integration (if using Calendly)
- [ ] Verify booking link is correct
- [ ] Test calendar link functionality
- [ ] Verify confirmation emails send
- [ ] Test booking flow end-to-end
- [ ] Check Calendly shows new bookings
- [ ] Verify session tracking after booking

### Email Integration (if configured)
- [ ] Test initial booking confirmation email
- [ ] Test Day 1 follow-up email (visual)
- [ ] Test Day 3 follow-up email (video)
- [ ] Test Day 7 follow-up email (call invitation)
- [ ] Verify email content is personalized
- [ ] Check email deliverability (not spam)
- [ ] Set up email bounce monitoring

### CRM Integration (if webhook configured)
- [ ] Verify webhook receives data
- [ ] Check all fields are sent correctly
- [ ] Verify webhook response is 200
- [ ] Test lead appears in your CRM
- [ ] Verify data formatting matches CRM requirements
- [ ] Set up webhook error notifications

### Voice Integration (ElevenLabs) - Optional
- [ ] Generate speech from sample text
- [ ] Verify audio quality
- [ ] Test audio playback in browser
- [ ] Check voice personality matches brand
- [ ] Monitor API costs

---

## Phase 3: Performance & Security (Week 3)

### Performance Testing
- [ ] Response time < 500ms
- [ ] Database queries optimized
- [ ] UI loads in < 2 seconds
- [ ] No memory leaks detected
- [ ] Load test with 10+ concurrent users
- [ ] Verify database is indexed properly
- [ ] Enable caching where appropriate

### Security Audit
- [ ] CORS configuration correct
- [ ] All API keys secured in .env
- [ ] No sensitive data in logs
- [ ] SQL injection prevention (MongoDB injection)
- [ ] Rate limiting implemented
- [ ] HTTPS ready (self-signed cert at minimum)
- [ ] Input validation on all endpoints
- [ ] No hardcoded credentials
- [ ] Dependencies have no critical vulnerabilities: `npm audit`

### Database Security
- [ ] MongoDB authentication enabled
- [ ] Database password strong (20+ characters)
- [ ] Backup strategy documented
- [ ] Test backup/restore works
- [ ] Automatic cleanup schedule set (old conversations)
- [ ] Database access restricted to app server

---

## Phase 4: Documentation & Training (Week 3)

### Documentation
- [ ] README.md is complete and accurate
- [ ] QUICKSTART.md is tested and works
- [ ] API.md documents all endpoints
- [ ] DEPLOYMENT.md covers your chosen platform
- [ ] MAINTENANCE.md is reviewed and customized
- [ ] Create runbook for common issues
- [ ] Document your specific customizations

### Team Training
- [ ] Team understands workflow (15 blocks)
- [ ] Team can access and monitor leads
- [ ] Team knows how to access email service
- [ ] Team knows how to check follow-up status
- [ ] Team has admin access credentials
- [ ] Team knows escalation procedures
- [ ] Emergency contact list created

### Create Runbooks
- [ ] Emergency restart procedure
- [ ] How to review and export leads
- [ ] How to monitor API usage and costs
- [ ] How to update bot responses
- [ ] How to handle customer issues
- [ ] How to troubleshoot common problems

---

## Phase 5: Production Deployment (Week 4)

### Choose Deployment Platform
- [ ] Heroku / AWS / DigitalOcean / Docker / Other: ________
- [ ] Production domain secured
- [ ] SSL certificate obtained
- [ ] CDN configured (optional)
- [ ] Load balancer configured (optional)

### Database Setup
- [ ] Production MongoDB cluster created
- [ ] Database user with strong password
- [ ] Automatic backups enabled
- [ ] Backup retention set to 30 days
- [ ] Backup restore tested
- [ ] Connection string verified
- [ ] IP whitelist configured (if on MongoDB Atlas)

### Environment Variables
- [ ] Copy .env.example → .production.env
- [ ] All required variables filled:
  - [ ] OPENAI_API_KEY (use production key)
  - [ ] MONGODB_URI (use production database)
  - [ ] ELEVENLABS_API_KEY
  - [ ] CALENDLY_API_TOKEN
  - [ ] CRM_WEBHOOK_URL
  - [ ] EMAIL_PROVIDER and related settings
  - [ ] NODE_ENV=production
  - [ ] CLIENT_URL=https://yourdomain.com
- [ ] All API keys verified as production keys
- [ ] Secrets stored in platform's secret manager
- [ ] No hardcoded keys in code

### Build & Deploy
- [ ] npm run build completes successfully
- [ ] No build errors or warnings
- [ ] Frontend builds to dist/client
- [ ] Backend compiles to dist/server.js
- [ ] Docker image builds successfully (if using Docker)
- [ ] Deploy to production environment
- [ ] Verify deployment successful

### Post-Deployment Verification
- [ ] Frontend loads at https://yourdomain.com
- [ ] API health check passes: https://yourdomain.com/api/health
- [ ] Chat interface is functional
- [ ] API endpoints respond correctly
- [ ] Database is connected and working
- [ ] Test complete workflow end-to-end
- [ ] Check error logs for any issues
- [ ] Verify all integrations working:
  - [ ] OpenAI responses
  - [ ] Calendly booking
  - [ ] Email sending
  - [ ] CRM webhook
- [ ] Monitor server performance metrics
- [ ] Verify HTTPS certificate valid

---

## Phase 6: Monitoring & Alerting (Week 4)

### Setup Monitoring
- [ ] Error tracking enabled (Sentry or similar)
- [ ] Performance monitoring enabled
- [ ] Database monitoring enabled
- [ ] API quota monitoring setup
- [ ] Uptime monitoring configured

### Configure Alerts
- [ ] Slack notifications for errors
- [ ] Email for critical issues
- [ ] SMS for server down (optional)
- [ ] Daily summary reports configured
- [ ] Alert thresholds set appropriately

### Create Dashboards
- [ ] OpenAI API usage dashboard
- [ ] Lead conversion funnel
- [ ] Calendar booking status
- [ ] Follow-up email status
- [ ] Error rate monitoring
- [ ] Response time tracking
- [ ] Database size monitoring

---

## Phase 7: Go-Live (Week 4)

### Internal Testing
- [ ] Test with your team on production
- [ ] Verify bot responds naturally
- [ ] Test all qualification paths
- [ ] Verify calendar booking works
- [ ] Check email confirmation arrives
- [ ] Verify lead appears in your CRM

### Marketing Readiness
- [ ] Landing page created (if applicable)
- [ ] Instructions for using bot documented
- [ ] Social media posts scheduled (if applicable)
- [ ] Email campaign ready (if applicable)
- [ ] Ad copy reviewed and approved
- [ ] FAQ prepared for common questions

### Launch
- [ ] Go/No-Go meeting conducted
- [ ] Stakeholder approval received
- [ ] Monitor closely for first 24 hours
- [ ] Have support team on standby
- [ ] Track incoming leads closely
- [ ] Monitor conversion rate
- [ ] Gather user feedback

### Post-Launch (First Week)
- [ ] Review first 10-20 conversations
- [ ] Check bot response quality
- [ ] Verify email delivery rates
- [ ] Monitor calendar bookings
- [ ] Check CRM data integration
- [ ] Get feedback from first customers
- [ ] Make immediate improvements if needed
- [ ] Update bot responses based on feedback

---

## Phase 8: Optimization (Ongoing)

### Week 1-2 Post-Launch
- [ ] Analyze qualification funnel
- [ ] Calculate conversion rate (qualified → booked)
- [ ] Review common conversation topics
- [ ] Identify areas for bot improvement
- [ ] Test and deploy simple improvements
- [ ] Monitor performance metrics closely

### Monthly Review
- [ ] Review lead quality and conversion
- [ ] Analyze bot conversation patterns
- [ ] Update bot responses for better results
- [ ] Review and optimize email sequences
- [ ] Check all integrations still working
- [ ] Review costs (API usage, database, hosting)
- [ ] Get customer feedback
- [ ] Plan improvements for next month

---

## Success Metrics to Track

At launch and ongoing:

```
Week 1:
- [ ] Server uptime: ___% (target: 99%+)
- [ ] API response time: ___ ms (target: <500ms)
- [ ] Total conversations: ___
- [ ] Qualified leads: ___
- [ ] Calendar bookings: ___
- [ ] Error rate: ___%  (target: <0.5%)

Week 2-4:
- [ ] Qualification rate: __% (target: 20-30%)
- [ ] Booking rate (from qualified): __% (target: 10-15%)
- [ ] Email delivery rate: __% (target: >95%)
- [ ] Average conversation length: ___ messages
- [ ] Customer satisfaction: __/10

Ongoing Monthly:
- [ ] Total leads: ___
- [ ] Qualified leads: ___
- [ ] Booked calls: ___
- [ ] Conversion rate: __% 
- [ ] Cost per lead: $___
- [ ] Cost per qualified lead: $___
- [ ] Cost per booked call: $___
```

---

## Support Contacts

- **Your Support Email:** _________________
- **OpenAI Support:** support@openai.com
- **Calendly Support:** support@calendly.com
- **ElevenLabs Support:** support@elevenlabs.io
- **Hosting Support:** _________________
- **Emergency Hotline:** _________________

---

## Sign-Off

- [ ] Project Manager Approval: __________________ Date: ____
- [ ] QA Sign-Off: ____________________ Date: ____
- [ ] Tech Lead Approval: __________________ Date: ____
- [ ] Executive Approval: __________________ Date: ____

**Ready to Launch:** YES / NO

**Launch Date:** _________________

**Launch Time:** _________________ (UTC)

---

## Notes

```
[Add any additional notes or special considerations]




```

---

**Checklist Version:** 1.0
**Last Updated:** March 2026
**Status:** Ready for Production
