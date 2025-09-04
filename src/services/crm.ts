import axios from 'axios';

interface LeadData {
  name: string;
  email: string;
  phone: string;
  age_range: string;
  retirement_status: string;
  retirement_assets: string;
  tax_awareness: string;
  future_tax_expectation: string;
  income_strategy: string;
  strategy_interest: string;
  qualified: boolean;
  calendarBooked: boolean;
  timestamp: string;
}

export async function sendToCRM(leadData: LeadData): Promise<void> {
  const crmEndpoint = process.env.CRM_WEBHOOK_URL;

  if (!crmEndpoint) {
    console.log('CRM webhook not configured, logging lead data:', leadData);
    return;
  }

  try {
    await axios.post(crmEndpoint, leadData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Lead data sent to CRM successfully');
  } catch (error) {
    console.error('Error sending lead data to CRM:', error);
    // Don't throw, log and continue
  }
}

export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string
): Promise<void> {
  const emailProvider = process.env.EMAIL_PROVIDER || 'sendgrid';

  if (emailProvider === 'sendgrid') {
    await sendViaMailService(to, subject, htmlContent);
  } else if (emailProvider === 'custom') {
    const emailEndpoint = process.env.EMAIL_WEBHOOK_URL;
    if (emailEndpoint) {
      await axios.post(emailEndpoint, {
        to,
        subject,
        html: htmlContent,
      });
    }
  }
}

async function sendViaMailService(
  to: string,
  subject: string,
  htmlContent: string
) {
  try {
    const mailEndpoint = process.env.MAIL_SERVICE_ENDPOINT || '/api/send-email';
    // This would integrate with SendGrid, Mailgun, or similar
    console.log(`Email queued: ${subject} to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
