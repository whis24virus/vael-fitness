"use client";

import { X, ChevronRight, Plus, Minus, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RestTimerPage() {
    const timeLeft = 90; // 1:30
    const totalTime = 90;
    const progress = (timeLeft / totalTime) * 100;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
            {/* Top right options */}
            <div className="absolute top-8 right-5 text-muted-foreground">
                <MoreOptionsDots />
            </div>

            {/* Header Info */}
            <div className="absolute top-20 left-0 right-0 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <DumbbellIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Set 3 Complete</span>
                </div>
            </div>

            {/* Main Timer */}
            <div className="relative w-80 h-80 flex items-center justify-center mb-12">
                {/* Progress Ring */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="160"
                        cy="160"
                        r="140"
                        fill="transparent"
                        stroke="#27272A"
                        strokeWidth="2"
                    />
                    <circle
                        cx="160"
                        cy="160"
                        r="140"
                        fill="transparent"
                        stroke="#A78BFA"
                        strokeWidth="6"
                        strokeLinecap="round"
                        style={{
                            strokeDasharray: 2 * Math.PI * 140,
                            strokeDashoffset: 2 * Math.PI * 140 - (progress / 100) * (2 * Math.PI * 140),
                            transition: "stroke-dashoffset 1s linear",
                        }}
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-8xl font-bold tracking-tighter text-white font-mono">1:30</span>
                    <span className="text-sm font-bold text-primary/80 mt-2 uppercase tracking-[0.2em] animate-pulse">Resting</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-8 mb-16">
                <div className="flex flex-col items-center gap-2">
                    <Button variant="outline" size="icon" className="h-16 w-16 rounded-full border-none bg-[#111111] hover:bg-[#1a1a1a] text-white">
                        <Minus className="h-6 w-6" />
                    </Button>
                    <span className="text-[10px] font-medium text-muted-foreground">-30s</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <Button variant="outline" size="icon" className="h-16 w-16 rounded-full border-none bg-[#111111] hover:bg-[#1a1a1a] text-white">
                        <Plus className="h-6 w-6" />
                    </Button>
                    <span className="text-[10px] font-medium text-muted-foreground">+30s</span>
                </div>
            </div>

            {/* Primary Action */}
            <Link href="/train/active">
                <Button variant="outline" className="rounded-full px-8 py-6 border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white group">
                    <span className="mr-2 font-bold tracking-widest text-xs uppercase">Skip Rest</span>
                    <SkipForward className="h-4 w-4 fill-white group-hover:translate-x-1 transition-transform" />
                </Button>
            </Link>

            {/* Up Next */}
            <div className="absolute bottom-12 flex items-center gap-3 bg-[#111111] pl-4 pr-6 py-3 rounded-lg border border-white/5">
                <div className="h-10 w-10 rounded bg-secondary/30 flex items-center justify-center">
                    <DumbbellIcon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-0.5">Up Next</span>
                    <span className="text-sm text-white font-medium">Barbell Bench Press</span>
                </div>
            </div>
        </div>
    );
}

function DumbbellIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14.4 14.4 9.6 9.6" />
            <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" />
            <path d="m21.5 21.5-1.4-1.4" />
            <path d="M3.9 3.9 2.5 2.5" />
            <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.767 1.768a2 2 0 1 1 2.829 2.829z" />
        </svg>
    )
}

function MoreOptionsDots() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
    )
}
