# Quick Start Guide

Get the retirement qualification bot running locally in 5 minutes.

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- MongoDB 6+ (or Docker)
- API Keys:
  - OpenAI API Key
  - ElevenLabs API Key (optional)
  - Calendly API Token (optional)

## Option 1: Local Setup (Without Docker)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start MongoDB
If installed locally:
```bash
mongod
```

If using MongoDB Atlas:
- Create free account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Copy connection string

### 3. Create `.env` File
```bash
cp .env.example .env
```

### 4. Configure `.env`
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/retirement-bot
OPENAI_API_KEY=sk_test_your_key_here
```

### 5. Start Development Server
```bash
npm run dev
```

Visit:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## Option 2: Docker Setup (Recommended)

### 1. Create `.env` File
```bash
cp .env.example .env
```

### 2. Fill in API Keys
Edit `.env` with your actual API keys

### 3. Start with Docker Compose
```bash
docker-compose up -d
```

The MongoDB will be automatically set up!

Visit: http://localhost:5173

## Testing the Bot

### 1. Start a Conversation
```bash
curl -X POST http://localhost:5000/api/conversation/start
```

Response:
```json
{
  "sessionId": "uuid...",
  "response": "Welcome to Nash Cash Flow...",
  "userData": {}
}
```

### 2. Send a Message
```bash
curl -X POST http://localhost:5000/api/conversation/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "uuid...",
    "message": "Yes, I am interested"
  }'
```

### 3. Check Lead Data
```bash
curl http://localhost:5000/api/leads/uuid...
```

## Project Structure

```
src/
├── server.ts              # Express server setup
├── routes/
│   ├── conversation.ts    # Chat API
│   ├── leads.ts          # Lead management
│   └── calendar.ts       # Calendly integration
├── services/
│   ├── openAI.ts         # AI responses
│   ├── elevenLabs.ts     # Text-to-speech
│   ├── calendly.ts       # Calendar booking
│   └── crm.ts            # CRM integration
├── models/               # MongoDB schemas
└── client/               # React frontend
```

## Common Issues

### "Cannot find module 'express'"
```bash
npm install
```

### "MongoDB connection refused"
Make sure MongoDB is running:
```bash
# Local MongoDB
mongod

# Or Docker
docker-compose up mongodb
```

### "OPENAI_API_KEY not found"
Ensure you have `.env` file with:
```env
OPENAI_API_KEY=sk_test_your_key_here
```

### "Port 5000 already in use"
Change port in `.env`:
```env
PORT=3000
```

## Development Tips

### View Real-time Logs
```bash
npm run server:dev
```

### Rebuild Frontend Only
```bash
npm run build:client
```

### Check All Errors
```bash
npm run lint
```

### Access MongoDB
```bash
# If using Docker Compose
docker-compose exec mongodb mongosh -u admin -p password
```

## Next Steps

1. **Customize the bot personality** - Edit `src/services/openAI.ts`
2. **Style the UI** - Modify `src/client/App.css`
3. **Configure Calendly** - Add `CALENDLY_API_TOKEN` to `.env`
4. **Set up CRM webhook** - Add `CRM_WEBHOOK_URL` to `.env`
5. **Deploy to production** - See README.md deployment section

## API Documentation

### POST /api/conversation/start
Initializes a new chat session.

**Response:**
```json
{
  "sessionId": "string",
  "response": "string",
  "userData": {}
}
```

### POST /api/conversation/message
Sends a user message and gets AI response.

**Request Body:**
```json
{
  "sessionId": "string",
  "message": "string"
}
```

**Response:**
```json
{
  "sessionId": "string",
  "response": "string",
  "userData": {},
  "isQualified": boolean
}
```

### GET /api/leads/:sessionId
Retrieves lead information.

**Response:**
```json
{
  "_id": "string",
  "sessionId": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "qualified": boolean,
  "createdAt": "date"
}
```

## Environment Variables Reference

| Variable | Purpose | Required |
|----------|---------|----------|
| `OPENAI_API_KEY` | AI responses | Yes |
| `MONGODB_URI` | Database connection | Yes |
| `ELEVENLABS_API_KEY` | Text-to-speech | No |
| `CALENDLY_API_TOKEN` | Calendar booking | No |
| `CRM_WEBHOOK_URL` | Lead webhook | No |
| `PORT` | Server port | No (default: 5000) |
| `CLIENT_URL` | Frontend URL | No (default: http://localhost:5173) |

## Support

For issues or questions:
1. Check the README.md troubleshooting section
2. Review logs in the terminal
3. Test endpoints with curl or Postman
4. Open a GitHub issue

Happy building! 🚀
