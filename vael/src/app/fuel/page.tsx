"use client";

import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Flame, Utensils } from "lucide-react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

export default function FuelPage() {
    const today = new Date();

    const todaysLogs = useLiveQuery(() =>
        db.nutrition_logs
            .filter(log => isSameDay(new Date(log.date), today))
            .toArray()
    );

    const totals = todaysLogs?.reduce((acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        carbs: acc.carbs + log.carbs,
        fat: acc.fat + log.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 }) || { calories: 0, protein: 0, carbs: 0, fat: 0 };

    const CALORIE_GOAL = 2500;

    return (
        <div className="min-h-screen pb-24 px-5 pt-8 max-w-md mx-auto bg-background flex flex-col">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Fuel</h1>
                    <p className="text-sm text-muted-foreground">{format(today, 'EEEE, MMMM d')}</p>
                </div>
                <Link href="/fuel/log">
                    <Button size="sm" className="rounded-full bg-primary text-black hover:bg-primary/90 font-bold">
                        <Plus className="h-4 w-4 mr-2" />
                        Log
                    </Button>
                </Link>
            </header>

            {/* Macro Ring / Summary */}
            <section className="mb-8 flex justify-center">
                <div className="relative w-64 h-64 flex items-center justify-center">
                    {/* Background Circle */}
                    <div className="absolute inset-0 rounded-full border-[12px] border-[#111111]" />

                    {/* SVG Ring (Simplified implementation for MVP) */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="128"
                            cy="128"
                            r="120"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-[#111111]"
                        />
                        <circle
                            cx="128"
                            cy="128"
                            r="120"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={753} // 2 * PI * 120
                            strokeDashoffset={753 - (753 * Math.min(totals.calories / CALORIE_GOAL, 1))}
                            strokeLinecap="round"
                            className="text-primary transition-all duration-1000 ease-out"
                        />
                    </svg>

                    <div className="text-center z-10 flex flex-col items-center">
                        <Flame className="h-6 w-6 text-orange-500 mb-2" />
                        <span className="text-4xl font-bold text-white">{totals.calories}</span>
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">/ {CALORIE_GOAL} kcal</span>
                    </div>
                </div>
            </section>

            {/* Macros Grid */}
            <section className="grid grid-cols-3 gap-2 mb-8">
                <Card className="bg-[#111111] border-none p-3 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Protein</span>
                    <span className="text-xl font-bold text-white">{totals.protein}g</span>
                </Card>
                <Card className="bg-[#111111] border-none p-3 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Carbs</span>
                    <span className="text-xl font-bold text-white">{totals.carbs}g</span>
                </Card>
                <Card className="bg-[#111111] border-none p-3 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Fat</span>
                    <span className="text-xl font-bold text-white">{totals.fat}g</span>
                </Card>
            </section>

            {/* Meals List */}
            <section className="space-y-6">
                {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => {
                    const meals = todaysLogs?.filter(l => l.mealType === type);
                    if (!meals || meals.length === 0) return null;

                    return (
                        <div key={type}>
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 pl-1">{type}</h3>
                            <div className="space-y-2">
                                {meals.map(meal => (
                                    <div key={meal.id} className="flex justify-between items-center bg-[#111111] p-4 rounded-xl border border-white/5">
                                        <div>
                                            <p className="font-bold text-white text-sm">{meal.name}</p>
                                            <div className="text-[10px] text-muted-foreground mt-0.5 space-x-2">
                                                <span>P: {meal.protein}g</span>
                                                <span>C: {meal.carbs}g</span>
                                                <span>F: {meal.fat}g</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-white">{meal.calories}</span>
                                            <span className="text-[10px] text-muted-foreground">kcal</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}

                {(!todaysLogs || todaysLogs.length === 0) && (
                    <div className="text-center py-8 opacity-30">
                        <Utensils className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-xs">No food logged today</p>
                    </div>
                )}
            </section>

            <BottomNav />
        </div>
    );
}
