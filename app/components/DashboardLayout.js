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
    UserCircle,
    Sun,
    Moon,
    Store,
    Circle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MOCK_RESTAURANT } from "@/lib/data-store";

const sidebarGroups = [
    {
        title: null,
        items: [
            { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
            { name: "Menu", icon: UtensilsCrossed, path: "/edit-menu" },
            { name: "Orders", icon: PhoneCall, path: "/live-orders", badge: 89 },
            { name: "Analytics", icon: BarChart3, path: "/menu-analytics" },
            { name: "Teams", icon: UserCircle, path: "/teams" },
        ]
    }
];

export default function DashboardLayout({ children }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Determine dark mode state securely after mount
    const isDarkMode = mounted && theme === 'dark';

    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, title: "Call Accepted", desc: "AI successfully handled call from Rahul", type: "success", time: "2m ago" },
        { id: 2, title: "Transfer Requested", desc: "Customer Priya requested human agent", type: "warning", time: "5m ago" },
        { id: 3, title: "Call Rejected", desc: "Spam call detected and blocked", type: "error", time: "12m ago" },
    ]);

    useEffect(() => {
        setMounted(true);
    }, []);

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
                    "flex flex-col border-r z-30 transition-all overflow-hidden",
                    isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-[#e2e8f0] text-slate-900",
                    !isSidebarOpen && "border-none"
                )}
            >
                <div className="p-6 mb-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-500 p-1.5 rounded-lg">
                            <UtensilsCrossed className="text-white w-5 h-5" />
                        </div>
                        <span className={cn("font-extrabold text-lg tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>Restoboard</span>
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
                                            ? "bg-orange-500 text-white shadow-lg shadow-orange-100 dark:shadow-none"
                                            : cn("transition-all", isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")
                                    )}>
                                        <item.icon size={20} className={cn(isActive ? "text-white" : (isDarkMode ? "text-slate-500 group-hover:text-slate-300" : "text-slate-400 group-hover:text-slate-600"))} />
                                        <span>{item.name}</span>
                                        {item.badge && (
                                            <span className="ml-auto bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-lg text-[10px] font-bold">{item.badge}</span>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </nav>

                <div className="p-4">
                    <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/login" })} className={cn("w-full justify-start gap-3 rounded-xl transition-all", isDarkMode ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10" : "text-slate-400 hover:text-red-500 hover:bg-red-50")}>
                        <LogOut size={20} />
                        <span className="text-sm font-medium">Log out</span>
                    </Button>
                </div>
            </motion.aside>

            {/* Content Area */}
            <div className={cn("flex-1 flex flex-col min-w-0 transition-colors duration-300", isDarkMode ? "bg-slate-950" : "bg-[#f8fafc]")}>
                <header className={cn(
                    "h-16 border-b flex items-center justify-between px-8 relative z-20 transition-all duration-300",
                    isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-[#e2e8f0]"
                )}>
                    <div className="flex items-center gap-6 flex-1">
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={isDarkMode ? "text-slate-500" : "text-slate-400"}>
                            <div className={cn("p-1.5 rounded-full", isDarkMode ? "bg-slate-800" : "bg-slate-100")}>
                                <Plus size={16} className={cn("transition-transform", isSidebarOpen ? "rotate-45" : "rotate-0")} />
                            </div>
                        </Button>

                        <div className="flex items-center gap-2">
                            <div className="bg-orange-500 p-1.5 rounded-lg shadow-lg shadow-orange-100">
                                <Store className="text-white w-4 h-4" />
                            </div>
                            <span className={cn("font-black tracking-tight text-lg", isDarkMode ? "text-white" : "text-slate-900")}>
                                {MOCK_RESTAURANT.name}
                            </span>
                        </div>

                    </div>

                    <div className="flex items-center gap-2">
                        {/* Dark Mode Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
                            className={cn("rounded-2xl transition-all", isDarkMode ? "bg-slate-800 text-yellow-400" : "bg-slate-50 text-slate-400")}
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </Button>

                        {/* Notifications */}
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={cn("rounded-2xl relative", isDarkMode ? "bg-slate-800 text-slate-400" : "bg-slate-50 text-slate-400")}
                            >
                                <Bell size={18} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
                            </Button>

                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className={cn(
                                            "absolute right-0 top-full mt-2 w-80 rounded-[24px] border shadow-premium overflow-hidden z-50",
                                            isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-900"
                                        )}
                                    >
                                        <div className={cn("p-4 border-b flex justify-between items-center", isDarkMode ? "border-slate-800" : "border-slate-50")}>
                                            <span className={cn("text-xs font-black uppercase tracking-widest", isDarkMode ? "text-slate-400" : "text-slate-900")}>Notifications</span>
                                            <Badge variant="outline" className={cn("text-[9px] font-black", isDarkMode ? "border-slate-700 text-white" : "")}>{notifications.length} New</Badge>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            {notifications.map(n => (
                                                <div key={n.id} className={cn("p-3 rounded-2xl transition-colors cursor-pointer group", isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-50")}>
                                                    <div className="flex justify-between mb-1">
                                                        <span className={cn(
                                                            "text-[10px] font-black uppercase tracking-wider",
                                                            n.type === 'success' ? 'text-emerald-600' : n.type === 'warning' ? 'text-orange-500' : 'text-rose-500'
                                                        )}>{n.title}</span>
                                                        <span className="text-[9px] font-bold text-slate-500">{n.time}</span>
                                                    </div>
                                                    <p className={cn("text-xs font-medium", isDarkMode ? "text-slate-400 group-hover:text-slate-300" : "text-slate-600 group-hover:text-slate-900")}>{n.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className={cn("p-3 border-t text-center", isDarkMode ? "border-slate-800" : "border-slate-50")}>
                                            <button className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:text-orange-600">View All Pipeline</button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="h-8 w-px bg-slate-100 mx-2 hidden sm:block" />

                        {/* Premium User Profile Section */}
                        <div className={cn(
                            "flex items-center gap-3 p-1 pl-3 pr-2 rounded-2xl transition-all border",
                            isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50/50 border-slate-100"
                        )}>
                            <div className="text-right hidden sm:block">
                                <p className={cn("text-xs font-black tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>{session.user.name}</p>
                                <div className="flex items-center justify-end gap-1.5">
                                    <Circle size={4} className="fill-orange-500 text-orange-500" />
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Administrator</p>
                                </div>
                            </div>
                            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                <AvatarImage src={session.user.image} />
                                <AvatarFallback className="bg-orange-500 text-white text-xs font-black">{session.user.name?.[0]}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                <main className={cn("flex-1 overflow-y-auto custom-scrollbar transition-colors duration-300", isDarkMode ? "bg-slate-950 text-white" : "bg-[#f8fafc] text-[#0f172a]")}>
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
