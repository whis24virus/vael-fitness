"use client";

import { Bell, Dumbbell, Play, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BottomNav } from "@/components/BottomNav";
import Link from "next/link";

export default function HomePage() {
  const readinessScore = 85;
  // const circumference = 2 * Math.PI * 45; // radius 45 - unused variable
  // const strokeDashoffset = circumference - (readinessScore / 100) * circumference; - unused variable

  return (
    <div className="min-h-screen pb-24 px-5 pt-8 max-w-md mx-auto relative overflow-hidden">
      {/* Dynamic Glow Background */}
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <h2 className="text-sm text-muted-foreground font-medium mb-1">GOOD MORNING</h2>
          <h1 className="text-3xl font-bold tracking-tight text-white">Keshav</h1>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary/30 text-muted-foreground">
          <Bell className="h-5 w-5" />
        </Button>
      </header>

      {/* Readiness Ring */}
      <section className="flex flex-col items-center justify-center mb-10 relative z-10">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Background Ring */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="110" // Outer glow ring radius
              fill="transparent"
              stroke="currentColor"
              strokeWidth="1"
              className="text-secondary/30"
            />
            <circle
              cx="128"
              cy="128"
              r="90" // Inner progress ring radius
              fill="transparent"
              stroke="currentColor"
              strokeWidth="4"
              className="text-secondary"
            />
            {/* Progress Ring */}
            <circle
              cx="128"
              cy="128"
              r="90"
              fill="transparent"
              stroke="url(#gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              style={{
                strokeDasharray: 2 * Math.PI * 90,
                strokeDashoffset: 2 * Math.PI * 90 - (readinessScore / 100) * (2 * Math.PI * 90),
                transition: "stroke-dashoffset 1s ease-in-out",
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-bold tracking-tighter text-white">{readinessScore}</span>
            <span className="text-sm font-medium text-primary mt-1 uppercase tracking-wider">Ready</span>
          </div>
        </div>
        <p className="text-center text-muted-foreground text-sm mt-4">Recovery is optimal. Push hard today.</p>
      </section>

      {/* Mood Check */}
      <section className="mb-10 relative z-10">
        <h3 className="text-base font-semibold text-white mb-4">How do you feel?</h3>
        <div className="flex justify-between gap-2">
          {["😫", "😕", "😐", "🙂", "🤩"].map((emoji, i) => (
            <button
              key={i}
              className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center text-2xl bg-secondary/30 hover:bg-secondary transition-all active:scale-95",
                i === 3 && "bg-primary/20 ring-1 ring-primary" // Default selected for demo
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
      </section>

      {/* Today's Workout */}
      <section className="mb-10 relative z-10">
        <h3 className="text-base font-semibold text-white mb-4">Today's Workout</h3>
        <Card className="p-0 overflow-hidden group cursor-pointer border-none bg-[#111111]">
          <div className="p-6 relative">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="text-muted-foreground" />
            </div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Strength</span>
                <h4 className="text-2xl font-bold text-white mb-1">Leg Day</h4>
                <p className="text-sm text-muted-foreground">45 min • High Intensity</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-[#111111] bg-zinc-800" />
                ))}
                <div className="h-8 w-8 rounded-full border-2 border-[#111111] bg-secondary flex items-center justify-center text-[10px] font-bold text-white pl-1">
                  +4
                </div>
              </div>
              <Link href="/train/active">
                <Button className="rounded-full px-6 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                  Begin
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>

      {/* Weekly Activity */}
      <section className="mb-8 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold text-white">This week</h3>
          <span className="text-xs text-primary font-medium">4/7 Completed</span>
        </div>
        <div className="bg-[#111111] rounded-2xl p-5 flex justify-between items-center">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              {/* Indicator Dot */}
              <div className={cn(
                "h-1.5 w-1.5 rounded-full mb-1",
                i < 3 ? "bg-primary" : "bg-transparent"
              )} />

              <span className="text-[10px] text-muted-foreground font-medium">{day}</span>

              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-xs transition-all",
                i < 3 ? "bg-primary text-white" :
                  i === 3 ? "ring-2 ring-primary bg-transparent text-white" :
                    "bg-secondary/30 text-muted-foreground"
              )}>
                {i < 3 && "✓"}
                {i === 3 && <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Nav Component */}
      <BottomNav />
    </div>
  );
}
