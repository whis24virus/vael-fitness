"use client";

import { useState } from "react";
import { Mic, Camera, FileText, ArrowUp, Plus, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { cn } from "@/lib/utils"; // Added cn import

export default function CapturePage() {
    const [noteContent, setNoteContent] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [chunks, setChunks] = useState<Blob[]>([]);

    const recentNotes = useLiveQuery(() =>
        db.notes.orderBy('date').reverse().limit(10).toArray()
    );

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    setChunks((prev) => [...prev, e.data]);
                }
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                // Save to DB
                const noteId = await db.notes.add({
                    title: "Voice Memo",
                    content: "Audio Recording",
                    type: 'voice',
                    date: new Date()
                });

                await db.media.add({
                    noteId: noteId as number,
                    blob: audioBlob
                });

                setChunks([]);
                // Stop all tracks to release mic
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Microphone access denied");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            setMediaRecorder(null);
        }
    };

    const handleSaveNote = async () => {
        if (!noteContent.trim()) return;

        try {
            await db.notes.add({
                title: "Quick Note",
                content: noteContent,
                type: 'text',
                date: new Date()
            });
            setNoteContent("");
        } catch (error) {
            console.error("Failed to save note", error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSaveNote();
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // Save Note Reference
            const noteId = await db.notes.add({
                title: "Photo Capture",
                content: "Image Log",
                type: 'image',
                date: new Date()
            });

            // Save Blob
            await db.media.add({
                noteId: noteId as number,
                blob: file
            });

            // Reset input
            e.target.value = '';
        } catch (error) {
            console.error("Failed to save image", error);
        }
    };

    return (
        <div className="min-h-screen pb-24 px-5 pt-8 max-w-md mx-auto bg-background flex flex-col">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-white">Capture</h1>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </header>

            {/* Quick Actions */}
            <section className="grid grid-cols-2 gap-4 mb-8">
                <Card className="bg-[#111111] border-none p-6 flex flex-col items-center justify-center gap-3 hover:bg-[#1a1a1a] transition-colors cursor-pointer group">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Mic className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-bold text-white">Voice Memo</span>
                </Card>

                <Card className="bg-[#111111] border-none p-6 flex flex-col items-center justify-center gap-3 hover:bg-[#1a1a1a] transition-colors cursor-pointer group relative overflow-hidden">
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        onChange={handleImageUpload}
                    />
                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="h-6 w-6 text-blue-500" />
                    </div>
                    <span className="text-sm font-bold text-white">Camera</span>
                </Card>
            </section>

            {/* Recent Captures */}
            <section className="flex-1 overflow-y-auto -mx-5 px-5 space-y-3 mb-4 scrollbar-hide">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Recent</h3>

                {recentNotes?.map(note => (
                    <Card key={note.id} className="bg-[#111111] border-none p-4 flex gap-4 min-h-[80px]">
                        <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                            {note.type === 'text' && <FileText className="h-4 w-4 text-muted-foreground" />}
                            {note.type === 'voice' && <Mic className="h-4 w-4 text-primary" />}
                            {note.type === 'image' && <ImageIcon className="h-4 w-4 text-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium line-clamp-2">{note.content || "Untitled Capture"}</p>
                            <span className="text-xs text-muted-foreground mt-1 block">
                                {format(note.date, 'h:mm a · MMM d')}
                            </span>
                        </div>
                    </Card>
                ))}

                {(!recentNotes || recentNotes.length === 0) && (
                    <div className="text-center py-12 opacity-30">
                        <p className="text-sm">No captures yet</p>
                    </div>
                )}
            </section>

            {/* Input Area */}
            <div className="mt-auto relative z-20">
                <div className="relative">
                    <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                        <Plus className="h-5 w-5" />
                    </Button>
                    <Input
                        className="pl-12 pr-12 h-14 rounded-full bg-[#111111] border-none text-base focus-visible:ring-1 focus-visible:ring-primary text-white"
                        placeholder="Capture a thought..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Button
                            size="icon"
                            className="h-10 w-10 rounded-full bg-primary text-black hover:bg-primary/90"
                            onClick={handleSaveNote}
                            disabled={!noteContent.trim()}
                        >
                            <ArrowUp className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
