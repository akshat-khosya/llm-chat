import React, { useState, useRef, useEffect, Suspense } from 'react';
import { SendHorizontal, Smile } from 'lucide-react';
import type { EmojiClickData } from 'emoji-picker-react';

const EmojiPicker = React.lazy(() => import('emoji-picker-react'));

interface InputAreaProps {
    onSend: (text: string) => void;
    disabled: boolean;
}

export function InputArea({ onSend, disabled }: InputAreaProps) {
    const [text, setText] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!text.trim() || disabled) return;
        onSend(text);
        setText('');
        setShowPicker(false);

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setText(prev => prev + emojiData.emoji);
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [text]);

    return (
        <div className="bg-white border-t border-gray-100 p-4 relative">
            <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-3xl p-2 px-4 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                {showPicker && (
                    <div className="absolute bottom-full left-0 mb-2 z-20 shadow-xl rounded-2xl" ref={pickerRef}>
                        <Suspense fallback={<div className="w-[300px] h-[400px] bg-white rounded-2xl flex items-center justify-center text-gray-400">Loading emojis...</div>}>
                            <EmojiPicker
                                onEmojiClick={onEmojiClick}
                                width={300}
                                height={400}
                            />
                        </Suspense>
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setShowPicker(!showPicker)}
                    className="mb-1 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <Smile size={24} />
                </button>

                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full bg-transparent border-none outline-none resize-none py-3 max-h-32 text-gray-800 placeholder:text-gray-400"
                />

                <button
                    type="submit"
                    disabled={!text.trim() || disabled}
                    className="mb-1 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <SendHorizontal size={20} />
                </button>
            </form>
        </div>
    );
}
