"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, ChevronDown } from 'lucide-react';
import { Button, Input } from '@nexus/ui';
import { api } from '@/lib/api';

interface Message {
    id: number;
    user: string;
    text: string;
    time: string;
    isMe: boolean;
}

export default function CollaborationOverlay() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, user: 'System', text: 'Critical Alert: Station Alpha disconnected.', time: '10:42 AM', isMe: false },
        { id: 2, user: 'Sarah C.', text: 'I am dispatching the response unit now.', time: '10:43 AM', isMe: false },
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleOpen = () => setIsOpen(!isOpen);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now(),
            user: 'Me',
            text: inputValue,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        // Basic "Echo Bot" or AI integration using our Agent API
        // If the message starts with "@nexus" or just generally, we can reply
        try {
            // Simulate "typing" delay
            setTimeout(async () => {
                const response = await api.runAgentAnalysis({
                    chat_history: messages.map(m => `${m.user}: ${m.text}`).join('\n')
                }, `Answer this user question as a helpful enterprise assistant: "${inputValue}"`);

                const aiMsg: Message = {
                    id: Date.now() + 1,
                    user: 'Nexus AI',
                    text: response.insight || "I received your message and logged it to the operations center.",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isMe: false
                };
                setMessages(prev => [...prev, aiMsg]);
            }, 1000);
        } catch (e) {
            console.error("Chat Failed", e);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end pointer-events-none">

            {/* Chat Window */}
            {isOpen && (
                <div className="pointer-events-auto bg-white w-80 h-96 rounded-lg shadow-2xl border border-slate-200 flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
                    <div className="bg-slate-900 text-white p-3 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="font-semibold text-sm">Operations Channel</span>
                        </div>
                        <button onClick={toggleOpen} className="hover:bg-slate-700 rounded p-1">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`text-[10px] text-slate-500 mb-1 px-1 ${msg.isMe ? 'text-right' : 'text-left'}`}>
                                    {msg.isMe ? 'You' : msg.user} • {msg.time}
                                </div>
                                <div className={`max-w-[85%] rounded-lg p-2 text-sm ${msg.isMe
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0">
                        <input
                            className="flex-1 text-sm border bg-slate-50 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Type a message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 transition"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <div className="pointer-events-auto">
                <button
                    onClick={toggleOpen}
                    className={`shadow-lg transition-all duration-300 flex items-center gap-2 px-4 py-3 rounded-full font-semibold ${isOpen
                        ? 'bg-slate-800 text-white scale-0 opacity-0'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 scale-100 opacity-100 hover:scale-105'
                        }`}
                >
                    <MessageSquare size={20} />
                    <span>Team Chat</span>
                    <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">2</span>
                </button>
            </div>
        </div>
    );
}
