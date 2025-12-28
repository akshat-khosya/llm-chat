import { Router } from 'express';
import { db } from '../db';
import { conversations, messages } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { chatMessageSchema } from '../utils/validation';
import { generateReply } from '../services/llm';
import rateLimit from 'express-rate-limit';

const router = Router();

const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { error: "Too many messages, please try again later." }
});

router.post('/message', chatLimiter, async (req, res) => {
    try {
        const parseResult = chatMessageSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.issues[0].message });
        }
        const { message, sessionId } = parseResult.data;

        let currentSessionId: string = sessionId || uuidv4();

        if (!sessionId) {
            await db.insert(conversations).values({ id: currentSessionId, title: 'New Chat' });
        } else {
            const exists = await db.select().from(conversations).where(eq(conversations.id, currentSessionId)).limit(1);
            if (exists.length === 0) {
                currentSessionId = uuidv4();
                await db.insert(conversations).values({ id: currentSessionId, title: 'New Chat' });
            }
        }

        await db.insert(messages).values({
            id: uuidv4(),
            conversationId: currentSessionId,
            role: 'user',
            content: message,
            createdAt: new Date(),
        });

        const aiReply = await generateReply(currentSessionId, message);

        await db.insert(messages).values({
            id: uuidv4(),
            conversationId: currentSessionId,
            role: 'assistant',
            content: aiReply,
            createdAt: new Date(),
        });

        return res.json({ reply: aiReply, sessionId: currentSessionId });

    } catch (error) {
        console.error('Chat Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const chatHistory = await db.select()
            .from(messages)
            .where(eq(messages.conversationId, sessionId))
            .orderBy(messages.createdAt);

        return res.json({ history: chatHistory });
    } catch (error) {
        console.error('History Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' })
    }
});

export default router;
