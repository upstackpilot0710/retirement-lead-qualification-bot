import { Router, Request, Response } from 'express';
import { Lead } from '../models/index.js';
import { sendToCRM } from '../services/crm.js';
import { getCalendlyBookingLink } from '../services/calendly.js';

export const router = Router();

// Get lead by session
router.get('/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const lead = await Lead.findOne({ sessionId });

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    res.json(lead);
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// Update lead
router.put('/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const updateData = req.body;

    const lead = await Lead.findOneAndUpdate({ sessionId }, updateData, {
      new: true,
    });

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    res.json(lead);
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Capture final lead data and send to CRM
router.post('/:sessionId/capture', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const lead = await Lead.findOne({ sessionId });

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    // Prepare data for CRM
    const crmData = {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      age_range: lead.age_range,
      retirement_status: lead.retirement_status,
      retirement_assets: lead.retirement_assets,
      tax_awareness: lead.tax_awareness,
      future_tax_expectation: lead.future_tax_expectation,
      income_strategy: lead.income_strategy,
      strategy_interest: lead.strategy_interest,
      qualified: lead.qualified,
      calendarBooked: lead.calendarBooked,
      timestamp: new Date().toISOString(),
    };

    // Send to CRM
    await sendToCRM(crmData);

    res.json({
      success: true,
      message: 'Lead data captured and sent to CRM',
      lead: crmData,
    });
  } catch (error) {
    console.error('Capture lead error:', error);
    res.status(500).json({ error: 'Failed to capture lead' });
  }
});

// Get all leads (admin endpoint)
router.get('/', async (req: Request, res: Response) => {
  try {
    // In production, add proper authentication
    const leads = await Lead.find({}).limit(100).sort({ createdAt: -1 });

    res.json({
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Get qualified leads
router.get('/qualified/only', async (req: Request, res: Response) => {
  try {
    const leads = await Lead.find({ qualified: true })
      .limit(100)
      .sort({ createdAt: -1 });

    res.json({
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error('Get qualified leads error:', error);
    res.status(500).json({ error: 'Failed to fetch qualified leads' });
  }
});

// Get booked calls
router.get('/booked/calls', async (req: Request, res: Response) => {
  try {
    const leads = await Lead.find({ calendarBooked: true })
      .limit(100)
      .sort({ createdAt: -1 });

    res.json({
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error('Get booked calls error:', error);
    res.status(500).json({ error: 'Failed to fetch booked calls' });
  }
});
