# API Documentation

Complete reference for all API endpoints.

## Base URL

```
http://localhost:5000/api
```

In production, replace with your domain.

## Authentication

Currently, the API does not require authentication on public endpoints. For production, implement JWT tokens on sensitive endpoints.

```bash
# Example with JWT (when implemented)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/leads
```

## Conversation Endpoints

### Start Conversation

Initialize a new conversation session.

**Endpoint:** `POST /conversation/start`

**Request:**
```bash
curl -X POST http://localhost:5000/api/conversation/start
```

**Response:**
```json
{
  "sessionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "response": "Welcome to Nash Cash Flow. Many Americans with $2M–$10M in retirement accounts discover...",
  "userData": {}
}
```

**Status Code:** 200

---

### Send Message

Send a user message and receive AI response.

**Endpoint:** `POST /conversation/message`

**Request:**
```bash
curl -X POST http://localhost:5000/api/conversation/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "message": "Yes, I am interested",
    "includeAudio": false
  }'
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessionId` | string | Yes | Session ID from /start |
| `message` | string | Yes | User message |
| `includeAudio` | boolean | No | Return audio response (ElevenLabs) |

**Response:**
```json
{
  "sessionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "response": "Great! Let me ask you a few questions to understand your situation better...",
  "audioUrl": "https://cdn.elevenlabs.io/...", // if includeAudio: true
  "userData": {
    "name": null,
    "email": null,
    "phone": null,
    "age_range": null,
    "retirement_status": null,
    "retirement_assets": null,
    "tax_awareness": null,
    "future_tax_expectation": null,
    "income_strategy": null,
    "strategy_interest": null
  },
  "isQualified": null,
  "nextAction": "CONTINUE" // or "SHOW_CALENDAR", "SHOW_VISUAL"
}
```

**Status Code:** 200

**Error Response:**
```json
{
  "error": "Missing sessionId or message"
}
```

**Status Code:** 400

---

### Get Conversation History

Retrieve full conversation history and user data.

**Endpoint:** `GET /conversation/:sessionId`

**Request:**
```bash
curl http://localhost:5000/api/conversation/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

**Response:**
```json
{
  "sessionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "messages": [
    {
      "role": "assistant",
      "content": "Welcome to Nash Cash Flow...",
      "timestamp": "2024-03-25T10:30:00.000Z"
    },
    {
      "role": "user",
      "content": "Yes, I am interested",
      "timestamp": "2024-03-25T10:30:15.000Z"
    },
    {
      "role": "assistant",
      "content": "Let me ask you a few questions...",
      "timestamp": "2024-03-25T10:30:30.000Z"
    }
  ],
  "userData": {
    "name": null,
    "email": null,
    "phone": null,
    "age_range": null,
    "retirement_assets": null
  }
}
```

**Status Code:** 200

---

## Lead Endpoints

### Get Lead

Retrieve lead information by session.

**Endpoint:** `GET /leads/:sessionId`

**Request:**
```bash
curl http://localhost:5000/api/leads/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

**Response:**
```json
{
  "_id": "64f2c5d8e5b2a1c9f8e9d0a1",
  "sessionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+1-201-555-0123",
  "age_range": "60-69",
  "retirement_status": "Already retired",
  "retirement_assets": "$3M–$10M",
  "tax_awareness": "No",
  "future_tax_expectation": "Higher",
  "income_strategy": "Withdrawals from retirement accounts",
  "strategy_interest": "Yes",
  "qualified": true,
  "calendarBooked": false,
  "calendlyLink": null,
  "createdAt": "2024-03-25T10:30:00.000Z",
  "updatedAt": "2024-03-25T10:35:00.000Z"
}
```

**Status Code:** 200

**Error Response:**
```json
{
  "error": "Lead not found"
}
```

**Status Code:** 404

---

### Update Lead

Manually update lead information.

**Endpoint:** `PUT /leads/:sessionId`

**Request:**
```bash
curl -X PUT http://localhost:5000/api/leads/f47ac10b-58cc-4372-a567-0e02b2c3d479 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+1-201-555-0123",
    "age_range": "60-69",
    "qualified": true
  }'
```

**Request Body:**
All fields are optional.

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "age_range": "string",
  "retirement_status": "string",
  "retirement_assets": "string",
  "tax_awareness": "string",
  "future_tax_expectation": "string",
  "income_strategy": "string",
  "strategy_interest": "string",
  "qualified": "boolean",
  "calendarBooked": "boolean"
}
```

**Response:**
Returns updated lead object (same as GET /leads/:sessionId)

**Status Code:** 200

---

### Capture Lead Data

Send lead data to CRM webhook.

**Endpoint:** `POST /leads/:sessionId/capture`

**Request:**
```bash
curl -X POST http://localhost:5000/api/leads/f47ac10b-58cc-4372-a567-0e02b2c3d479/capture
```

**Response:**
```json
{
  "success": true,
  "message": "Lead data captured and sent to CRM",
  "lead": {
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+1-201-555-0123",
    "age_range": "60-69",
    "retirement_status": "Already retired",
    "retirement_assets": "$3M–$10M",
    "tax_awareness": "No",
    "future_tax_expectation": "Higher",
    "income_strategy": "Withdrawals from retirement accounts",
    "strategy_interest": "Yes",
    "qualified": true,
    "calendarBooked": false,
    "timestamp": "2024-03-25T10:35:00.000Z"
  }
}
```

**Status Code:** 200

**Note:** This endpoint posts to your CRM webhook if configured in `.env`.

---

### Get All Leads (Admin)

Retrieve all leads (last 100, sorted by date).

**Endpoint:** `GET /leads`

**Request:**
```bash
curl http://localhost:5000/api/leads
```

**Response:**
```json
{
  "count": 5,
  "leads": [
    {
      "_id": "64f2c5d8e5b2a1c9f8e9d0a1",
      "sessionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "name": "John Smith",
      "email": "john@example.com",
      "qualified": true,
      "calendarBooked": false,
      "createdAt": "2024-03-25T10:30:00.000Z"
    }
    // ... more leads
  ]
}
```

**Status Code:** 200

**Security Note:** Add authentication before using in production.

---

### Get Qualified Leads

Retrieve only qualified leads.

**Endpoint:** `GET /leads/qualified/only`

**Request:**
```bash
curl http://localhost:5000/api/leads/qualified/only
```

**Response:**
```json
{
  "count": 3,
  "leads": [
    // Only leads with qualified: true
  ]
}
```

**Status Code:** 200

---

### Get Booked Calls

Retrieve leads who booked calls.

**Endpoint:** `GET /leads/booked/calls`

**Request:**
```bash
curl http://localhost:5000/api/leads/booked/calls
```

**Response:**
```json
{
  "count": 2,
  "leads": [
    // Only leads with calendarBooked: true
  ]
}
```

**Status Code:** 200

---

## Calendar Endpoints

### Get Booking Link

Get Calendly booking link for your account.

**Endpoint:** `GET /calendar/booking-link`

**Request:**
```bash
curl http://localhost:5000/api/calendar/booking-link
```

**Response:**
```json
{
  "bookingLink": "https://calendly.com/john/strategy-call",
  "message": "Share this link with prospects to schedule strategy calls"
}
```

**Status Code:** 200

---

### Book a Call

Mark call as booked and send confirmation email.

**Endpoint:** `POST /calendar/book/:sessionId`

**Request:**
```bash
curl -X POST http://localhost:5000/api/calendar/book/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

**Response:**
```json
{
  "success": true,
  "message": "Call booking initiated",
  "bookingLink": "https://calendly.com/john/strategy-call",
  "lead": {
    "sessionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "name": "John Smith",
    "email": "john@example.com",
    "calendarBooked": true
  }
}
```

**Status Code:** 200

**Note:** This sends a confirmation email to the lead's email address.

---

### Schedule Follow-ups

Create follow-up email sequence for leads who didn't book.

**Endpoint:** `POST /calendar/schedule-followups/:sessionId`

**Request:**
```bash
curl -X POST http://localhost:5000/api/calendar/schedule-followups/f47ac10b-58cc-4372-a567-0e02b2c3d479
```

**Response:**
```json
{
  "success": true,
  "message": "Follow-up sequences created",
  "followUps": [
    {
      "type": "visual",
      "day": 1
    },
    {
      "type": "video",
      "day": 3
    },
    {
      "type": "call_invitation",
      "day": 7
    }
  ]
}
```

**Status Code:** 200

**Follow-up Schedule:**
- Day 1: Tax Avalanche Visual
- Day 3: Educational Video
- Day 7: Call Invitation

---

### Get Pending Follow-ups

Retrieve follow-ups due for sending.

**Endpoint:** `GET /calendar/pending/followups`

**Request:**
```bash
curl http://localhost:5000/api/calendar/pending/followups
```

**Response:**
```json
{
  "count": 2,
  "followUps": [
    {
      "_id": "64f2c5d8e5b2a1c9f8e9d0a2",
      "leadId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "email": "john@example.com",
      "type": "visual",
      "scheduledFor": "2024-03-25T10:30:00.000Z",
      "sent": false,
      "sentAt": null
    }
  ]
}
```

**Status Code:** 200

---

### Mark Follow-up as Sent

Update follow-up status after sending.

**Endpoint:** `POST /calendar/followup/:followupId/mark-sent`

**Request:**
```bash
curl -X POST http://localhost:5000/api/calendar/followup/64f2c5d8e5b2a1c9f8e9d0a2/mark-sent
```

**Response:**
```json
{
  "success": true,
  "followUp": {
    "_id": "64f2c5d8e5b2a1c9f8e9d0a2",
    "leadId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "email": "john@example.com",
    "type": "visual",
    "sent": true,
    "sentAt": "2024-03-25T15:45:00.000Z"
  }
}
```

**Status Code:** 200

---

## Health Check

### Server Status

**Endpoint:** `GET /health`

**Request:**
```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-03-25T10:30:00.000Z"
}
```

**Status Code:** 200

---

## Error Responses

### Standard Error Format

All errors follow this format:

```json
{
  "error": "Human-readable error message"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (missing/invalid fields) |
| 404 | Not Found (session/lead doesn't exist) |
| 500 | Server Error |

### Error Examples

**Missing Required Field:**
```json
{
  "error": "Missing sessionId or message"
}
```
Status: 400

**Conversation Not Found:**
```json
{
  "error": "Conversation not found"
}
```
Status: 404

**Server Error:**
```json
{
  "error": "Failed to process message"
}
```
Status: 500

---

## Rate Limiting

Currently not enforced. In production, implement:

```
Recommended: 100 requests per 15 minutes per IP
```

---

## CORS Configuration

Frontend URL configured in `.env`:
```env
CLIENT_URL=http://localhost:5173
```

---

## Testing with cURL

Complete workflow example:

```bash
# 1. Start conversation
SESSION=$(curl -X POST http://localhost:5000/api/conversation/start | jq -r '.sessionId')

# 2. Send first message
curl -X POST http://localhost:5000/api/conversation/message \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"$SESSION\", \"message\": \"Yes, I am interested\"}"

# 3. Continue conversation
curl -X POST http://localhost:5000/api/conversation/message \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"$SESSION\", \"message\": \"Already retired\"}"

# 4. Check lead data
curl http://localhost:5000/api/leads/$SESSION
```

---

## Testing with Postman

1. Import JSON collection (create from endpoints above)
2. Set variable: `{{baseUrl}}` = `http://localhost:5000/api`
3. Set variable: `{{sessionId}}` = from /conversation/start response
4. Run requests in sequence

---

## Rate Limit Headers

Future rate limit implementation:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
```

---

## Migration & Data

### Export All Leads

```bash
mongoexport --uri "mongodb://..." \
  --collection leads \
  --out leads_backup.json
```

### Import Leads

```bash
mongoimport --uri "mongodb://..." \
  --collection leads \
  --jsonArray \
  leads_backup.json
```

---

## Webhooks

### CRM Webhook Format

Sent to `CRM_WEBHOOK_URL` on lead capture:

```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+1-201-555-0123",
  "age_range": "60-69",
  "retirement_status": "Already retired",
  "retirement_assets": "$3M–$10M",
  "tax_awareness": "No",
  "future_tax_expectation": "Higher",
  "income_strategy": "Withdrawals from retirement accounts",
  "strategy_interest": "Yes",
  "qualified": true,
  "calendarBooked": false,
  "timestamp": "2024-03-25T10:35:00.000Z"
}
```

---

## Best Practices

1. **Always use sessionId** from `/conversation/start` for subsequent calls
2. **Store sessionId** on client to resume conversations
3. **Check isQualified** status to show/hide calendar booking
4. **Handle nextAction** responses to show special UI elements
5. **Capture data** before sending calendar booking
6. **Monitor error responses** and log them for debugging

---

**Last Updated:** March 2026
**API Version:** 1.0.0
