import { User, Sparkles } from 'lucide-react';
import { type ChatMessage } from '../api';

interface MessageBubbleProps {
    message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>

                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-blue-600' : 'bg-purple-600'}`}>
                    {isUser ? <User size={16} color="white" /> : <Sparkles size={16} color="white" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl text-sm md:text-base shadow-sm ${isUser
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                    }`}>
                    {message.content}
                </div>

            </div>
        </div>
    );
}
