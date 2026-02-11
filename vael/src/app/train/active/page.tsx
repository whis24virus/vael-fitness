"use client";

import { X, Check, ChevronRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

export default function ActiveWorkoutPage() {
    const router = useRouter();
    const [workoutId, setWorkoutId] = useState<number | null>(null);
    const [exerciseId, setExerciseId] = useState<number>(1); // Default to first exercise (Barbell Squat)
    const [weight, setWeight] = useState(135);
    const [reps, setReps] = useState(5);
    const [isLogging, setIsLogging] = useState(false);

    // Load exercises
    const exercises = useLiveQuery(() => db.exercises.toArray());
    const currentExercise = exercises?.find(e => e.id === exerciseId);

    // Auto-select first exercise if ID 1 isn't found
    useEffect(() => {
        if (exercises && exercises.length > 0 && !currentExercise) {
            if (exercises[0].id) {
                setExerciseId(exercises[0].id);
            }
        }
    }, [exercises, currentExercise]);

    // Load sets for this workout
    const currentSets = useLiveQuery(
        () => db.sets.where('workoutId').equals(workoutId || -1).toArray(),
        [workoutId]
    );

    // Load ALL sets for this exercise to find PR
    const historySets = useLiveQuery(
        () => db.sets.where('exerciseId').equals(exerciseId).toArray(),
        [exerciseId]
    );

    const currentPR = historySets?.reduce((max, set) => Math.max(max, set.weight), 0) || 0;

    // Create workout session on mount
    useEffect(() => {
        const startSession = async () => {
            try {
                // Check if there's an active workout? For now, just create new.
                const id = await db.workouts.add({
                    name: "Quick Start Workout",
                    startTime: new Date(),
                    status: 'active'
                });
                setWorkoutId(id as number);
            } catch (error) {
                console.error("Failed to start workout", error);
            }
        };
        if (!workoutId) startSession();
    }, []);

    const handleLogSet = async () => {
        if (!workoutId) return;
        setIsLogging(true);
        try {
            await db.sets.add({
                workoutId,
                exerciseId,
                weight,
                reps,
                timestamp: new Date(),
                isWarmup: false
            });

            // Check for PR
            if (weight > currentPR && currentPR > 0) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#A78BFA', '#ffffff'] // Theme colors
                });
            }

        } catch (error) {
            console.error("Failed to log set", error);
        } finally {
            setIsLogging(false);
        }
    };

    const handleEndWorkout = async () => {
        if (workoutId) {
            await db.workouts.update(workoutId, {
                status: 'completed',
                endTime: new Date()
            });

            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                disableForReducedMotion: true
            });

            // Slight delay to let confetti show
            setTimeout(() => router.push('/train'), 1000);
        } else {
            router.push('/train');
        }
    };

    if (!exercises) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading database...</div>;

    return (
        <div className="min-h-screen pb-12 flex flex-col bg-black relative">
            {/* Top Bar */}
            <div className="flex justify-between items-center p-5 pt-8 z-10">
                <Link href="/train" className={buttonVariants({ variant: "ghost", size: "icon" })}>
                    <X className="h-6 w-6 text-muted-foreground hover:text-white" />
                </Link>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold">WORKOUT</span>
                    <div className="flex gap-1 mt-1">
                        {/* Dynamic Set Indicators */}
                        {currentSets && currentSets.length > 0 ? (
                            currentSets.map((_, i) => (
                                <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary" />
                            ))
                        ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                        )}
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary font-medium hover:text-primary/80"
                    onClick={handleEndWorkout}
                >
                    End
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-10">
                {/* Timer */}
                <div className="text-7xl font-bold tracking-tighter text-white mb-6 tabular-nums font-mono">
                    00:00
                </div>
                <div className="flex items-center gap-2 mb-12">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-bold tracking-wider text-green-500 uppercase">Active</span>
                </div>

                {/* Exercise Info */}
                <div className="text-center mb-10">
                    {currentExercise?.image && (
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl">
                            <img src={currentExercise.image} alt={currentExercise.name} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <h2 className="text-3xl font-bold text-white mb-2">{currentExercise?.name || "Loading..."}</h2>
                    <p className="text-lg text-primary font-medium">Set {(currentSets?.length || 0) + 1}</p>
                </div>

                {/* Inputs */}
                <div className="w-full max-w-sm grid grid-cols-2 gap-6 mb-12">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground tracking-wider uppercase pl-1">Weight</label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(Number(e.target.value))}
                                className="h-24 text-5xl font-bold text-center bg-[#111111] border-none text-white focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:bg-[#1a1a1a] rounded-2xl"
                            />
                            <span className="absolute bottom-4 right-4 text-xs font-medium text-muted-foreground">lbs</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground tracking-wider uppercase pl-1">Reps</label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={reps}
                                onChange={(e) => setReps(Number(e.target.value))}
                                className="h-24 text-5xl font-bold text-center bg-[#111111] border-none text-white focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:bg-[#1a1a1a] rounded-2xl"
                            />
                            <span className="absolute bottom-4 right-4 text-xs font-medium text-muted-foreground">reps</span>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <Button
                    className="w-full max-w-sm h-16 rounded-2xl text-lg font-bold bg-primary text-black hover:bg-primary/90 shadow-[0_0_20px_rgba(167,139,250,0.3)] hover:shadow-[0_0_30px_rgba(167,139,250,0.5)] transition-all"
                    onClick={handleLogSet}
                    disabled={isLogging}
                >
                    <Check className="mr-2 h-5 w-5" />
                    {isLogging ? "Logging..." : "Log Set"}
                </Button>

                {/* Recent History */}
                <div className="mt-8 space-y-2">
                    <p className="text-xs text-muted-foreground/50 font-medium text-center mb-2">Recent Sets</p>
                    {currentSets?.slice(-3).reverse().map((set, i) => (
                        <div key={i} className="text-xs text-zinc-500 flex items-center justify-center gap-2">
                            <span>{set.weight} lbs</span>
                            <span>×</span>
                            <span>{set.reps} reps</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Up Next Preview */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-[#111111] px-5 py-3 rounded-full border border-white/5">
                    <span>Up Next: <span className="text-white font-medium">Bench Press</span></span>
                    <ChevronRight className="h-4 w-4" />
                </div>
            </div>
        </div>
    );
}
