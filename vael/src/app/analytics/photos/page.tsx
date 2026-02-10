"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { ArrowLeft, Calendar, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { format } from "date-fns";
import { useState, useEffect } from "react";

// Helper to convert Blob to URL
const useBlobUrl = (blob: Blob | undefined) => {
    const [url, setUrl] = useState<string | null>(null);
    useEffect(() => {
        if (!blob) return;
        const objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [blob]);
    return url;
};

const PhotoCard = ({ noteId, date }: { noteId: number, date: Date }) => {
    // Fetch the detailed blob for this note
    const media = useLiveQuery(() => db.media.where('noteId').equals(noteId).first());
    const imageUrl = useBlobUrl(media?.blob);

    if (!media || !imageUrl) return (
        <div className="aspect-[3/4] bg-[#111111] animate-pulse rounded-xl" />
    );

    return (
        <Card className="border-none bg-[#111111] overflow-hidden group relative aspect-[3/4]">
            <img src={imageUrl} alt="Progress" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <span className="text-xs font-bold text-white">{format(date, 'MMM d, yyyy')}</span>
            </div>
        </Card>
    );
};

export default function PhotosPage() {
    // Get all notes distinct by type='image'
    const imageNotes = useLiveQuery(
        () => db.notes.where('type').equals('image').reverse().toArray()
    );

    return (
        <div className="min-h-screen pb-24 px-5 pt-8 max-w-md mx-auto bg-background">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/analytics">
                        <Button variant="ghost" size="icon" className="-ml-2 text-muted-foreground hover:text-white">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Progress Photos</h1>
                </div>
                <Link href="/capture">
                    <Button size="sm" className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Add New
                    </Button>
                </Link>
            </header>

            <div className="grid grid-cols-2 gap-4">
                {imageNotes?.map(note => (
                    <PhotoCard key={note.id} noteId={note.id!} date={note.date} />
                ))}
            </div>

            {(!imageNotes || imageNotes.length === 0) && (
                <div className="text-center py-20 opacity-50">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No photos yet</p>
                    <Link href="/capture" className="text-primary text-xs mt-2 block hover:underline">
                        Take a photo in Capture tab
                    </Link>
                </div>
            )}
        </div>
    );
}
