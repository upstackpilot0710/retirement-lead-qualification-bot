import { Router, Request, Response } from 'express';
import { getCalendlyBookingLink } from '../services/calendly.js';
import { Lead, FollowUp } from '../models/index.js';
import { sendEmail } from '../services/crm.js';

export const router = Router();

// Get Calendly booking link
router.get('/booking-link', async (req: Request, res: Response) => {
  try {
    const bookingLink = await getCalendlyBookingLink();

    res.json({
      bookingLink,
      message: 'Share this link with prospects to schedule strategy calls',
    });
  } catch (error) {
    console.error('Get booking link error:', error);
    res.status(500).json({ error: 'Failed to get booking link' });
  }
});

// Book a call for a lead
router.post('/book/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const lead = await Lead.findOne({ sessionId });

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    if (!lead.email || !lead.name) {
      res.status(400).json({
        error: 'Missing email or name for booking',
      });
      return;
    }

    // Get booking link
    const bookingLink = await getCalendlyBookingLink();

    // Update lead
    await Lead.findOneAndUpdate(
      { sessionId },
      {
        calendarBooked: true,
        calendlyLink: bookingLink,
      },
      { new: true }
    );

    // Send confirmation email
    const emailContent = `
      <h2>Your Strategy Call is Scheduled</h2>
      <p>Hi ${lead.name},</p>
      <p>Great! We have your information and John is looking forward to discussing your retirement strategy.</p>
      <p><a href="${bookingLink}">Click here to complete your calendar booking</a></p>
      <p>You'll receive calendar details once you book the call.</p>
      <p>Best regards,<br>The Nash Cash Flow Team</p>
    `;

    await sendEmail(lead.email, 'Your Strategy Call Confirmation', emailContent);

    // Create follow-up sequences for unbooked leads would go here
    // For booked leads, we might schedule a reminder

    res.json({
      success: true,
      message: 'Call booking initiated',
      bookingLink,
      lead,
    });
  } catch (error) {
    console.error('Book call error:', error);
    res.status(500).json({ error: 'Failed to book call' });
  }
});

// Schedule follow-ups for leads who didn't book
router.post('/schedule-followups/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const lead = await Lead.findOne({ sessionId });

    if (!lead || lead.calendarBooked) {
      res.status(400).json({
        error: 'Lead not found or already booked',
      });
      return;
    }

    if (!lead.email) {
      res.status(400).json({
        error: 'Lead email missing',
      });
      return;
    }

    // Create follow-up schedule
    // Day 1: Tax Avalanche Visual
    await FollowUp.create({
      leadId: sessionId,
      email: lead.email,
      type: 'visual',
      scheduledFor: new Date(),
    });

    // Day 3: Educational video
    const day3 = new Date();
    day3.setDate(day3.getDate() + 3);
    await FollowUp.create({
      leadId: sessionId,
      email: lead.email,
      type: 'video',
      scheduledFor: day3,
    });

    // Day 7: Call invitation
    const day7 = new Date();
    day7.setDate(day7.getDate() + 7);
    await FollowUp.create({
      leadId: sessionId,
      email: lead.email,
      type: 'call_invitation',
      scheduledFor: day7,
    });

    res.json({
      success: true,
      message: 'Follow-up sequences created',
      followUps: [
        { type: 'visual', day: 1 },
        { type: 'video', day: 3 },
        { type: 'call_invitation', day: 7 },
      ],
    });
  } catch (error) {
    console.error('Schedule followups error:', error);
    res.status(500).json({ error: 'Failed to schedule follow-ups' });
  }
});

// Get follow-ups due for sending
router.get('/pending/followups', async (req: Request, res: Response) => {
  try {
    const now = new Date();

    const pendingFollowUps = await FollowUp.find({
      sent: false,
      scheduledFor: { $lte: now },
    });

    res.json({
      count: pendingFollowUps.length,
      followUps: pendingFollowUps,
    });
  } catch (error) {
    console.error('Get pending followups error:', error);
    res.status(500).json({ error: 'Failed to fetch pending follow-ups' });
  }
});

// Mark follow-up as sent
router.post('/followup/:followupId/mark-sent', async (req: Request, res: Response) => {
  try {
    const { followupId } = req.params;

    const followUp = await FollowUp.findByIdAndUpdate(
      followupId,
      {
        sent: true,
        sentAt: new Date(),
      },
      { new: true }
    );

    if (!followUp) {
      res.status(404).json({ error: 'Follow-up not found' });
      return;
    }

    res.json({
      success: true,
      followUp,
    });
  } catch (error) {
    console.error('Mark sent error:', error);
    res.status(500).json({ error: 'Failed to mark follow-up as sent' });
  }
});
