"use client";

import { ChevronLeft, TrendingUp, Scale, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useMemo, useState } from "react";
import { format, subDays, isSameDay, startOfDay } from "date-fns";

export default function AnalyticsPage() {
    const [selectedExerciseId, setSelectedExerciseId] = useState(1); // Default to Squat

    // Fetch all sets for volume calculation
    const allSets = useLiveQuery(() => db.sets.toArray());
    const exercises = useLiveQuery(() => db.exercises.toArray());

    // Calculate Volume Load (Last 7 Days)
    const volumeData = useMemo(() => {
        if (!allSets) return Array(7).fill(0);

        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = subDays(new Date(), 6 - i);
            return startOfDay(d);
        });

        return last7Days.map(date => {
            const daysSets = allSets.filter(s => isSameDay(new Date(s.timestamp), date));
            const volume = daysSets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
            return { date, volume, label: format(date, 'EEEEE') }; // 'M', 'T', etc.
        });
    }, [allSets]);

    const totalWeeklyVolume = volumeData?.reduce((acc, d) => acc + d.volume, 0) || 0;
    const maxDailyVolume = Math.max(...(volumeData?.map(d => d.volume) || [1]));

    // Calculate PRs (Simple Max Weight)
    const prs = useMemo(() => {
        if (!allSets || !exercises) return [];

        return exercises.map(ex => {
            const setsForEx = allSets.filter(s => s.exerciseId === ex.id);
            if (setsForEx.length === 0) return null;

            const maxWeightSet = setsForEx.reduce((prev, current) => (prev.weight > current.weight) ? prev : current);
            return {
                exercise: ex.name,
                weight: maxWeightSet.weight,
                date: maxWeightSet.timestamp
            };
        }).filter(Boolean); // Remove nulls
    }, [allSets, exercises]);

    return (
        <div className="min-h-screen pb-24 px-5 pt-8 max-w-md mx-auto bg-background">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Progress</h1>
                    <p className="text-sm text-muted-foreground">Analytics & Performance</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full border-[#27272A] bg-[#111111] text-xs h-8">
                    This Month
                    <ChevronLeft className="h-3 w-3 ml-1 rotate-[-90deg]" />
                </Button>
            </header>

            {/* Body & Progress Links */}
            <section className="grid grid-cols-2 gap-4 mb-8">
                <Link href="/analytics/measurements">
                    <Card className="bg-[#111111] border-none p-5 flex flex-col items-start gap-2 hover:bg-[#1a1a1a] transition-colors cursor-pointer group">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Scale className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-muted-foreground uppercase">Body Stats</span>
                            <div className="text-white font-bold text-lg mt-0.5">Track</div>
                        </div>
                    </Card>
                </Link>

                <Link href="/analytics/photos">
                    <Card className="bg-[#111111] border-none p-5 flex flex-col items-start gap-2 hover:bg-[#1a1a1a] transition-colors cursor-pointer group">
                        <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ImageIcon className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                            <span className="text-xs font-bold text-muted-foreground uppercase">Gallery</span>
                            <div className="text-white font-bold text-lg mt-0.5">Photos</div>
                        </div>
                    </Card>
                </Link>
            </section>

            {/* Volume Load Chart (Real) */}
            <section className="mb-8">
                <div className="flex items-end justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Volume Load</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">{(totalWeeklyVolume / 1000).toFixed(1)}k</span>
                            <span className="text-sm font-medium text-muted-foreground">lbs</span>
                            <span className="text-xs bg-[#27272A] px-2 py-0.5 rounded text-white ml-2">Last 7 Days</span>
                        </div>
                    </div>
                </div>

                <Card className="bg-[#111111] border-none p-6 h-40 flex items-end justify-between gap-2">
                    {volumeData?.map((data, i) => {
                        const heightPercent = maxDailyVolume > 0 ? (data.volume / maxDailyVolume) * 100 : 0;
                        const isToday = isSameDay(data.date, new Date());

                        return (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1 group relative">
                                {/* Tooltip */}
                                <div className="absolute -top-8 px-2 py-1 bg-white text-black text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    {data.volume} lbs
                                </div>

                                <div
                                    className={`w-full rounded-t-sm transition-all hover:opacity-80 ${isToday ? 'bg-primary shadow-[0_0_15px_rgba(167,139,250,0.4)]' : 'bg-[#27272A]'}`}
                                    style={{ height: `${Math.max(heightPercent, 5)}%` }} // Min height 5%
                                />
                                <span className={`text-[10px] uppercase font-bold ${isToday ? 'text-white' : 'text-muted-foreground'}`}>
                                    {data.label}
                                </span>
                            </div>
                        );
                    })}
                </Card>
            </section>

            {/* PRs List (Real) */}
            <section className="mb-8">
                <h3 className="text-base font-semibold text-white mb-4">Personal Records</h3>

                <div className="space-y-3">
                    {prs?.length === 0 ? (
                        <div className="text-xs text-zinc-500 italic">No PRs yet. Go lift something heavy!</div>
                    ) : (
                        prs?.map((pr: any, i: number) => (
                            <PRCard key={i} exercise={pr.exercise} weight={pr.weight} date={format(pr.date, 'MMM d, yyyy')} />
                        ))
                    )}
                </div>
            </section>

            <BottomNav />
        </div>
    );
}

function PRCard({ exercise, weight, date }: { exercise: string, weight: string | number, date: string }) {
    return (
        <Card className="bg-[#111111] border-none p-5 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors cursor-pointer group">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{exercise}</span>
                </div>
                <h4 className="text-3xl font-bold text-white">{weight} <span className="text-sm font-medium text-muted-foreground ml-1">lbs</span></h4>
                <p className="text-xs text-muted-foreground mt-1">{date}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-primary transition-colors">
                <TrendingUp className="h-5 w-5" />
            </Button>
        </Card>
    )
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
