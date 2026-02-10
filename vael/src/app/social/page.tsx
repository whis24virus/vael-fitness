"use client";

import { Heart, MessageCircle, Share2, MoreHorizontal, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function SocialPage() {
    const workouts = useLiveQuery(() => db.workouts.orderBy('startTime').reverse().limit(5).toArray());

    const myPosts = workouts?.map(workout => {
        const duration = workout.endTime
            ? Math.floor((new Date(workout.endTime).getTime() - new Date(workout.startTime).getTime()) / 60000)
            : 0;

        return {
            id: `local-${workout.id}`,
            user: {
                name: "Keshav Mehta",
                handle: "@keshavm",
                initials: "KM",
                image: undefined,
                isMe: true
            },
            content: `Just crushed a ${workout.name} session! ${workout.status === 'completed' ? '💪' : '😅'}`,
            timestamp: calculateTimeAgo(new Date(workout.startTime)),
            stats: {
                likes: 0,
                comments: 0
            },
            workout: {
                name: workout.name,
                duration: workout.status === 'active' ? "Active" : `${duration}m`,
                volume: workout.volume ? `${workout.volume} lbs` : "N/A"
            }
        };
    }) || [];

    const staticPosts = [
        {
            id: 'static-1',
            user: {
                name: "Sarah Jenkins",
                handle: "@sarahj_lifts",
                initials: "SJ",
                image: "/placeholder-avatar.jpg",
                isMe: false
            },
            content: "Finally hit my 225lb deadlift goal! 🚀 The program is working wonders.",
            timestamp: "2h ago",
            stats: {
                likes: 24,
                comments: 5
            },
            workout: {
                name: "Heavy Lower Body",
                duration: "1h 15m",
                volume: "12,450 lbs"
            }
        },
        {
            id: 'static-2',
            user: {
                name: "Mike Ross",
                handle: "@mike_r",
                initials: "MR",
                isMe: false
            },
            content: "Rest day vibes. Mobility work and sauna.",
            timestamp: "5h ago",
            stats: {
                likes: 12,
                comments: 0
            }
        }
    ];

    const feed = [...myPosts, ...staticPosts].sort((a, b) => {
        // Simple sort hack to mix them (My posts first if recent, but basically just array merge)
        // Real app would parse date strings.
        return 0;
    });

    return (
        <div className="min-h-screen pb-24 px-5 pt-8 max-w-md mx-auto bg-background">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Community</h1>
                    <p className="text-sm text-muted-foreground">Your Tribe</p>
                </div>
                <Button size="icon" className="rounded-full bg-primary text-black hover:bg-primary/90">
                    <UserPlus className="h-5 w-5" />
                </Button>
            </header>

            {/* Feed */}
            <div className="space-y-6">
                {feed.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>

            <BottomNav />
        </div>
    );
}

function PostCard({ post }: { post: any }) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.stats.likes);

    const handleLike = () => {
        setLiked(!liked);
        setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    }

    return (
        <Card className="bg-[#111111] border-none p-5">
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                    <Avatar>
                        <AvatarImage src={post.user.image} />
                        <AvatarFallback className="bg-zinc-800 text-zinc-400">{post.user.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{post.user.name}</span>
                            {post.user.isMe && <Badge variant="secondary" className="text-[10px] h-4 px-1">YOU</Badge>}
                            <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                        </div>
                        <span className="text-xs text-muted-foreground block">{post.user.handle}</span>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                {post.content}
            </p>

            {post.workout && (
                <div className="bg-[#1a1a1a] rounded-xl p-3 mb-4 flex items-center justify-between border border-white/5">
                    <div>
                        <div className="text-xs font-bold text-primary uppercase mb-1">Workout Complete</div>
                        <div className="font-bold text-white">{post.workout.name}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-muted-foreground">{post.workout.duration}</div>
                        <div className="text-xs text-muted-foreground">{post.workout.volume}</div>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-6">
                <button
                    onClick={handleLike}
                    className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-red-500 transition-colors group"
                >
                    <Heart className={cn("h-4 w-4 group-hover:fill-red-500 transition-all", liked ? "fill-red-500 text-red-500" : "")} />
                    {likeCount > 0 && likeCount}
                </button>
                <button className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-white transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    {post.stats.comments > 0 && post.stats.comments}
                </button>
                <button className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-white transition-colors ml-auto">
                    <Share2 className="h-4 w-4" />
                </button>
            </div>
        </Card>
    );
}

function calculateTimeAgo(date: Date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
}
