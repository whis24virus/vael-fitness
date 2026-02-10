"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Calendar, Frown, Meh, Smile, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function JournalPage() {
    // Fetch logs that have notes
    const logs = useLiveQuery(() =>
        db.daily_logs
            .filter(log => !!log.notes && log.notes.length > 0)
            .reverse()
            .toArray()
    );

    return (
        <div className="min-h-screen pb-24 px-5 pt-8 max-w-md mx-auto bg-background">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/life">
                        <Button variant="ghost" size="icon" className="-ml-2 text-muted-foreground hover:text-white">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Journal</h1>
                </div>
                <Link href="/life/check-in">
                    <Button size="sm" className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        New Entry
                    </Button>
                </Link>
            </header>

            <div className="space-y-4">
                {logs?.map(log => (
                    <Card key={log.id} className="bg-[#111111] border-none p-5 hover:bg-[#1a1a1a] transition-colors group cursor-pointer relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                <Calendar className="h-3 w-3" />
                                <span>{format(parseISO(log.date), 'MMMM d, yyyy')}</span>
                            </div>
                            {log.mood && (
                                <div className="text-xl">
                                    {log.mood <= 2 && <Frown className="h-5 w-5 text-red-400" />}
                                    {log.mood === 3 && <Meh className="h-5 w-5 text-yellow-400" />}
                                    {log.mood >= 4 && <Smile className="h-5 w-5 text-green-400" />}
                                </div>
                            )}
                        </div>
                        <p className="text-white text-sm leading-relaxed line-clamp-3">
                            {log.notes}
                        </p>
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#111111] to-transparent group-hover:from-[#1a1a1a]" />
                    </Card>
                ))}

                {(!logs || logs.length === 0) && (
                    <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl bg-[#111111]/50">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-bold text-white mb-2">Empty Journal</h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-[200px] mx-auto">
                            Reflect on your day, track your thoughts, or just vent.
                        </p>
                        <Link href="/life/check-in">
                            <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
                                Write First Entry
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
