import { useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { InputArea } from './InputArea';
import { PlusCircle } from 'lucide-react';

export function ChatWindow() {
    const { messages, isLoading, send, resetSession } = useChat();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-100 p-4 shadow-sm z-10 relative">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <h1 className="font-semibold text-gray-800">Spur Support Agent</h1>
                </div>
                <button
                    onClick={resetSession}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-colors"
                    title="Start New Chat"
                >
                    <PlusCircle size={24} />
                </button>
            </header>

            < div className="flex-1 overflow-y-auto p-4 scroll-smooth" >
                <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-end">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-400 my-auto pb-20">
                            <p className="text-lg font-medium mb-2">👋 Welcome!</p>
                            <p>Ask me anything about our shipping policies or products.</p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} />
                    ))}

                    {isLoading && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm ml-12 mb-4">
                            <span className="animate-bounce">•</span>
                            <span className="animate-bounce delay-75">•</span>
                            <span className="animate-bounce delay-150">•</span>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            </div >

            < InputArea onSend={send} disabled={isLoading} />
        </div >
    );
}
