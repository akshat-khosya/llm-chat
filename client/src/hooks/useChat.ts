import { useState, useEffect } from 'react';
import { sendMessage, getHistory, type ChatMessage } from '../api';
import { v4 as uuidv4 } from 'uuid';

export function useChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [sessionId, setSessionId] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const savedSessionId = localStorage.getItem('spur_chat_session_id');
        if (savedSessionId) {
            setSessionId(savedSessionId);
            loadHistory(savedSessionId);
        }
    }, []);

    const loadHistory = async (id: string) => {
        try {
            setIsLoading(true);
            const data = await getHistory(id);
            setMessages(data.history.map(msg => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                createdAt: msg.createdAt
            })));
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const send = async (text: string) => {
        if (!text.trim()) return;

        const tempId = uuidv4();
        const userMsg: ChatMessage = { id: tempId, role: 'user', content: text, createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);
        setError(null);

        try {
            const data = await sendMessage(text, sessionId);

            if (!sessionId || sessionId !== data.sessionId) {
                setSessionId(data.sessionId);
                localStorage.setItem('spur_chat_session_id', data.sessionId);
            }

            const aiMsg: ChatMessage = {
                id: uuidv4(),
                role: 'assistant',
                content: data.reply,
                createdAt: new Date().toISOString()
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (err: any) {
            setError(err.message || "Something went wrong.");
            // Rollback or show error message
            setMessages(prev => [...prev, {
                id: uuidv4(),
                role: 'assistant',
                content: "⚠️ Error: " + (err.message || "Failed to send message."),
                createdAt: new Date().toISOString()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const resetSession = () => {
        setSessionId(undefined);
        setMessages([]);
        localStorage.removeItem('spur_chat_session_id');
    };

    return { messages, isLoading, error, send, resetSession };
}
