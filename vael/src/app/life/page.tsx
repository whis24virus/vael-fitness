"use client";

import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Habit } from "@/lib/db";
import { format } from "date-fns";
import { Sun, Moon, Battery, Activity, Plus, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function LifePage() {
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // Fetch today's log
    const todayLog = useLiveQuery(
        () => db.daily_logs.where('date').equals(todayStr).first(),
        [todayStr]
    );

    const habits = useLiveQuery(() => db.habits.toArray());

    // Quick check for habit completion for today
    // In a real app, we'd store completion dates in a separate table or array on the habit
    // For MVP, we'll store completed habit IDs in the daily log
    const completedHabitIds = todayLog?.habitsCompleted || [];

    const toggleHabit = async (habitId: number) => {
        const currentCompleted = new Set(completedHabitIds);
        if (currentCompleted.has(habitId)) {
            currentCompleted.delete(habitId);
        } else {
            currentCompleted.add(habitId);
        }

        const newCompletedList = Array.from(currentCompleted);

        if (todayLog) {
            await db.daily_logs.update(todayLog.id!, { habitsCompleted: newCompletedList });
        } else {
            await db.daily_logs.add({
                date: todayStr,
                habitsCompleted: newCompletedList
            });
        }
    };

    return (
        <div className="min-h-screen pb-24 px-5 pt-8 max-w-md mx-auto bg-background relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <header className="flex justify-between items-end mb-8 relative z-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Life</h1>
                    <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMMM d')}</p>
                </div>
                <Link href="/life/journal">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-transparent p-0">
                        Journal
                    </Button>
                </Link>
            </header>

            {/* Daily Snapshot */}
            <section className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-semibold text-white">Today's Snapshot</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Sleep Card */}
                    <Card className="bg-[#111111] border-none p-5 flex flex-col gap-3 hover:bg-[#1a1a1a] transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-50"><Moon className="h-12 w-12 text-indigo-500/20" /></div>
                        <div className="flex items-center gap-2 text-indigo-400">
                            <Moon className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Sleep</span>
                        </div>
                        <div>
                            <span className="text-2xl font-bold text-white">{todayLog?.sleepHours || "--"}</span>
                            <span className="text-sm text-muted-foreground ml-1">hrs</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="h-1 w-full bg-zinc-800 rounded-full mt-1">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(((todayLog?.sleepHours || 0) / 8) * 100, 100)}%` }} />
                        </div>
                    </Card>

                    {/* Mood/Energy Card */}
                    <Card className="bg-[#111111] border-none p-5 flex flex-col gap-3 hover:bg-[#1a1a1a] transition-colors relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-50"><Sun className="h-12 w-12 text-amber-500/20" /></div>
                        <div className="flex items-center gap-2 text-amber-400">
                            <Battery className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Energy</span>
                        </div>
                        <div>
                            <span className="text-2xl font-bold text-white">{todayLog?.energy || "--"}</span>
                            <span className="text-sm text-muted-foreground ml-1">/ 10</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="h-1 w-full bg-zinc-800 rounded-full mt-1">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${((todayLog?.energy || 0) / 10) * 100}%` }} />
                        </div>
                    </Card>
                </div>

                {!todayLog && (
                    <Link href="/life/check-in">
                        <Button className="w-full mt-4 bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20">
                            Complete Daily Check-in
                        </Button>
                    </Link>
                )}
            </section>

            {/* Habits */}
            <section className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-semibold text-white">Habits</h3>
                    <Link href="/life/habits/new">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                            <Plus className="h-5 w-5" />
                        </Button>
                    </Link>
                </div>

                <div className="space-y-3">
                    {habits?.map(habit => {
                        const isCompleted = completedHabitIds.includes(habit.id!);
                        return (
                            <Card
                                key={habit.id}
                                className={cn(
                                    "border-none p-4 flex items-center justify-between transition-all cursor-pointer",
                                    isCompleted ? "bg-primary/10" : "bg-[#111111] hover:bg-[#1a1a1a]"
                                )}
                                onClick={() => toggleHabit(habit.id!)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                        isCompleted ? "bg-primary border-primary" : "border-zinc-700"
                                    )}>
                                        {isCompleted && <Check className="h-3 w-3 text-black" />}
                                    </div>
                                    <span className={cn(
                                        "font-medium transition-colors",
                                        isCompleted ? "text-primary line-through decoration-primary/50" : "text-white"
                                    )}>{habit.name}</span>
                                </div>

                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Activity className="h-3 w-3" />
                                    <span>{habit.streak}</span>
                                </div>
                            </Card>
                        )
                    })}

                    {(!habits || habits.length === 0) && (
                        <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl bg-[#111111]/50">
                            <p className="text-sm text-muted-foreground mb-3">No habits tracked yet.</p>
                            <Link href="/life/habits/new">
                                <Button size="sm" variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
                                    Create First Habit
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            <BottomNav />
        </div>
    );
}
