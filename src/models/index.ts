import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  sessionId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  age_range: string | null;
  retirement_status: string | null;
  retirement_assets: string | null;
  tax_awareness: string | null;
  future_tax_expectation: string | null;
  income_strategy: string | null;
  strategy_interest: string | null;
  qualified: boolean;
  calendarBooked: boolean;
  calendlyLink: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    sessionId: { type: String, required: true, unique: true },
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
    qualified: { type: Boolean, default: false },
    calendarBooked: { type: Boolean, default: false },
    calendlyLink: String,
  },
  { timestamps: true }
);

export const Lead = mongoose.model<ILead>('Lead', leadSchema);

export interface IConversation extends Document {
  sessionId: string;
  messages: Array<{ role: string; content: string; timestamp: Date }>;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    sessionId: { type: String, required: true, unique: true },
    messages: [
      {
        role: String,
        content: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Conversation = mongoose.model<IConversation>(
  'Conversation',
  conversationSchema
);

export interface IFollowUp extends Document {
  leadId: string;
  email: string;
  type: 'visual' | 'video' | 'call_invitation';
  scheduledFor: Date;
  sent: boolean;
  sentAt: Date | null;
  createdAt: Date;
}

const followUpSchema = new Schema<IFollowUp>(
  {
    leadId: { type: String, required: true },
    email: { type: String, required: true },
    type: { type: String, enum: ['visual', 'video', 'call_invitation'] },
    scheduledFor: { type: Date, required: true },
    sent: { type: Boolean, default: false },
    sentAt: Date,
  },
  { timestamps: true }
);

export const FollowUp = mongoose.model<IFollowUp>('FollowUp', followUpSchema);
