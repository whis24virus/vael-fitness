"use client";

import { useState } from "react";
import { ArrowLeft, Save, Repeat, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { db } from "@/lib/db";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function NewHabitPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
    const [targetCount, setTargetCount] = useState(1);

    const handleSave = async () => {
        if (!name) return;
        try {
            await db.habits.add({
                name,
                frequency,
                targetCount: frequency === 'weekly' ? targetCount : undefined,
                streak: 0,
                archived: false
            });
            router.push('/life');
        } catch (error) {
            console.error("Failed to create habit", error);
        }
    };

    return (
        <div className="min-h-screen pb-24 px-5 pt-8 max-w-md mx-auto bg-background">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/life">
                        <Button variant="ghost" size="icon" className="-ml-2 text-muted-foreground hover:text-white">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-white">New Habit</h1>
                </div>
                <Button
                    size="sm"
                    className="rounded-full bg-primary text-black hover:bg-primary/90 font-bold"
                    onClick={handleSave}
                    disabled={!name}
                >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                </Button>
            </header>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground tracking-wider uppercase pl-1">Habit Name</label>
                    <Input
                        placeholder="e.g. Read 10 pages"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-[#111111] border-none text-white text-lg h-14 focus-visible:ring-primary"
                        autoFocus
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground tracking-wider uppercase pl-1">Frequency</label>
                    <div className="grid grid-cols-2 gap-3">
                        <Card
                            className={cn(
                                "p-4 flex flex-col items-center justify-center gap-2 border-none cursor-pointer transition-colors",
                                frequency === 'daily' ? "bg-primary/10 text-primary ring-1 ring-primary" : "bg-[#111111] text-muted-foreground hover:bg-[#1a1a1a]"
                            )}
                            onClick={() => setFrequency('daily')}
                        >
                            <Repeat className="h-6 w-6" />
                            <span className="font-bold text-sm">Every Day</span>
                        </Card>
                        <Card
                            className={cn(
                                "p-4 flex flex-col items-center justify-center gap-2 border-none cursor-pointer transition-colors",
                                frequency === 'weekly' ? "bg-primary/10 text-primary ring-1 ring-primary" : "bg-[#111111] text-muted-foreground hover:bg-[#1a1a1a]"
                            )}
                            onClick={() => setFrequency('weekly')}
                        >
                            <Calendar className="h-6 w-6" />
                            <span className="font-bold text-sm">Weekly Goal</span>
                        </Card>
                    </div>
                </div>

                {frequency === 'weekly' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <label className="text-xs font-bold text-muted-foreground tracking-wider uppercase pl-1">Times per week</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(count => (
                                <button
                                    key={count}
                                    onClick={() => setTargetCount(count)}
                                    className={cn(
                                        "h-12 w-12 rounded-xl text-lg font-bold transition-all",
                                        targetCount === count ? "bg-primary text-black" : "bg-[#111111] text-muted-foreground hover:bg-[#1a1a1a]"
                                    )}
                                >
                                    {count}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
