"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { VOICE_ORDERS } from "@/lib/data-store";
import { motion, AnimatePresence } from "framer-motion";
import {
    PhoneIncoming,
    CheckCircle2,
    Clock,
    Terminal,
    MessageSquare,
    ChevronRight,
    Headphones,
    FileJson,
    Activity,
    User
} from "lucide-react";
import { useState } from "react";

const OrderCard = ({ order, isActive, onClick }) => (
    <motion.div
        onClick={onClick}
        whileHover={{ x: 4 }}
        className={`p-6 rounded-3xl border transition-all cursor-pointer group ${isActive
                ? "bg-slate-900 border-slate-900 shadow-xl shadow-slate-200"
                : "glass border-slate-200/50 hover:border-slate-300"
            }`}
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-xl ${isActive ? "bg-white/10" : "bg-orange-50"}`}>
                <PhoneIncoming className={isActive ? "text-white" : "text-orange-500"} size={18} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-slate-400" : "text-slate-400"}`}>
                {order.time}
            </span>
        </div>

        <h4 className={`font-bold ${isActive ? "text-white" : "text-slate-900"}`}>{order.customer}</h4>
        <p className={`text-xs mt-1 font-medium ${isActive ? "text-slate-400" : "text-slate-500"}`}>
            {order.status === 'COMPLETED' ? 'Order Processed' : 'AI Handling...'}
        </p>

        <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Activity size={14} className={isActive ? "text-emerald-400" : "text-emerald-500"} />
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-emerald-400" : "text-emerald-600"}`}>
                    AI Success
                </span>
            </div>
            <ChevronRight size={16} className={isActive ? "text-white/30" : "text-slate-300 group-hover:translate-x-1 transition-transform"} />
        </div>
    </motion.div>
);

export default function LiveOrdersPage() {
    const [selectedOrder, setSelectedOrder] = useState(VOICE_ORDERS[0]);

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-140px)] flex flex-col gap-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Live Orders</h1>
                    <p className="text-slate-500 font-medium">Real-time AI voice order monitoring</p>
                </div>

                <div className="flex-1 flex gap-8 overflow-hidden">
                    {/* Order List */}
                    <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                        {VOICE_ORDERS.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                isActive={selectedOrder?.id === order.id}
                                onClick={() => setSelectedOrder(order)}
                            />
                        ))}

                        <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center gap-3 opacity-50">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <Clock size={20} />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Waiting for calls...</p>
                        </div>
                    </div>

                    {/* Details Pane */}
                    <div className="flex-1 glass rounded-[40px] border border-slate-200/50 shadow-premium flex flex-col overflow-hidden">
                        <AnimatePresence mode="wait">
                            {selectedOrder ? (
                                <motion.div
                                    key={selectedOrder.id}
                                    initial={{ opacity: 0, scale: 0.99 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.99 }}
                                    className="flex flex-col h-full"
                                >
                                    {/* Pane Header */}
                                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900">{selectedOrder.customer}</h3>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Clock size={12} /> Call Duration: 1m 12s
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                                                <Headphones size={18} /> Human Transfer
                                            </button>
                                            <button className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all">
                                                Resolve
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex overflow-hidden">
                                        {/* Transcript Section */}
                                        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <MessageSquare size={14} /> Voice-to-Text Transcript
                                            </h4>
                                            <div className="space-y-6">
                                                <div className="flex gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-orange-100 shrink-0 flex items-center justify-center text-orange-600 text-[10px] font-black">AI</div>
                                                    <div className="bg-orange-50 p-4 rounded-2xl rounded-tl-none border border-orange-100 max-w-[80%]">
                                                        <p className="text-sm font-medium text-orange-900 leading-relaxed">
                                                            Hello! Welcome to Petpooja Kitchen. What can I get for you today?
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4 flex-row-reverse">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 flex items-center justify-center text-slate-600 text-[10px] font-black italic">CU</div>
                                                    <div className="bg-white p-4 rounded-2xl rounded-tr-none border border-slate-200 shadow-sm max-w-[80%]">
                                                        <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                                                            "{selectedOrder.transcript}"
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-orange-100 shrink-0 flex items-center justify-center text-orange-600 text-[10px] font-black">AI</div>
                                                    <div className="bg-orange-50 p-4 rounded-2xl rounded-tl-none border border-orange-100 max-w-[80%]">
                                                        <p className="text-sm font-medium text-orange-900 leading-relaxed font-bold italic">
                                                            {selectedOrder.aiUpsell}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* JSON Output Section */}
                                        <div className="w-80 border-l border-slate-100 bg-slate-50/50 p-8 overflow-y-auto custom-scrollbar">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <FileJson size={14} /> PoS Payload (JSON)
                                            </h4>
                                            <div className="bg-slate-900 p-6 rounded-2xl shadow-inner relative group">
                                                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-50 transition-opacity">
                                                    <Terminal size={14} className="text-white" />
                                                </div>
                                                <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
                                                    {JSON.stringify(selectedOrder.structuredJson, null, 2)}
                                                </pre>
                                            </div>

                                            <div className="mt-8 space-y-4">
                                                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Final Bill</p>
                                                    <h5 className="text-xl font-black text-slate-900">${selectedOrder.structuredJson.total.toFixed(2)}</h5>
                                                </div>
                                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                                                    <CheckCircle2 size={20} className="text-emerald-500" />
                                                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Sync Successful</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
                                    <PhoneIncoming size={64} className="text-slate-300 mb-6" />
                                    <h3 className="text-2xl font-bold text-slate-900">No active calls</h3>
                                    <p className="text-slate-500 font-medium max-w-sm mt-2">
                                        Select an order from the list to view transcripts and PoS payload integration details.
                                    </p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
