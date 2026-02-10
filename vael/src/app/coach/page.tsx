"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Mic, ArrowUp, Sparkles, Dumbbell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    sender: 'coach' | 'user';
    text: string;
    timestamp: Date;
}

export default function CoachPage() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch User Context
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayLog = useLiveQuery(() => db.daily_logs.where('date').equals(todayStr).first());
    const lastWorkout = useLiveQuery(() => db.workouts.orderBy('startTime').reverse().first());

    // Initial Greeting Effect
    useEffect(() => {
        if (messages.length === 0 && !isTyping) {
            generateGreeting();
        }
    }, [todayLog, lastWorkout]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const generateGreeting = async () => {
        setIsTyping(true);
        // Simulate thinking
        await new Promise(r => setTimeout(r, 1500));

        let greeting = "Good morning, Keshav.";
        let advice = "Build your momentum today.";

        // Logic based on data
        if (todayLog) {
            if (todayLog.sleepHours && todayLog.sleepHours < 6) {
                greeting += ` I see you only got ${todayLog.sleepHours}h of sleep.`;
                advice = "Let's focus on recovery or light cardio today. Your nervous system needs a break.";
            } else if (todayLog.mood && todayLog.mood <= 2) {
                greeting += " I noticed your mood is low today.";
                advice = "Exercise is great for mental health, but don't push too hard. Maybe a walk or yoga?";
            } else {
                greeting += " Your recovery looks solid.";
                advice = "You're primed for a PR attempt today! Let's hit the weights.";
            }
        } else {
            greeting += " Don't forget to log your Daily Check-in.";
        }

        // Add Last Workout Context
        if (lastWorkout) {
            const daysSince = Math.floor((new Date().getTime() - new Date(lastWorkout.startTime).getTime()) / (1000 * 3600 * 24));
            if (daysSince > 3) {
                advice += ` It's been ${daysSince} days since your last session. Time to get back in!`;
            }
        }

        setMessages([
            { id: '1', sender: 'coach', text: greeting, timestamp: new Date() },
            { id: '2', sender: 'coach', text: advice, timestamp: new Date() }
        ]);
        setIsTyping(false);
    };

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            sender: "user",
            text: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
            const response = await fetch(`${API_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage.text }),
            });

            if (!response.ok) throw new Error("Failed to get response");

            const data = await response.json();

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: "coach",
                text: data.reply,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMessage]);

        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: "coach",
                text: "I'm having trouble connecting to my neural network. Check the backend connection.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="min-h-screen pb-24 px-5 pt-8 max-w-md mx-auto bg-background flex flex-col">
            <header className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <h1 className="text-lg font-bold tracking-tight text-white">Coach</h1>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto scrollbar-hide mb-4 pr-1" ref={scrollRef}>
                <div className="text-center text-xs text-muted-foreground my-4">Today, {format(new Date(), 'h:mm a')}</div>

                {messages.map((msg, i) => (
                    <div key={msg.id} className={cn("flex gap-3", msg.sender === 'user' ? "flex-row-reverse" : "")}>
                        {msg.sender === 'coach' && (
                            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                                <Sparkles className="h-4 w-4 text-primary" />
                            </div>
                        )}
                        {msg.sender === 'user' && (
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-zinc-800 text-xs">KM</AvatarFallback>
                            </Avatar>
                        )}

                        <div className={cn(
                            "p-4 rounded-2xl text-sm leading-relaxed max-w-[85%]",
                            msg.sender === 'coach' ? "bg-[#111111] text-foreground rounded-tl-none" : "bg-primary text-black font-medium rounded-tr-none"
                        )}>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                            <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <div className="bg-[#111111] px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1 w-16">
                            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
                            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="mt-auto">
                <div className="relative">
                    <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                        <Plus className="h-5 w-5" />
                    </Button>
                    <Input
                        className="pl-12 pr-12 h-14 rounded-full bg-[#111111] border-none text-base focus-visible:ring-1 focus-visible:ring-primary text-white"
                        placeholder="Ask Coach..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <Button
                            size="icon"
                            className="h-10 w-10 rounded-full bg-primary text-black hover:bg-primary/90"
                            onClick={handleSendMessage}
                            disabled={!input.trim()}
                        >
                            <ArrowUp className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
