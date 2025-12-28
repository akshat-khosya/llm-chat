import { Portkey } from 'portkey-ai';
import { db } from '../db';
import { messages } from '../db/schema';
import { eq } from 'drizzle-orm';

let portkeyConfig: any = {
    apiKey: process.env.PORTKEY_API_KEY,
    virtualKey: process.env.PORTKEY_VIRTUAL_KEY,
};

if (!process.env.PORTKEY_VIRTUAL_KEY) {
    if (!process.env.OPENAI_API_KEY) {
        console.error("CRITICAL ERROR: OPENAI_API_KEY is missing!");
    }
    portkeyConfig.provider = "openai";
    portkeyConfig.Authorization = `Bearer ${process.env.OPENAI_API_KEY}`;
}

portkeyConfig.config = {
    cache: {
        mode: "simple"
    }
};

const portkey = new Portkey(portkeyConfig);

const SYSTEM_PROMPT = `### ROLE
You are a helpful, polite, and professional customer support agent for "Spur Mart", an online retail store.

### CONTEXT
Spur Mart specializes in electronics and apparel, serving customers in the USA and India.

### KNOWLEDGE BASE
- **Shipping**: Free shipping on orders over $50 or ₹5,000. We ship exclusively to the USA and India.
- **Returns**: 30-day return policy for unused items in original packaging. The customer is responsible for return shipping costs.
- **Business Hours**: Monday to Friday, 9:00 AM - 5:00 PM EST.
- **Featured Products**:
    - Wireless Noise-Canceling Headphones: $99 / ₹8,000
    - Premium Cotton T-shirt (Black/White): $25 / ₹2,000
    - Smart Fitness Watch: $199 / ₹16,000
    - Eco-friendly Glass Water Bottle: $15 / ₹1,200

### RESPONSE GUIDELINES
1. **Conciseness**: Keep responses under 3 sentences.
2. **Tone**: Always remain professional and courteous.
3. **Fallback**: If a customer asks for information not listed above or if you are unsure, strictly respond with: "I'm not sure, please contact human support."
4. **Formatting**: Use clear and simple language.
5. **Greeting**: if the user sends a greeting, always respond with: "Hello! Welcome to Spur Mart, how can I help you today?".`;

export async function generateReply(conversationId: string, userMessage: string): Promise<string> {
    const history = await db.select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.createdAt)
        .limit(10);

    const formattedHistory = history.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
    }));

    try {
        const response = await portkey.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...formattedHistory,
                { role: 'user', content: userMessage }
            ],
            model: 'gpt-4o',
        });

        return String(response.choices[0]?.message?.content || "I apologize, I couldn't generate a response.");
    } catch (error) {
        console.error("LLM Error:", error);
        return "I'm having trouble connecting to my brain right now. Please try again later. (Check server logs for API Key issues)";
    }
}
