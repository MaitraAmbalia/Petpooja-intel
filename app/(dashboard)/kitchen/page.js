"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChefHat, Clock, Flame, GlassWater, IceCream2,
    CheckCircle2, X, MessageSquare, Truck, ShoppingBag,
    Store, Volume2, VolumeX, RefreshCw, Phone, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const POLL_INTERVAL = 3000;
const NEXT = { pending: "preparing", preparing: "ready" };

function elapsedMin(ts) { return (Date.now() - new Date(ts).getTime()) / 60000; }
function slaColor(el, pt) { return el <= pt ? "green" : el <= pt + 5 ? "yellow" : "red"; }
function fmtTimer(ts) {
    const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

const ST = {
    Grill: { icon: Flame, bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-500" },
    Drinks: { icon: GlassWater, bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-500" },
    Dessert: { icon: IceCream2, bg: "bg-pink-50 dark:bg-pink-900/20", text: "text-pink-500" },
};

// ─── Transcript Modal ───────────────────────────────────────────
function TranscriptModal({ orderId, onClose }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/transcripts?orderId=${orderId}`)
            .then(r => r.json())
            .then(d => { if (d.success && d.data.length) setMessages(d.data[0].messages || []); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [orderId]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-lg max-h-[70vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="text-orange-500" size={20} />
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white">AI Conversation</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order {orderId}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} className="text-slate-400" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loading ? <p className="text-center text-slate-400 text-sm py-12 animate-pulse">Loading...</p>
                        : messages.length === 0 ? <p className="text-center text-slate-400 text-sm py-12">No transcript available.</p>
                            : messages.map((msg, i) => (
                                <div key={i} className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}>
                                    <div className={cn("w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black",
                                        msg.role === "ai" ? "bg-orange-100 text-orange-600" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300")}>
                                        {msg.role === "ai" ? "AI" : "CU"}
                                    </div>
                                    <div className={cn("p-3 rounded-2xl max-w-[80%] text-sm font-medium leading-relaxed",
                                        msg.role === "ai" ? "bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-200 rounded-tl-none border border-orange-100 dark:border-orange-800"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tr-none")}>{msg.text}</div>
                                </div>
                            ))}
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── KOT Card (per-item Start/Done buttons) ─────────────────────
function KOTCard({ kot, onUpdateItem, onTranscript }) {
    const [timer, setTimer] = useState(fmtTimer(kot.createdAt));
    const el = elapsedMin(kot.createdAt);
    const isDone = kot.status === "completed";
    const color = isDone ? "done" : slaColor(el, kot.defaultPrepTime);
    const st = ST[kot.station] || ST.Grill;
    const Icon = st.icon;

    useEffect(() => {
        if (isDone) return;
        const iv = setInterval(() => setTimer(fmtTimer(kot.createdAt)), 1000);
        return () => clearInterval(iv);
    }, [kot.createdAt, isDone]);

    const borderMap = {
        green: "border-emerald-200 dark:border-emerald-800",
        yellow: "border-amber-300 dark:border-amber-700 shadow-amber-50",
        red: "border-red-400 dark:border-red-700 shadow-red-50 animate-pulse",
        done: "border-slate-200 dark:border-slate-700 opacity-60",
    };
    const timerMap = {
        green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
        yellow: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
        red: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
        done: "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
    };

    return (
        <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className={cn("rounded-[24px] border-2 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden", borderMap[color])}>

            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-xl", st.bg)}><Icon size={18} className={st.text} /></div>
                        <div>
                            <p className="font-black text-sm text-slate-900 dark:text-white tracking-tight">{kot.customerName || "Walk-in"}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{kot.station}</span>
                                <span className="text-[9px] text-slate-300">·</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{kot.kotId.slice(-6)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        {/* Order type */}
                        <span className={cn("text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg",
                            kot.orderType === "delivery" ? "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
                                : kot.orderType === "dine-in" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30"
                                    : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400")}>
                            {kot.orderType === "delivery" ? <Truck size={10} className="inline mr-1" /> : kot.orderType === "dine-in" ? <Store size={10} className="inline mr-1" /> : <ShoppingBag size={10} className="inline mr-1" />}
                            {kot.orderType}
                        </span>
                        {kot.priority === "rush" && <span className="text-[9px] font-black uppercase px-2 py-1 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/30 animate-pulse">🔥 RUSH</span>}
                    </div>
                </div>
                {/* Phone + address */}
                <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-400">
                    <span className="flex items-center gap-1"><Phone size={10} /> {kot.phoneNo}</span>
                </div>
                {kot.orderType === "delivery" && kot.address && (
                    <div className="flex items-center gap-1.5 mt-1">
                        <MapPin size={10} className="text-violet-400" />
                        <span className="text-[10px] font-medium text-slate-400 truncate">{kot.address}</span>
                    </div>
                )}
            </div>

            {/* Timer */}
            <div className={cn("px-4 py-2 flex items-center justify-between", timerMap[color])}>
                <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span className="text-xs font-black tracking-wider tabular-nums">{isDone ? "DONE" : timer}</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">
                    {isDone ? "Completed" : `Target: ${kot.defaultPrepTime}min`}
                </span>
            </div>

            {/* Items with per-item buttons */}
            <div className="p-4 flex-1 space-y-2">
                {kot.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {item.status === "ready" ? (
                                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                            ) : item.status === "preparing" ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                                    <RefreshCw size={16} className="text-blue-500 shrink-0" />
                                </motion.div>
                            ) : (
                                <Clock size={16} className="text-slate-400 shrink-0" />
                            )}
                            <div className="min-w-0">
                                <p className={cn("text-sm font-bold truncate",
                                    item.status === "ready" ? "text-slate-400 line-through" : "text-slate-900 dark:text-white")}>{item.name}</p>
                                <p className="text-[10px] font-bold text-slate-400">×{item.qty}</p>
                            </div>
                        </div>
                        {item.status !== "ready" && !isDone && (
                            <button
                                onClick={() => onUpdateItem(kot.kotId, item.foodId, NEXT[item.status])}
                                className={cn("text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all active:scale-95",
                                    item.status === "pending"
                                        ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-100"
                                        : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-100")}>
                                {item.status === "pending" ? "Start" : "Done"}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="px-4 pb-4">
                <button onClick={() => onTranscript(kot.orderId)}
                    className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors py-2 flex items-center justify-center gap-2">
                    <MessageSquare size={12} /> View Transcript
                </button>
            </div>
        </motion.div>
    );
}

// ─── Main Kitchen Page ──────────────────────────────────────────
export default function KitchenPage() {
    const [kots, setKots] = useState([]);
    const [activeStation, setActiveStation] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [transcriptId, setTranscriptId] = useState(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const prevCountRef = useRef(0);
    const audioRef = useRef(null);
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => {
        audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVgGAACA");
    }, []);

    const playBell = useCallback(() => {
        if (soundEnabled && audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => { }); }
    }, [soundEnabled]);

    const fetchKOTs = useCallback(async () => {
        try {
            const params = activeStation !== "all" ? `?station=${activeStation}` : "";
            const res = await fetch(`/api/kot${params}`);
            const data = await res.json();
            if (data.success) {
                const active = data.data.filter(k => k.status !== "completed");
                if (active.length > prevCountRef.current && prevCountRef.current > 0) playBell();
                prevCountRef.current = active.length;
                setKots(data.data);
            }
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    }, [activeStation, playBell]);

    useEffect(() => { fetchKOTs(); const iv = setInterval(fetchKOTs, POLL_INTERVAL); return () => clearInterval(iv); }, [fetchKOTs]);

    const handleUpdateItem = async (kotId, foodId, newStatus) => {
        try {
            const res = await fetch("/api/kot", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ kotId, foodId, newStatus }),
            });
            const d = await res.json();
            if (d.success) {
                setKots(prev => prev.map(k => k.kotId !== kotId ? k : { ...k, ...d.data, items: d.data.items || k.items }));
            }
        } catch (e) { console.error(e); }
    };

    const activeKOTs = kots.filter(k => k.status !== "completed");
    const completedKOTs = kots.filter(k => k.status === "completed");
    const overdueKOTs = activeKOTs.filter(k => slaColor(elapsedMin(k.createdAt), k.defaultPrepTime) === "red");

    const stations = [
        { key: "all", label: "All Stations", count: activeKOTs.length },
        { key: "Grill", label: "Grill", icon: Flame, count: activeKOTs.filter(k => k.station === "Grill").length },
        { key: "Drinks", label: "Drinks", icon: GlassWater, count: activeKOTs.filter(k => k.station === "Drinks").length },
        { key: "Dessert", label: "Dessert", icon: IceCream2, count: activeKOTs.filter(k => k.station === "Dessert").length },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <ChefHat className="text-emerald-500" size={32} /> Kitchen Display
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                            {activeKOTs.length} active tickets · {completedKOTs.length} completed
                            {overdueKOTs.length > 0 && <span className="text-red-500 font-bold ml-2">· {overdueKOTs.length} overdue!</span>}
                        </p>
                    </div>
                    <button onClick={() => setSoundEnabled(!soundEnabled)}
                        className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border",
                            soundEnabled ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                                : "bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700")}>
                        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />} Bell {soundEnabled ? "ON" : "OFF"}
                    </button>
                </div>

                {/* Station Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {stations.map(s => (
                        <button key={s.key} onClick={() => setActiveStation(s.key)}
                            className={cn("flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border",
                                activeStation === s.key
                                    ? "bg-slate-900 text-white border-slate-900 shadow-lg dark:bg-white dark:text-slate-900 dark:border-white"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700")}>
                            {s.icon && <s.icon size={16} />} {s.label}
                            <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-lg",
                                activeStation === s.key ? "bg-white/20 dark:bg-slate-900/30" : "bg-slate-100 dark:bg-slate-800")}>{s.count}</span>
                        </button>
                    ))}
                </div>

                {/* KOT Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-64 text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">Loading kitchen orders...</div>
                ) : activeKOTs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <ChefHat size={64} className="text-slate-200 dark:text-slate-700 mb-4" />
                        <h3 className="text-lg font-bold text-slate-400 dark:text-slate-500">Kitchen is clear!</h3>
                        <p className="text-sm text-slate-400 dark:text-slate-600 mt-1">No active orders. Waiting for new tickets...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                        <AnimatePresence>
                            {activeKOTs
                                .sort((a, b) => {
                                    const ao = slaColor(elapsedMin(a.createdAt), a.defaultPrepTime) === "red";
                                    const bo = slaColor(elapsedMin(b.createdAt), b.defaultPrepTime) === "red";
                                    if (ao !== bo) return ao ? -1 : 1;
                                    return new Date(a.createdAt) - new Date(b.createdAt);
                                })
                                .map(kot => <KOTCard key={kot.kotId} kot={kot} onUpdateItem={handleUpdateItem} onTranscript={setTranscriptId} />)}
                        </AnimatePresence>
                    </div>
                )}

                {/* Completed */}
                {completedKOTs.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <CheckCircle2 size={14} /> Completed ({completedKOTs.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                            {completedKOTs.slice(0, 8).map(kot => <KOTCard key={kot.kotId} kot={kot} onUpdateItem={handleUpdateItem} onTranscript={setTranscriptId} />)}
                        </div>
                    </div>
                )}

                {/* Transcript Modal */}
                <AnimatePresence>
                    {transcriptId && <TranscriptModal orderId={transcriptId} onClose={() => setTranscriptId(null)} />}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}
