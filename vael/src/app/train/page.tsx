"use client";

import { Play, Plus, ChevronRight, Dumbbell, History, MoreHorizontal, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/BottomNav";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export default function TrainPage() {
    return (
        <div className="min-h-screen pb-24 px-5 pt-8 max-w-md mx-auto bg-background relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <header className="flex justify-between items-end mb-8 relative z-10">
                <h1 className="text-3xl font-bold tracking-tight text-white">Train</h1>
                <Link href="/train/history">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-transparent p-0">
                        <History className="h-4 w-4 mr-2" />
                        History
                    </Button>
                </Link>
            </header>

            {/* Quick Start Grid */}
            <section className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                <Link href="/train/active" className="contents">
                    <Card className="bg-[#111111] border-none p-6 flex flex-col items-center justify-center gap-3 aspect-square hover:bg-[#1a1a1a] transition-colors cursor-pointer group h-full">
                        <div className="h-12 w-12 rounded-full bg-secondary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Plus className="h-6 w-6 text-white group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-white transition-colors">Empty Workout</span>
                    </Card>
                </Link>
                <Card className="bg-[#111111] border-none p-6 flex flex-col items-center justify-center gap-3 aspect-square hover:bg-[#1a1a1a] transition-colors cursor-pointer group">
                    <div className="h-12 w-12 rounded-full bg-secondary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Play className="h-6 w-6 text-white group-hover:text-primary transition-colors pl-1" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-white transition-colors">Log Run</span>
                </Card>
            </section>

            {/* My Routines */}
            <section className="mb-8 relative z-10">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-semibold text-white">My Routines</h3>
                    <Link href="/train/routines/new" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                        + New
                    </Link>
                </div>

                <RoutineList />
            </section>

            {/* Active Programs */}
            <section className="mb-8 relative z-10">
                <h3 className="text-base font-semibold text-white mb-4">Active Programs</h3>

                <div className="space-y-3">
                    <Card className="bg-[#111111] border-none p-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-teal-500/10 flex items-center justify-center">
                                <Dumbbell className="h-6 w-6 text-teal-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">VAEL 5x5 Stronglifts</h4>
                                <span className="text-xs text-muted-foreground">Week 3 • Day 2</span>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Card>

                    <Card className="bg-[#111111] border-none p-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                <Play className="h-6 w-6 text-orange-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">Couch to 5K</h4>
                                <span className="text-xs text-muted-foreground">Week 1 • Day 1</span>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Card>
                </div>
            </section>

            <BottomNav />
        </div>
    );
}

function RoutineList() {
    const routines = useLiveQuery(() => db.routines.toArray());

    if (!routines || routines.length === 0) {
        return (
            <div className="text-center py-6 border border-dashed border-white/5 rounded-2xl bg-[#111111]/50">
                <LayoutList className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-xs text-muted-foreground mb-3">No routines yet.</p>
                <Link href="/train/routines/new">
                    <Button variant="outline" size="sm" className="h-7 text-xs border-primary/20 text-primary hover:bg-primary/10">
                        Create One
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
            {routines.map((routine) => (
                <Card key={routine.id} className="bg-[#111111] border-none p-5 min-w-[280px] hover:bg-[#1a1a1a] transition-colors cursor-pointer relative shrink-0 group">
                    <div className="absolute top-4 right-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-5 w-5" />
                    </div>
                    {/* Placeholder Logic for "Badge" based on name keyword? */}
                    <Badge variant="secondary" className="mb-12 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-none uppercase">
                        {routine.name.split(' ')[0] || 'WORKOUT'}
                    </Badge>
                    <div>
                        <h4 className="text-xl font-bold text-white mb-1">{routine.name}</h4>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Dumbbell className="h-3 w-3 mr-1" />
                            <span>{routine.exercises.length} Exercises</span>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
