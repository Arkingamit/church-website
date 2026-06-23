"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Headphones, Book, LogIn, BookOpen } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

type NavItem = {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    exact?: boolean;
};

export function MobileBottomNav() {
    const pathname = usePathname();
    const { session } = useAuth();

    const navItems: NavItem[] = [
        { label: "Home", href: "/", icon: Home, exact: true },
        { label: "Sermons", href: "/sermons", icon: BookOpen },
        { label: "Music", href: "/music", icon: Headphones },
        { label: "Events", href: "/events", icon: CalendarDays },
        { label: "Bible", href: "/devotionals", icon: Book },
    ];

    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden pb-[env(safe-area-inset-bottom)]">
            <div className="mx-auto max-w-screen-sm border-t border-border bg-[#FAF7F2] px-2 pt-2 pb-2 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
                <div className="grid grid-cols-5 gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.exact
                            ? pathname === item.href
                            : pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-1 rounded-full px-2 py-2 text-[11px] font-medium transition-colors ${isActive
                                    ? "bg-[#FBE8E8] text-[#8B2323]"
                                    : "text-[#7A6150] hover:bg-[#E5D5C5] hover:text-[#3A2D27]"
                                    }`}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? "text-[#8B2323]" : "text-[#7A6150]"}`} />
                                <span className="leading-none">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}