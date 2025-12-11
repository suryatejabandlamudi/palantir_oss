"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Users, Hash, Bot, Mic, Paperclip, MoreHorizontal, Phone, Video } from 'lucide-react';
import { usePathname } from 'next/navigation';

// Mock Channels
const CHANNELS = [
    { id: 'general', name: 'General', type: 'public' },
    { id: 'ops', name: 'Operations', type: 'public' },
    { id: 'sales', name: 'Sales-Win-Room', type: 'private' },
    { id: 'incidents', name: 'Incident-Response', type: 'alert' },
];

interface Message {
    id: number;
    user: string;
    avatar?: string;
    text: string;
    time: string;
    isMe: boolean;
    isAi?: boolean;
    attachments?: string[];
}

export default function NexusConnect() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [activeChannel, setActiveChannel] = useState('general');
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, user: 'System', text: 'Nexus OS v2.4 initialized.', time: '08:00 AM', isMe: false, isAi: true },
        { id: 2, user: 'Sarah Chen', text: 'Has anyone checked the SAP connector status?', time: '09:12 AM', isMe: false, avatar: 'SC' },
        { id: 3, user: 'System', text: 'SAP Gateway is HEALTHY. Latency: 45ms.', time: '09:12 AM', isMe: false, isAi: true },
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    // Context Awareness Message
    useEffect(() => {
        if (isOpen) {
            let contextMsg = "";
            if (pathname.includes("/erp")) contextMsg = "Viewing ERP Dashboard. Context: SAP S/4HANA.";
            if (pathname.includes("/crm")) contextMsg = "Viewing CRM Pipeline. Context: Salesforce.";
            if (pathname.includes("/apollo")) contextMsg = "Viewing Deployment Pipelines. Context: Apollo.";

            if (contextMsg) {
                // Don't duplicate context messages
                setMessages(prev => {
                    if (prev[prev.length - 1].text === contextMsg) return prev;
                    return [...prev, {
                        id: Date.now(),
                        user: 'Nexus AI',
                        text: contextMsg,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        isMe: false,
                        isAi: true
                    }];
                });
            }
        }
    }, [pathname, isOpen]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newMsg: Message = {
            id: Date.now(),
            user: 'You',
            text: inputValue,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };

        setMessages(prev => [...prev, newMsg]);
        setInputValue('');

        // AI Reply Simulation
        if (inputValue.toLowerCase().includes('@nexus') || inputValue.toLowerCase().includes('status')) {
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    user: 'Nexus AI',
                    text: "I'm analyzing the system state... All systems operational. No active anomalies detected in current context.",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isMe: false,
                    isAi: true
                }]);
            }, 1000);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none font-sans">

            {/* Main Window */}
            {isOpen && (
                <div className="pointer-events-auto bg-[#1C1F26] w-[450px] h-[600px] rounded-xl shadow-2xl border border-white/10 flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">

                    {/* Header */}
                    <div className="bg-[#111418] p-4 border-b border-white/5 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-sm">Nexus Connect</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs text-zinc-400">Online • 142 Active</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                <Video className="w-4 h-4" />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar (Channels) */}
                        <div className="w-16 bg-[#16191F] border-r border-white/5 flex flex-col items-center py-4 gap-3 shrink-0">
                            {CHANNELS.map(ch => (
                                <button
                                    key={ch.id}
                                    onClick={() => setActiveChannel(ch.id)}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all
                                        ${activeChannel === ch.id
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                            : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
                                        }`}
                                    title={ch.name}
                                >
                                    <Hash className="w-5 h-5" />
                                </button>
                            ))}
                            <div className="h-px w-8 bg-white/5 my-1" />
                            <button className="w-10 h-10 rounded-full bg-white/5 text-zinc-400 hover:text-white flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 flex flex-col bg-[#0F1115]">
                            {/* Channel Header */}
                            <div className="h-10 border-b border-white/5 flex items-center px-4 text-xs font-medium text-zinc-500">
                                # {CHANNELS.find(c => c.id === activeChannel)?.name}
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                                        {!msg.isMe && (
                                            msg.isAi ? (
                                                <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                                                    <Bot className="w-4 h-4 text-purple-400" />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0">
                                                    {msg.avatar || msg.user[0]}
                                                </div>
                                            )
                                        )}

                                        <div className={`flex flex-col max-w-[80%] ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[11px] font-semibold text-zinc-400">{msg.user}</span>
                                                <span className="text-[10px] text-zinc-600">{msg.time}</span>
                                            </div>
                                            <div className={`p-3 text-sm rounded-2xl shadow-sm leading-relaxed
                                                ${msg.isMe
                                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                                    : msg.isAi
                                                        ? 'bg-purple-900/10 border border-purple-500/20 text-purple-100 rounded-tl-none'
                                                        : 'bg-[#1C1F26] border border-white/5 text-zinc-200 rounded-tl-none'
                                                }`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-[#111418] border-t border-white/5">
                                <div className="flex items-center gap-2 bg-[#1C1F26] border border-white/10 rounded-xl p-2 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                                    <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                                        <Paperclip className="w-4 h-4" />
                                    </button>
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder={`Message #${CHANNELS.find(c => c.id === activeChannel)?.name}...`}
                                        className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder:text-zinc-600"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!inputValue.trim()}
                                        className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Trigger */}
            <div className="pointer-events-auto">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`group relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 border border-white/10
                        ${isOpen
                            ? 'bg-[#1C1F26] text-zinc-400 rotate-90 hover:text-white hover:bg-[#252a33]'
                            : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 hover:shadow-blue-500/25'
                        }`}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}

                    {!isOpen && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-[#050505] flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">3</span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}
