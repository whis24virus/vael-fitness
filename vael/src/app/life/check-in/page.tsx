"use client";

import { useState } from "react";
import { ArrowLeft, Save, Moon, Sun, Frown, Meh, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";
import { db } from "@/lib/db";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function DailyCheckInPage() {
    const router = useRouter();
    const [sleepHours, setSleepHours] = useState([7]);
    const [energy, setEnergy] = useState([5]);
    const [mood, setMood] = useState<number | null>(null);
    const [soreness, setSoreness] = useState<string[]>([]);
    const [notes, setNotes] = useState("");

    const handleSave = async () => {
        try {
            const todayStr = format(new Date(), 'yyyy-MM-dd');

            // Check if entry exists to update or add
            const existing = await db.daily_logs.where('date').equals(todayStr).first();

            if (existing) {
                await db.daily_logs.update(existing.id!, {
                    sleepHours: sleepHours[0],
                    energy: energy[0],
                    mood: mood || 3,
                    soreness,
                    notes
                });
            } else {
                await db.daily_logs.add({
                    date: todayStr,
                    sleepHours: sleepHours[0],
                    energy: energy[0],
                    mood: mood || 3,
                    soreness,
                    notes,
                    habitsCompleted: []
                });
            }
            router.push('/life');
        } catch (error) {
            console.error("Failed to save log", error);
        }
    };

    const toggleSoreness = (muscle: string) => {
        if (soreness.includes(muscle)) {
            setSoreness(soreness.filter(m => m !== muscle));
        } else {
            setSoreness([...soreness, muscle]);
        }
    };

    const muscles = ["Legs", "Back", "Chest", "Arms", "Shoulders", "Core"];

    return (
        <div className="min-h-screen pb-24 px-5 pt-8 max-w-md mx-auto bg-background">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/life">
                        <Button variant="ghost" size="icon" className="-ml-2 text-muted-foreground hover:text-white">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Daily Check-in</h1>
                </div>
                <Button
                    size="sm"
                    className="rounded-full bg-primary text-black hover:bg-primary/90 font-bold"
                    onClick={handleSave}
                >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                </Button>
            </header>

            <div className="space-y-8">
                {/* Sleep */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Moon className="h-5 w-5 text-indigo-400" />
                        <h3 className="font-bold text-white">Sleep</h3>
                    </div>
                    <Card className="bg-[#111111] border-none p-6">
                        <div className="text-center mb-6">
                            <span className="text-4xl font-bold text-white">{sleepHours[0]}</span>
                            <span className="text-muted-foreground ml-2">hours</span>
                        </div>
                        <Slider
                            value={sleepHours}
                            onValueChange={setSleepHours}
                            max={12}
                            step={0.5}
                            className="py-4"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>4h</span>
                            <span>8h</span>
                            <span>12h</span>
                        </div>
                    </Card>
                </section>

                {/* Energy & Mood */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Sun className="h-5 w-5 text-amber-400" />
                        <h3 className="font-bold text-white">Energy & Mood</h3>
                    </div>
                    <Card className="bg-[#111111] border-none p-6 space-y-8">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Energy Level</label>
                            <Slider
                                value={energy}
                                onValueChange={setEnergy}
                                max={10}
                                step={1}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Low</span>
                                <span>High</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mood</label>
                            <div className="flex justify-between px-2">
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setMood(level)}
                                        className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center text-xl transition-all",
                                            mood === level ? "bg-primary text-black scale-110" : "bg-zinc-800 text-muted-foreground hover:bg-zinc-700"
                                        )}
                                    >
                                        {level === 1 && <Frown className="h-5 w-5" />}
                                        {level === 3 && <Meh className="h-5 w-5" />}
                                        {level === 5 && <Smile className="h-5 w-5" />}
                                        {(level === 2 || level === 4) && <span className="text-sm font-bold">{level}</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>
                </section>

                {/* Soreness */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-5 w-5 rounded-full border-2 border-red-400 flex items-center justify-center">
                            <div className="h-2 w-2 bg-red-400 rounded-full" />
                        </div>
                        <h3 className="font-bold text-white">Soreness</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {muscles.map(muscle => (
                            <button
                                key={muscle}
                                onClick={() => toggleSoreness(muscle)}
                                className={cn(
                                    "py-3 rounded-xl text-sm font-medium transition-colors border",
                                    soreness.includes(muscle)
                                        ? "bg-red-500/10 border-red-500/50 text-red-400"
                                        : "bg-[#111111] border-transparent text-muted-foreground hover:bg-[#1a1a1a]"
                                )}
                            >
                                {muscle}
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
