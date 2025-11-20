"use client";
import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, User, Bot, Sparkles, Briefcase, ChevronDown } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type Role = "admin" | "supply_chain" | "hr" | "it" | "sales";

interface Message {
    role: "user" | "model";
    content: string;
    tool_calls?: any[];
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role>("admin");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Convert frontend messages to backend history format
            const history = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await axios.post("http://localhost:8000/chat", {
                message: userMessage.content,
                role: selectedRole,
                history: history
            });

            const botMessage: Message = {
                role: "model",
                content: response.data.response,
                tool_calls: response.data.tool_calls
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) => [...prev, { role: "model", content: "Error: Could not connect to the agent. Please ensure the backend is running." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div className="w-[450px] h-[700px] bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-10 backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95">
                    {/* Header */}
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Nexus AI</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative group">
                                <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                    <Briefcase className="w-3 h-3 text-zinc-500" />
                                    <select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value as Role)}
                                        className="text-xs bg-transparent border-none p-0 text-zinc-700 dark:text-zinc-300 focus:ring-0 cursor-pointer appearance-none pr-4 font-medium"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="supply_chain">Supply Chain</option>
                                        <option value="hr">HR Manager</option>
                                        <option value="it">IT Admin</option>
                                        <option value="sales">Sales Rep</option>
                                    </select>
                                    <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-2 pointer-events-none" />
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-zinc-50/30 dark:bg-black/20 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-400 text-sm text-center px-8 space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center mb-2 shadow-inner">
                                    <Bot className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">Welcome to Nexus AI</p>
                                    <p className="text-xs text-zinc-500 max-w-[200px] mx-auto leading-relaxed">
                                        I can help you manage ERP, CRM, HRIS, and more based on your role.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 w-full max-w-[280px]">
                                    {["Check Inventory", "Show Open Tickets", "Sales Pipeline", "Employee Status"].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => setInput(suggestion)}
                                            className="text-[10px] px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-500 transition-all text-zinc-600 dark:text-zinc-400 shadow-sm"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={cn("flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                    msg.role === "user"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                                )}>
                                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                </div>
                                <div className={cn(
                                    "max-w-[85%] rounded-2xl p-4 text-sm shadow-sm",
                                    msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-tr-sm"
                                        : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-tl-sm"
                                )}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    {msg.tool_calls && msg.tool_calls.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-zinc-200/50 dark:border-zinc-700/50 space-y-2">
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                                <div className="w-1 h-1 rounded-full bg-blue-500" />
                                                Actions Performed
                                            </div>
                                            {msg.tool_calls.map((tool, tIdx) => (
                                                <div key={tIdx} className="text-xs font-mono bg-zinc-50 dark:bg-black/20 border border-zinc-100 dark:border-zinc-800 p-2 rounded-md text-zinc-600 dark:text-zinc-400 overflow-x-auto">
                                                    <span className="text-blue-600 dark:text-blue-400 font-semibold">{tool.name}</span>
                                                    <span className="opacity-50 mx-1">→</span>
                                                    <span className="opacity-70">{JSON.stringify(tool.result || tool.args).slice(0, 50)}...</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-sm">
                                    <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                                </div>
                                <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl rounded-tl-sm p-4 flex items-center gap-1.5 shadow-sm">
                                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="flex gap-2 items-center bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                placeholder="Ask anything..."
                                className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-500"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading || !input.trim()}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="text-[10px] text-center mt-2 text-zinc-400 dark:text-zinc-600">
                            Powered by Gemini 1.5 Flash & Nexus RAG Engine
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl shadow-blue-600/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900 animate-pulse" />
                )}
            </button>
        </div>
    );
}
