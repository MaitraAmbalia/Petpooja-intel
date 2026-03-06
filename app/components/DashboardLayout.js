"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    BarChart3,
    Sparkles,
    UtensilsCrossed,
    PhoneCall,
    LogOut,
    ChevronDown,
    Menu as MenuIcon,
    X,
    Settings,
    Bell,
    Plus,
    Mic2,
    Library,
    UserCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const sidebarGroups = [
    {
        title: null,
        items: [
            { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
            {
                name: "Menu", icon: UtensilsCrossed, path: "/edit-menu", children: [
                    { name: "Starters", path: "/menu/starters" },
                    { name: "Breakfast", path: "/menu/breakfast" },
                    { name: "Lunch", path: "/menu/lunch" },
                    { name: "Dinner", path: "/menu/dinner" },
                    { name: "Sweets", path: "/menu/sweets" },
                    { name: "Drinks", path: "/menu/drinks" },
                ]
            },
            { name: "Orders", icon: PhoneCall, path: "/live-orders", badge: 89 },
            { name: "Analytics", icon: BarChart3, path: "/menu-analytics" },
            { name: "Messages", icon: Bell, path: "/messages" },
            { name: "Teams", icon: UserCircle, path: "/teams" },
            { name: "Settings", icon: Settings, path: "/settings" },
        ]
    }
];

export default function DashboardLayout({ children }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-white">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-16 h-1 w-16 bg-orange-500 rounded-full"
                />
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-[#0f172a] font-sans">
            {/* Restoboard Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 240 : 0 }}
                className={cn(
                    "flex flex-col border-r border-[#e2e8f0] bg-white z-30 transition-all",
                    !isSidebarOpen && "border-none"
                )}
            >
                <div className="p-6 mb-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-500 p-1.5 rounded-lg">
                            <UtensilsCrossed className="text-white w-5 h-5" />
                        </div>
                        <span className="font-extrabold text-lg tracking-tight">Restoboard</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 overflow-y-auto space-y-1 custom-scrollbar">
                    {sidebarGroups[0].items.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <div key={item.path}>
                                <Link href={item.path}>
                                    <div className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group cursor-pointer font-medium text-sm",
                                        isActive
                                            ? "bg-orange-500 text-white shadow-lg shadow-orange-100"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    )}>
                                        <item.icon size={20} className={cn(isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                                        <span>{item.name}</span>
                                        {item.badge && (
                                            <span className="ml-auto bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-lg text-[10px] font-bold">{item.badge}</span>
                                        )}
                                    </div>
                                </Link>
                                {item.children && isActive && (
                                    <div className="ml-9 mt-1 space-y-1 border-l-2 border-orange-100 pl-4">
                                        {item.children.map(child => (
                                            <div key={child.name} className="py-2 text-xs font-medium text-slate-500 hover:text-orange-500 cursor-pointer transition-colors">
                                                • {child.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className="p-4">
                    <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/login" })} className="w-full justify-start gap-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl">
                        <LogOut size={20} />
                        <span className="text-sm font-medium">Log out</span>
                    </Button>
                </div>
            </motion.aside>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b border-[#e2e8f0] flex items-center justify-between px-8 bg-white relative z-20">
                    <div className="flex items-center gap-6 flex-1">
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400">
                            <div className="bg-slate-100 p-1.5 rounded-full">
                                <Plus size={16} className={cn("transition-transform", isSidebarOpen ? "rotate-45" : "rotate-0")} />
                            </div>
                        </Button>
                        <div className="relative max-w-md w-full hidden md:block">
                            <Plus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full bg-[#f8fafc] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-orange-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="text-slate-400 rounded-full bg-slate-50">
                            <Bell size={20} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 rounded-full bg-slate-50">
                            <Plus size={20} />
                        </Button>
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900 leading-none">{session.user.name}</p>
                                <p className="text-[10px] text-slate-400 mt-1">Manager</p>
                            </div>
                            <Avatar className="w-9 h-9 border border-slate-100">
                                <AvatarImage src={session.user.image} />
                                <AvatarFallback className="bg-orange-500 text-white text-[10px] font-bold">{session.user.name?.[0]}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}
