"use client";

import { ArrowLeft, Calendar, ChevronRight, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { format } from "date-fns";

export default function HistoryPage() {
    // Query only completed workouts, sorted by date desc
    const history = useLiveQuery(
        () => db.workouts
            .where('status').equals('completed')
            .reverse() // Newest first
            .sortBy('startTime')
    );

    return (
        <div className="min-h-screen pb-24 px-5 pt-8 max-w-md mx-auto bg-background">
            {/* Header */}
            <header className="flex items-center gap-4 mb-8">
                <Link href="/train">
                    <Button variant="ghost" size="icon" className="-ml-2 text-muted-foreground hover:text-white">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight text-white">History</h1>
            </header>

            {/* Stats Summary (Placeholder for now) */}
            <section className="grid grid-cols-2 gap-4 mb-8">
                <Card className="bg-[#111111] border-none p-4 flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Workouts</span>
                    <span className="text-2xl font-bold text-white">{history?.length || 0}</span>
                </Card>
                <Card className="bg-[#111111] border-none p-4 flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">This Month</span>
                    <span className="text-2xl font-bold text-white max-w-[10px] truncate">{history?.filter(w => new Date(w.startTime).getMonth() === new Date().getMonth()).length || 0}</span>
                </Card>
            </section>

            {/* Workout List */}
            <section className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent Sessions</h3>

                {!history || history.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-[#111111] rounded-2xl border border-white/5">
                        <Dumbbell className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>No completed workouts yet.</p>
                        <Link href="/train/active">
                            <Button variant="link" className="text-primary">Start one now</Button>
                        </Link>
                    </div>
                ) : (
                    history.map((workout) => (
                        <WorkoutHistoryCard key={workout.id} workout={workout} />
                    ))
                )}
            </section>
        </div>
    );
}

function WorkoutHistoryCard({ workout }: { workout: any }) {
    // We could format duration here if we had endTime
    const date = new Date(workout.startTime);

    return (
        <Card className="bg-[#111111] border-none p-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
                {/* Date Box */}
                <div className="flex flex-col items-center justify-center h-12 w-12 rounded-lg bg-zinc-900 border border-white/5">
                    <span className="text-[10px] font-bold text-red-400 uppercase">{format(date, 'MMM')}</span>
                    <span className="text-lg font-bold text-white leading-none">{format(date, 'd')}</span>
                </div>

                <div>
                    <h4 className="text-base font-bold text-white mb-0.5">{workout.name}</h4>
                    <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(date, 'h:mm a')}
                        </span>
                        <span>•</span>
                        <span>45m</span> {/* Placeholder duration */}
                    </div>
                </div>
            </div>

            <ChevronRight className="h-5 w-5 text-zinc-700 group-hover:text-white transition-colors" />
        </Card>
    )
}
