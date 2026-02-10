import Dexie, { type Table } from 'dexie';

export interface Exercise {
    id?: number;
    name: string;
    muscle: string;
    equipment: string;
    category: string;
}

export interface Workout {
    id?: number;
    name: string;
    startTime: Date;
    endTime?: Date;
    status: 'active' | 'completed';
    volume?: number; // Total volume in kg/lbs
}

export interface SetLog {
    id?: number;
    workoutId: number;
    exerciseId: number;
    weight: number;
    reps: number;
    rpe?: number;
    timestamp: Date;
    isWarmup: boolean;
}

export interface RoutineExercise {
    exerciseId: number;
    order: number;
    targetSets?: number;
    targetReps?: number;
}

export interface Routine {
    id?: number;
    name: string;
    exercises: RoutineExercise[];
    updatedAt: Date;
}

export interface DailyLog {
    id?: number;
    date: string; // ISO Date string YYYY-MM-DD
    sleepHours?: number;
    sleepQuality?: number; // 1-10
    mood?: number; // 1-5 (Emoji index)
    energy?: number; // 1-10
    soreness?: string[]; // Array of muscle groups
    notes?: string;
    habitsCompleted?: number[]; // Array of habit IDs completed today
}

export interface Habit {
    id?: number;
    name: string;
    icon?: string;
    frequency: 'daily' | 'weekly';
    targetCount?: number; // e.g., 3 times per week
    streak: number;
    archived?: boolean;
}

export interface Note {
    id?: number;
    title: string;
    content: string; // Text content or transcription
    type: 'text' | 'voice' | 'image' | 'video';
    date: Date;
    tags?: string[];
}

export interface Media {
    id?: number;
    noteId: number;
    blob: Blob; // Audio or Image file
}

export interface Measurement {
    id?: number;
    date: Date;
    weight?: number;
    bodyFat?: number;
    chest?: number;
    waist?: number;
    arms?: number;
    legs?: number;
    notes?: string;
}

export interface NutritionLog {
    id?: number;
    date: Date;
    name: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export class VaelDatabase extends Dexie {
    exercises!: Table<Exercise>;
    workouts!: Table<Workout>;
    sets!: Table<SetLog>;
    routines!: Table<Routine>;
    daily_logs!: Table<DailyLog>;
    habits!: Table<Habit>;
    notes!: Table<Note>;
    media!: Table<Media>;
    measurements!: Table<Measurement>;
    nutrition_logs!: Table<NutritionLog>;

    constructor() {
        super('VaelDatabase');

        // Define tables and indexes
        this.version(1).stores({
            exercises: '++id, name, muscle, category',
            workouts: '++id, startTime, status',
            sets: '++id, workoutId, exerciseId, timestamp'
        });

        this.version(2).stores({
            routines: '++id, name, updatedAt'
        });

        this.version(3).stores({
            daily_logs: '++id, date, sleepHours, mood', // date is indexed for quick lookup
            habits: '++id, name, frequency, archived'
        });

        this.version(4).stores({
            notes: '++id, title, content, type, date', // type: 'text', 'voice', 'image'
            media: '++id, noteId, blob' // Separate table for large binaries
        });

        this.version(5).stores({
            measurements: '++id, date, weight, bodyFat, chest, waist, arms, legs'
        });

        this.version(6).stores({
            nutrition_logs: '++id, date, name, mealType, calories, protein, carbs, fat'
        });

        // Populate with initial data
        this.on('populate', () => {
            this.exercises.bulkAdd([
                { name: 'Barbell Squat', muscle: 'Legs', equipment: 'Barbell', category: 'Strength' },
                { name: 'Bench Press', muscle: 'Chest', equipment: 'Barbell', category: 'Strength' },
                { name: 'Deadlift', muscle: 'Back', equipment: 'Barbell', category: 'Strength' },
                { name: 'Overhead Press', muscle: 'Shoulders', equipment: 'Barbell', category: 'Strength' },
                { name: 'Pull Up', muscle: 'Back', equipment: 'Bodyweight', category: 'Strength' },
                { name: 'Dumbbell Row', muscle: 'Back', equipment: 'Dumbbell', category: 'Strength' },
                { name: 'Lunges', muscle: 'Legs', equipment: 'Dumbbell', category: 'Strength' },
                { name: 'Plank', muscle: 'Core', equipment: 'Bodyweight', category: 'Strength' },
                { name: 'Running', muscle: 'Cardio', equipment: 'None', category: 'Cardio' },
            ]);
        });
    }
}

export const db = new VaelDatabase();
