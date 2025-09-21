# Retirement Lead Qualification Bot

An AI-powered conversational assistant that qualifies prospects, educates them about retirement tax strategies, and automates lead capture and follow-up.

## Features

✅ **Conversational AI Assistant** - OpenAI-powered bot that guides prospects through a 15-block qualification workflow

✅ **Voice Integration** - ElevenLabs text-to-speech for audio responses

✅ **Smart Qualification** - Automatically qualifies leads based on retirement assets ($1M-$10M target range)

✅ **Calendar Integration** - Calendly booking for strategy calls

✅ **Lead Capture** - Automatic CRM data capture

✅ **Follow-up Automation** - Scheduled email sequences for non-booked leads

✅ **Tax Education** - Explains "Tax Avalanche" concept and visualizations

✅ **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

**Backend:**
- Node.js + Express
- TypeScript
- MongoDB for data persistence
- OpenAI API (GPT-3.5/GPT-4)
- ElevenLabs API (Text-to-Speech)
- Calendly API
- Axios for HTTP requests

**Frontend:**
- React 18
- TypeScript
- Vite
- CSS3 (Responsive Design)

## Project Structure

```
retirement-lead-qualification-bot/
├── src/
│   ├── client/
│   │   ├── App.tsx          # Main React component
│   │   ├── App.css          # Styles
│   │   └── main.tsx         # React entry point
│   ├── routes/
│   │   ├── conversation.ts  # Chat endpoint
│   │   ├── leads.ts         # Lead management
│   │   └── calendar.ts      # Calendar/scheduling
│   ├── services/
│   │   ├── openAI.ts        # OpenAI integration
│   │   ├── elevenLabs.ts    # Text-to-speech
│   │   ├── calendly.ts      # Calendar booking
│   │   └── crm.ts           # CRM/email integration
│   ├── models/
│   │   └── index.ts         # MongoDB schemas
│   └── server.ts            # Express server
├── index.html               # HTML entry point
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript config
├── package.json
└── .env.example
```

## 15-Block Workflow

1. **Welcome** - Introduction to Nash Cash Flow
2. **Retirement Status** - Working/Planning/Retired?
3. **Age Range** - Which age bracket?
4. **Retirement Savings** - Assets in IRAs/401(k)s?
5. **Qualification Logic** - Qualify if > $1M (exit if < $500k)
6. **Tax Awareness** - Have they calculated tax impact?
7. **Future Tax Expectation** - Higher/lower/same taxes?
8. **Income Strategy** - Primary income plan?
9. **Tax Avalanche Explanation** - Education on RMDs + SS + Medicare
10. **Show Visual** - Display tax impact chart
11. **Strategy Interest** - Want to explore tax reduction?
12. **Call Offer** - Offer no-cost strategy call
13. **Calendar Booking** - Collect name/email/phone
14. **CRM Capture** - Send all data to CRM
15. **Follow-up Automation** - Email sequences for non-booked leads

## Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Environment variables configured

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/upstackpilot0710/retirement-lead-qualification-bot.git
   cd retirement-lead-qualification-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```env
   # Server
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173

   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/retirement-bot

   # OpenAI
   OPENAI_API_KEY=sk_test_your_key_here

   # ElevenLabs
   ELEVENLABS_API_KEY=your_api_key

   # Calendly
   CALENDLY_API_TOKEN=your_token
   CALENDLY_USERNAME=john

   # CRM & Email
   CRM_WEBHOOK_URL=https://your-crm.com/webhooks/leads
   EMAIL_PROVIDER=sendgrid
   EMAIL_WEBHOOK_URL=https://your-email-service.com/send
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

This starts both the backend (port 5000) and frontend (port 5173) concurrently.

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Conversation
- `POST /api/conversation/start` - Initialize a new conversation
- `POST /api/conversation/message` - Send a message and get response
- `GET /api/conversation/:sessionId` - Get conversation history

### Leads
- `GET /api/leads/:sessionId` - Get specific lead
- `PUT /api/leads/:sessionId` - Update lead data
- `POST /api/leads/:sessionId/capture` - Send lead data to CRM
- `GET /api/leads` - Get all leads (admin)
- `GET /api/leads/qualified/only` - Get qualified leads only
- `GET /api/leads/booked/calls` - Get leads who booked calls

### Calendar
- `GET /api/calendar/booking-link` - Get Calendly booking link
- `POST /api/calendar/book/:sessionId` - Book a call
- `POST /api/calendar/schedule-followups/:sessionId` - Schedule follow-ups
- `GET /api/calendar/pending/followups` - Get pending follow-ups

## Database Models

### Lead
```javascript
{
  sessionId: String,
  name: String,
  email: String,
  phone: String,
  age_range: String,
  retirement_status: String,
  retirement_assets: String,
  tax_awareness: String,
  future_tax_expectation: String,
  income_strategy: String,
  strategy_interest: String,
  qualified: Boolean,
  calendarBooked: Boolean,
  calendlyLink: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation
```javascript
{
  sessionId: String,
  messages: [{
    role: String,
    content: String,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### FollowUp
```javascript
{
  leadId: String,
  email: String,
  type: 'visual' | 'video' | 'call_invitation',
  scheduledFor: Date,
  sent: Boolean,
  sentAt: Date,
  createdAt: Date
}
```

## Integration Guide

### OpenAI API
The bot uses Claude 3.5 Sonnet via Anthropic API. It extracts key data points from conversations automatically:
- Retirement status
- Age range
- Retirement assets
- Tax awareness and expectations
- Income strategy
- Interest in strategy calls

### ElevenLabs
Optional text-to-speech integration for voice responses. Configure voice settings in `src/services/elevenLabs.ts`:
```typescript
{
  stability: 0.5,      // 0-1, lower = more consistent
  similarity_boost: 0.9 // 0-1, higher = more similar to voice
}
```

### Calendly
Fetch booking links directly from your Calendly account:
1. Get API token from Calendly dashboard
2. Set `CALENDLY_API_TOKEN` in `.env`
3. The system automatically creates and tracks bookings

### CRM Integration
Send lead data to any CRM via webhook:
1. Set `CRM_WEBHOOK_URL` in `.env`
2. The system posts qualified leads with all captured data
3. Data format includes all qualification fields

## Follow-up Automation

Automatic email sequences for leads who don't book:
- **Day 1**: Tax Avalanche visual chart
- **Day 3**: Short educational video
- **Day 7**: Invitation to strategy call

Configure email provider:
- **SendGrid**: Default provider (requires API key)
- **Custom**: Post to your email service webhook

## Monitoring & Analytics

Track leads via dashboard endpoints:

```bash
# All leads
curl http://localhost:5000/api/leads

# Qualified leads only
curl http://localhost:5000/api/leads/qualified/only

# Booked calls
curl http://localhost:5000/api/leads/booked/calls

# Pending follow-ups
curl http://localhost:5000/api/calendar/pending/followups
```

## Customization

### Bot Personality & Messaging
Edit the system prompt in `src/services/openAI.ts`:
```typescript
const systemPrompt = `You are... [customize behavior]`;
```

### UI Styling
Modify colors and layout in `src/client/App.css`:
```css
/* Gradient colors for branding */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Workflow Steps
The workflow blocks are enforced through the system prompt. To modify:
1. Update prompts in `openAI.ts`
2. Add/remove validation logic in routes
3. Adjust MongoDB schemas as needed

## Troubleshooting

### "MongoDB connection error"
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`
- For MongoDB Atlas: verify IP whitelist

### "OpenAI API error"
- Verify `OPENAI_API_KEY` is valid
- Check API account has available credits
- Verify network connectivity

### "Calendly integration not working"
- Confirm `CALENDLY_API_TOKEN` is current
- Check Calendly account permissions
- Test with `GET /api/calendar/booking-link`

### "Email not sending"
- Verify `CRM_WEBHOOK_URL` or email provider configuration
- Check logs for specific error messages
- Test endpoint with `curl` directly

## Performance Optimization

- Messages are cached in MongoDB
- Conversation history limited to most recent 50 messages
- Follow-ups processed in batch jobs
- Frontend uses React.memo for components

## Security Considerations

- All API endpoints should require authentication in production
- Implement rate limiting on conversation endpoint
- Sanitize user input before processing
- Never log sensitive data (PII, API keys)
- Use HTTPS in production

## Deployment

### Heroku
```bash
heroku create retirement-bot
heroku config:set OPENAI_API_KEY=sk_...
git push heroku main
```

### Docker
```bash
docker build -t retirement-bot .
docker run -p 5000:5000 --env-file .env retirement-bot
```

### AWS / DigitalOcean
Standard Node.js deployment with MongoDB connection string

## Support & Contribution

For issues or feature requests, please file a GitHub issue.

## License

MIT License - See LICENSE file for details

## Author

Built for financial educators helping families manage retirement taxes.

---

**Last Updated:** March 2026
**Version:** 1.0.0
