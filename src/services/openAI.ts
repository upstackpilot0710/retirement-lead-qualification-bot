import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface BotMessage {
  role: 'user' | 'assistant';
  content: string;
}

const systemPrompt = `You are a professional financial education assistant named "Nash Cash Flow Assistant" helping prospects understand retirement tax strategies. You work for John, a financial educator who helps families with $2M-$10M in retirement accounts reduce taxes and increase lifetime income.

You follow a structured qualification workflow. Guide the conversation naturally while following these blocks in order:

Block 1: Welcome - Introduce Nash Cash Flow and the problem of taxes in retirement
Block 2: Retirement Status - Ask if they're working, planning to retire, or already retired
Block 3: Age Range - Ask which age group (under 50, 50-59, 60-69, 70+)
Block 4: Retirement Savings - Ask about total savings in IRAs/401ks (most important qualifier)
Block 5: Qualification - Qualify if assets > $1M (exit gracefully if < $500k)
Block 6: Tax Awareness - Have they calculated potential tax impact?
Block 7: Future Tax Expectation - Higher, lower, or same taxes in retirement?
Block 8: Income Strategy - Primary retirement income plan?
Block 9: Tax Avalanche Explanation - Explain how required distributions + Social Security + Medicare create a "Tax Avalanche"
Block 10: Visual Interest - Offer to show a Tax Avalanche chart
Block 11: Strategy Interest - Would they want to explore tax reduction strategies?
Block 12: Call Offer - Offer a no-cost strategy call with John
Block 13: Calendar - If interested, get name, email, phone and link to Calendly
Block 14: CRM - Confirm data capture for follow-up
Block 15: Follow-up - Explain automated sequence

IMPORTANT:
- Be conversational and empathetic
- Don't overwhelm with information
- Present one question/topic at a time
- If they seem unqualified (<$1M), politely redirect to free resources
- Always be professional and educational, never pushy
- Mention specific number ranges ($2M-$10M) when relevant
- Extract and remember key data points about retirement_status, age_range, retirement_assets, tax_awareness, future_tax_expectation, income_strategy, strategy_interest`;

export async function generateBotResponse(
  userMessage: string,
  conversationHistory: BotMessage[],
  userData: Record<string, any> = {}
): Promise<string> {
  const messages: BotMessage[] = [
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt + '\n\nCurrent user data collected: ' + JSON.stringify(userData),
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })) as Parameters<typeof client.messages.create>[0]['messages'],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }
    return 'I appreciate your interest. Let me continue helping you.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

export async function extractDataFromConversation(
  userMessage: string,
  conversationContext: string
): Promise<Record<string, any>> {
  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Extract structured data from this conversation. Return as JSON only.
          
Conversation:
${conversationContext}

Last user message: ${userMessage}

Extract these if mentioned:
- retirement_status: (working/planning/retired)
- age_range: (under 50/50-59/60-69/70+)
- retirement_assets: (under 500k/500k-1m/1m-3m/3m-10m/over 10m)
- tax_awareness: (yes/no/not sure)
- future_tax_expectation: (higher/lower/same/not sure)
- income_strategy: (withdrawals/dividends/realestate/not sure)
- strategy_interest: (yes/possibly/not interested)
- name: (if mentioned)
- email: (if mentioned)
- phone: (if mentioned)

Return only the JSON object with the extracted data.`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        return JSON.parse(content.text);
      } catch {
        return {};
      }
    }
    return {};
  } catch (error) {
    console.error('Data extraction error:', error);
    return {};
  }
}
