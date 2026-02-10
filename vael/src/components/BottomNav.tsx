"use client";

import { Home, Dumbbell, Users, MessageSquare, User, Play } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/5 pb-8 pt-4 z-50">
            <div className="flex justify-around items-center max-w-md mx-auto px-2 relative">
                <NavItem href="/" icon={Home} label="Home" active={pathname === "/"} />
                <NavItem href="/train" icon={Dumbbell} label="Train" active={pathname?.startsWith("/train")} />

                {/* Floating Action Button (Center) */}
                <div className="relative -top-6">
                    <Link href="/train/active" className="h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/25 flex items-center justify-center text-white hover:scale-105 transition-transform">
                        <Play className="h-6 w-6 ml-1 fill-white" />
                    </Link>
                </div>

                <NavItem href="/social" icon={Users} label="Social" active={pathname?.startsWith("/social")} />
                <NavItem href="/coach" icon={MessageSquare} label="Coach" active={pathname?.startsWith("/coach")} />
                {/* <NavItem href="/profile" icon={User} label="Profile" active={pathname?.startsWith("/profile")} /> */}
            </div>
        </nav>
    );
}

function NavItem({ href, icon: Icon, label, active }: { href: string, icon: any, label: string, active?: boolean }) {
    return (
        <Link href={href} className="flex flex-col items-center gap-1 group min-w-[64px]">
            <Icon className={cn(
                "h-6 w-6 transition-colors",
                active ? "text-primary" : "text-muted-foreground group-hover:text-white"
            )} />
            <span className={cn(
                "text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground group-hover:text-white"
            )}>{label}</span>
        </Link>
    )
}
