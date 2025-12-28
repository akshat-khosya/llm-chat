const API_URL = 'http://localhost:3000';

export interface ChatMessage {
    id?: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt?: string;
}

export interface ChatResponse {
    reply: string;
    sessionId: string;
}

export interface HistoryResponse {
    history: {
        id: string;
        conversationId: string;
        role: 'user' | 'assistant';
        content: string;
        createdAt: string;
    }[];
}

export async function sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    const response = await fetch(`${API_URL}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
    }

    return response.json();
}

export async function getHistory(sessionId: string): Promise<HistoryResponse> {
    const response = await fetch(`${API_URL}/chat/${sessionId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch history');
    }
    return response.json();
}
