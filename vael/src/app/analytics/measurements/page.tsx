"use client";

import { useState } from "react";
import { ArrowLeft, Save, Scale, Ruler, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { db } from "@/lib/db";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function MeasurementsPage() {
    const router = useRouter();
    const [weight, setWeight] = useState("");
    const [bodyFat, setBodyFat] = useState("");
    const [circumferences, setCircumferences] = useState({
        chest: "", waist: "", arms: "", legs: ""
    });

    const history = useLiveQuery(() => db.measurements.orderBy('date').reverse().toArray());

    const handleSave = async () => {
        if (!weight) return;

        try {
            await db.measurements.add({
                date: new Date(),
                weight: parseFloat(weight),
                bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
                chest: circumferences.chest ? parseFloat(circumferences.chest) : undefined,
                waist: circumferences.waist ? parseFloat(circumferences.waist) : undefined,
                arms: circumferences.arms ? parseFloat(circumferences.arms) : undefined,
                legs: circumferences.legs ? parseFloat(circumferences.legs) : undefined,
            });
            // Clear form
            setWeight("");
            setBodyFat("");
            setCircumferences({ chest: "", waist: "", arms: "", legs: "" });
        } catch (error) {
            console.error("Failed to save measurements", error);
        }
    };

    return (
        <div className="min-h-screen pb-24 px-5 pt-8 max-w-md mx-auto bg-background">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/analytics">
                        <Button variant="ghost" size="icon" className="-ml-2 text-muted-foreground hover:text-white">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Body Stats</h1>
                </div>
            </header>

            {/* Input Form */}
            <Card className="bg-[#111111] border-none p-5 mb-8 space-y-5">
                <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Scale className="h-3 w-3" /> Weight (lbs)
                        </label>
                        <Input
                            type="number"
                            className="bg-black/20 border-white/5 text-lg font-bold text-white placeholder:text-zinc-700"
                            placeholder="0.0"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                        />
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Activity className="h-3 w-3" /> Body Fat %
                        </label>
                        <Input
                            type="number"
                            className="bg-black/20 border-white/5 text-lg font-bold text-white placeholder:text-zinc-700"
                            placeholder="%"
                            value={bodyFat}
                            onChange={(e) => setBodyFat(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Ruler className="h-3 w-3" /> Circumferences (in)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {['Chest', 'Waist', 'Arms', 'Legs'].map(part => (
                            <Input
                                key={part}
                                type="number"
                                className="bg-black/20 border-white/5 text-sm"
                                placeholder={part}
                                value={(circumferences as any)[part.toLowerCase()]}
                                onChange={(e) => setCircumferences(prev => ({ ...prev, [part.toLowerCase()]: e.target.value }))}
                            />
                        ))}
                    </div>
                </div>

                <Button className="w-full font-bold bg-primary text-black hover:bg-primary/90" onClick={handleSave} disabled={!weight}>
                    Log Measurements
                </Button>
            </Card>

            {/* History List */}
            <section>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-sm font-semibold text-white">History</h3>
                </div>
                <div className="space-y-3">
                    {history?.map(entry => (
                        <div key={entry.id} className="flex items-center justify-between p-4 bg-[#111111] rounded-xl border border-white/5">
                            <div>
                                <span className="text-md font-bold text-white block">{entry.weight} lbs</span>
                                <span className="text-xs text-muted-foreground">{format(entry.date, 'MMM d, yyyy')}</span>
                            </div>
                            <div className="text-right">
                                {entry.bodyFat && <span className="text-xs font-bold text-primary block">{entry.bodyFat}% BF</span>}
                                {entry.waist && <span className="text-xs text-muted-foreground block">Waist: {entry.waist}"</span>}
                            </div>
                        </div>
                    ))}

                    {(!history || history.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground text-sm opacity-50">
                            No measurements logged.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
