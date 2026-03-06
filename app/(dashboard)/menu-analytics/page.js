"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { PROCESSED_MENU } from "@/lib/data-store";
import { motion } from "framer-motion";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceArea
} from "recharts";
import { TrendingUp, AlertCircle, Info, ChevronRight, Zap } from "lucide-react";

const MatrixLabel = ({ x, y, label, color }) => (
    <div className={`absolute ${x} ${y} flex items-center gap-2 px-3 py-1.5 rounded-xl border ${color} bg-white shadow-sm z-10`}>
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </div>
);

export default function MenuAnalyticsPage() {
    const avgMargin = PROCESSED_MENU.reduce((acc, i) => acc + i.margin, 0) / PROCESSED_MENU.length;
    const avgPop = 50;

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Menu Analytics</h1>
                    <p className="text-slate-500 font-medium">SKU performance and profitability matrix</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Matrix Chart */}
                    <div className="lg:col-span-2 glass p-8 rounded-[32px] border border-slate-200/50 shadow-premium relative">
                        <h3 className="text-xl font-bold text-slate-900 mb-8 italic">Popularity vs. Profitability Matrix</h3>

                        {/* Quadrant Labels */}
                        <div className="absolute inset-0 pointer-events-none p-12">
                            <MatrixLabel x="top-12" y="right-12" label="Stars" color="border-emerald-100 text-emerald-600" />
                            <MatrixLabel x="top-12" y="left-12" label="Challenges" color="border-orange-100 text-orange-600" />
                            <MatrixLabel x="bottom-12" y="right-12" label="Workhorses" color="border-blue-100 text-blue-600" />
                            <MatrixLabel x="bottom-12" y="left-12" label="Dogs" color="border-slate-100 text-slate-400" />
                        </div>

                        <div className="h-[450px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        type="number"
                                        dataKey="popularityScore"
                                        name="Popularity"
                                        domain={[0, 100]}
                                        label={{ value: 'Popularity Score →', position: 'bottom', offset: 0, fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                    />
                                    <YAxis
                                        type="number"
                                        dataKey="margin"
                                        name="Profit Margin"
                                        unit="$"
                                        domain={[0, 12]}
                                        label={{ value: 'Margin ($) →', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                    />
                                    <Tooltip
                                        cursor={{ strokeDasharray: '3 3' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white p-4 rounded-2xl shadow-premium border border-slate-100">
                                                        <p className="font-bold text-slate-900">{data.foodName}</p>
                                                        <p className="text-xs font-semibold text-orange-500 uppercase">{data.classification}</p>
                                                        <div className="mt-2 text-sm text-slate-500">
                                                            <p>Margin: ${data.margin.toFixed(2)}</p>
                                                            <p>Popularity: {data.popularityScore}</p>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Scatter name="Menu Items" data={PROCESSED_MENU}>
                                        {PROCESSED_MENU.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    entry.classification === "Star" ? "#10b981" :
                                                        entry.classification === "Challenge" ? "#f97316" :
                                                            entry.classification === "Workhorse" ? "#0ea5e9" : "#94a3b8"
                                                }
                                            />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Side Info Board */}
                    <div className="space-y-6">
                        <div className="gradient-primary p-8 rounded-[32px] text-white shadow-premium relative overflow-hidden">
                            <Zap className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
                            <h3 className="text-xl font-bold mb-2 italic">Intelligence Alert</h3>
                            <p className="text-sm opacity-90 leading-relaxed font-medium mb-6">
                                We've detected that <span className="underline decoration-white/40">3 items</span> in the "Dog" quadrant can be optimized through association bundling.
                            </p>
                            <button className="w-full bg-white text-orange-600 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all">
                                Review in AI Hub <ChevronRight size={18} />
                            </button>
                        </div>

                        <div className="glass p-8 rounded-[32px] border border-slate-200/50 shadow-premium">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 italic">SKU Health Summary</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'High Velocity (Stars)', count: PROCESSED_MENU.filter(i => i.classification === 'Star').length, color: 'emerald' },
                                    { label: 'Under-promoted (Challenges)', count: PROCESSED_MENU.filter(i => i.classification === 'Challenge').length, color: 'orange' },
                                    { label: 'Volume Staple (Workhorses)', count: PROCESSED_MENU.filter(i => i.classification === 'Workhorse').length, color: 'blue' },
                                    { label: 'Underperforming (Dogs)', count: PROCESSED_MENU.filter(i => i.classification === 'Dog').length, color: 'slate' },
                                ].map((stat, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                                        <span className="text-sm font-semibold text-slate-600">{stat.label}</span>
                                        <span className={`text-sm font-bold text-${stat.color}-600 bg-${stat.color}-50 px-3 py-1 rounded-lg`}>
                                            {stat.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="glass rounded-[32px] border border-slate-200/50 shadow-premium overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-900 italic">Detailed SKU Performance</h3>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <Info size={14} /> Auto-synced with POS
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Item Name</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Cost/Price</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Margin %</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Velocity</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Classification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {PROCESSED_MENU.sort((a, b) => b.margin - a.margin).map((item, i) => (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={item.foodId}
                                        className="group hover:bg-slate-50/50 transition-colors cursor-default"
                                    >
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-slate-900">{item.foodName}</p>
                                            <p className="text-xs text-slate-400 font-medium">{item.category}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 font-bold">
                                                <span className="text-slate-400 text-xs">${item.foodCost}</span>
                                                <ChevronRight size={14} className="text-slate-300" />
                                                <span className="text-slate-900">${item.price}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 rounded-full"
                                                        style={{ width: `${(item.margin / item.price) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">
                                                    {((item.margin / item.price) * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-bold text-slate-700">{item.popularityScore}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl ${item.classification === "Star" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                    item.classification === "Challenge" ? "bg-orange-50 text-orange-600 border border-orange-100" :
                                                        item.classification === "Workhorse" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                                            "bg-slate-50 text-slate-400 border border-slate-100"
                                                }`}>
                                                {item.classification}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
