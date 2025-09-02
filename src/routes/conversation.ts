import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateBotResponse, extractDataFromConversation } from '../services/openAI.js';
import { Lead, Conversation } from '../models/index.js';
import { sendToCRM } from '../services/crm.js';

export const router = Router();

interface ChatRequest {
  message: string;
  sessionId?: string;
  includeAudio?: boolean;
}

interface ChatResponse {
  sessionId: string;
  response: string;
  audioUrl?: string;
  userData: Record<string, any>;
  isQualified?: boolean;
  nextAction?: string;
}

// Initialize conversation
router.post('/start', async (req: Request, res: Response) => {
  try {
    const sessionId = uuidv4();

    // Create initial conversation record
    await Conversation.create({
      sessionId,
      messages: [],
    });

    // Create initial lead record
    await Lead.create({
      sessionId,
      name: null,
      email: null,
      phone: null,
      qualified: false,
      calendarBooked: false,
    });

    const welcomeMessage = `Welcome to Nash Cash Flow. Many Americans with $2M–$10M in retirement accounts discover something surprising when they begin withdrawing money in retirement—taxes can dramatically reduce how much income they actually get to keep.

John helps families understand strategies that may significantly reduce taxes and increase lifetime income.

Would you like to see whether this could apply to your situation?`;

    await Conversation.findOneAndUpdate(
      { sessionId },
      {
        $push: {
          messages: {
            role: 'assistant',
            content: welcomeMessage,
            timestamp: new Date(),
          },
        },
      }
    );

    res.json({
      sessionId,
      response: welcomeMessage,
      userData: {},
    });
  } catch (error) {
    console.error('Chat start error:', error);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

// Send message and get response
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { message, sessionId, includeAudio } = req.body as ChatRequest;

    if (!sessionId || !message) {
      res.status(400).json({ error: 'Missing sessionId or message' });
      return;
    }

    // Fetch conversation history
    const conversation = await Conversation.findOne({ sessionId });
    const lead = await Lead.findOne({ sessionId });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    // Extract data from user message
    const extractedData = await extractDataFromConversation(
      message,
      JSON.stringify(conversation.messages)
    );

    // Update lead with extracted data
    const updateData: Record<string, any> = {};
    Object.keys(extractedData).forEach((key) => {
      if (
        [
          'name',
          'email',
          'phone',
          'age_range',
          'retirement_status',
          'retirement_assets',
          'tax_awareness',
          'future_tax_expectation',
          'income_strategy',
          'strategy_interest',
        ].includes(key)
      ) {
        updateData[key] = extractedData[key];
      }
    });

    // Qualification check
    if (extractedData.retirement_assets) {
      const assets = extractedData.retirement_assets.toLowerCase();
      const isQualified =
        !assets.includes('under 500k') &&
        !assets.includes('$500k') &&
        !assets.includes('500k-1m');
      updateData.qualified = isQualified;
    }

    await Lead.findOneAndUpdate({ sessionId }, updateData, { new: true });

    // Add user message to conversation
    await Conversation.findOneAndUpdate(
      { sessionId },
      {
        $push: {
          messages: {
            role: 'user',
            content: message,
            timestamp: new Date(),
          },
        },
      }
    );

    // Generate bot response
    const botResponse = await generateBotResponse(
      message,
      conversation.messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      updateData
    );

    // Add bot response to conversation
    await Conversation.findOneAndUpdate(
      { sessionId },
      {
        $push: {
          messages: {
            role: 'assistant',
            content: botResponse,
            timestamp: new Date(),
          },
        },
      }
    );

    const updatedLead = await Lead.findOne({ sessionId });

    const responsePayload: ChatResponse = {
      sessionId,
      response: botResponse,
      userData: {
        name: updatedLead?.name,
        email: updatedLead?.email,
        phone: updatedLead?.phone,
        age_range: updatedLead?.age_range,
        retirement_status: updatedLead?.retirement_status,
        retirement_assets: updatedLead?.retirement_assets,
        tax_awareness: updatedLead?.tax_awareness,
        future_tax_expectation: updatedLead?.future_tax_expectation,
        income_strategy: updatedLead?.income_strategy,
        strategy_interest: updatedLead?.strategy_interest,
      },
      isQualified: updatedLead?.qualified,
    };

    // Determine next action
    if (botResponse.toLowerCase().includes('calendar')) {
      responsePayload.nextAction = 'SHOW_CALENDAR';
    } else if (
      botResponse.toLowerCase().includes('tax avalanche chart') ||
      botResponse.toLowerCase().includes('visual')
    ) {
      responsePayload.nextAction = 'SHOW_VISUAL';
    }

    res.json(responsePayload);
  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get conversation history
router.get('/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const conversation = await Conversation.findOne({ sessionId });
    const lead = await Lead.findOne({ sessionId });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.json({
      sessionId,
      messages: conversation.messages,
      userData: lead,
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});
