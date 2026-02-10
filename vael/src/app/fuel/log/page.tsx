"use client";

import { useState } from "react";
import { ArrowLeft, Save, Flame, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { db } from "@/lib/db";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function FuelLogPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [calories, setCalories] = useState("");
    const [protein, setProtein] = useState("");
    const [carbs, setCarbs] = useState("");
    const [fat, setFat] = useState("");
    const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');

    const handleSave = async () => {
        if (!name || !calories) return;

        try {
            await db.nutrition_logs.add({
                date: new Date(),
                name,
                mealType,
                calories: parseInt(calories),
                protein: protein ? parseInt(protein) : 0,
                carbs: carbs ? parseInt(carbs) : 0,
                fat: fat ? parseInt(fat) : 0,
            });
            router.push('/fuel');
        } catch (error) {
            console.error("Failed to save food log", error);
        }
    };

    return (
        <div className="min-h-screen pb-24 px-5 pt-8 max-w-md mx-auto bg-background">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/fuel">
                        <Button variant="ghost" size="icon" className="-ml-2 text-muted-foreground hover:text-white">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Log Food</h1>
                </div>
                <Button
                    size="sm"
                    className="rounded-full bg-primary text-black hover:bg-primary/90 font-bold"
                    onClick={handleSave}
                    disabled={!name || !calories}
                >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                </Button>
            </header>

            <div className="space-y-6">
                {/* Meal Type Selector */}
                <div className="grid grid-cols-4 gap-2 bg-[#111111] p-1 rounded-xl">
                    {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setMealType(type as any)}
                            className={cn(
                                "py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                mealType === type ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Main Input */}
                <Card className="bg-[#111111] border-none p-5 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Food Name</label>
                        <Input
                            className="bg-black/20 border-white/5 text-lg font-bold text-white placeholder:text-zinc-700 h-12"
                            placeholder="e.g. Grilled Chicken Salad"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-1">
                                <Flame className="h-3 w-3 text-orange-500" /> Calories
                            </label>
                            <Input
                                type="number"
                                className="bg-black/20 border-white/5 text-2xl font-bold text-white placeholder:text-zinc-700 h-14"
                                placeholder="0"
                                value={calories}
                                onChange={(e) => setCalories(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1 text-blue-400">Protein (g)</label>
                            <Input
                                type="number"
                                className="bg-black/20 border-white/5 text-base"
                                placeholder="0g"
                                value={protein}
                                onChange={(e) => setProtein(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1 text-green-400">Carbs (g)</label>
                            <Input
                                type="number"
                                className="bg-black/20 border-white/5 text-base"
                                placeholder="0g"
                                value={carbs}
                                onChange={(e) => setCarbs(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1 text-yellow-500">Fat (g)</label>
                            <Input
                                type="number"
                                className="bg-black/20 border-white/5 text-base"
                                placeholder="0g"
                                value={fat}
                                onChange={(e) => setFat(e.target.value)}
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
