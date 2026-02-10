"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Save, Trash2, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Exercise } from "@/lib/db";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function NewRoutinePage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
    const [isAddingExercise, setIsAddingExercise] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const allExercises = useLiveQuery(() => db.exercises.toArray());

    const filteredExercises = allExercises?.filter(e =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.muscle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddExercise = (exercise: Exercise) => {
        setSelectedExercises([...selectedExercises, exercise]);
        setIsAddingExercise(false);
        setSearchQuery("");
    };

    const handleRemoveExercise = (index: number) => {
        const newExercises = [...selectedExercises];
        newExercises.splice(index, 1);
        setSelectedExercises(newExercises);
    };

    const handleSaveRoutine = async () => {
        if (!name || selectedExercises.length === 0) return;

        try {
            await db.routines.add({
                name,
                exercises: selectedExercises.map((e, i) => ({
                    exerciseId: e.id!,
                    order: i
                })),
                updatedAt: new Date()
            });
            router.push('/train');
        } catch (error) {
            console.error("Failed to save routine", error);
        }
    };

    if (isAddingExercise) {
        return (
            <div className="min-h-screen bg-black p-5 pt-8">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => setIsAddingExercise(false)}>
                        <ArrowLeft className="h-6 w-6 text-white" />
                    </Button>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            autoFocus
                            placeholder="Search exercises..."
                            className="pl-9 bg-[#111111] border-none text-white focus-visible:ring-primary"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    {filteredExercises?.map((exercise) => (
                        <Card
                            key={exercise.id}
                            className="bg-[#111111] border-none p-4 flex items-center justify-between hover:bg-[#1a1a1a] cursor-pointer"
                            onClick={() => handleAddExercise(exercise)}
                        >
                            <div>
                                <h4 className="font-bold text-white">{exercise.name}</h4>
                                <p className="text-xs text-muted-foreground">{exercise.muscle}</p>
                            </div>
                            <Plus className="h-5 w-5 text-primary" />
                        </Card>
                    ))}
                    {filteredExercises?.length === 0 && searchQuery && (
                        <div className="text-center mt-10">
                            <p className="text-muted-foreground text-sm mb-4">No exercises found for "{searchQuery}"</p>
                            <Button
                                variant="outline"
                                className="border-primary/20 text-primary hover:bg-primary/10"
                                onClick={async () => {
                                    try {
                                        const id = await db.exercises.add({
                                            name: searchQuery,
                                            muscle: "Custom",
                                            equipment: "Other",
                                            category: "Custom"
                                        });
                                        // Add to selection
                                        handleAddExercise({
                                            id: id as number,
                                            name: searchQuery,
                                            muscle: "Custom",
                                            equipment: "Other",
                                            category: "Custom"
                                        });
                                    } catch (e) {
                                        console.error("Failed to create exercise", e);
                                    }
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create "{searchQuery}"
                            </Button>
                        </div>
                    )}
                    {filteredExercises?.length === 0 && !searchQuery && (
                        <p className="text-center text-muted-foreground text-sm mt-10">No exercises found.</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24 px-5 pt-8 max-w-md mx-auto bg-background">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/train">
                        <Button variant="ghost" size="icon" className="-ml-2 text-muted-foreground hover:text-white">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-white">New Routine</h1>
                </div>
                <Button
                    size="sm"
                    className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white"
                    onClick={handleSaveRoutine}
                    disabled={!name || selectedExercises.length === 0}
                >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                </Button>
            </header>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground tracking-wider uppercase pl-1">Name</label>
                    <Input
                        placeholder="e.g. Leg Day"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-[#111111] border-none text-white text-lg h-12 focus-visible:ring-primary"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between pl-1">
                        <label className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Exercises</label>
                        <span className="text-xs text-muted-foreground">{selectedExercises.length} selected</span>
                    </div>

                    <div className="space-y-2">
                        {selectedExercises.map((exercise, index) => (
                            <Card key={index} className="bg-[#111111] border-none p-4 flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-muted-foreground">
                                        {index + 1}
                                    </div>
                                    <span className="font-medium text-white">{exercise.name}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-destructive h-8 w-8"
                                    onClick={() => handleRemoveExercise(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </Card>
                        ))}

                        <Button
                            variant="outline"
                            className="w-full h-12 border-dashed border-zinc-800 bg-transparent text-muted-foreground hover:text-white hover:border-zinc-700 hover:bg-zinc-900"
                            onClick={() => setIsAddingExercise(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Exercise
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
