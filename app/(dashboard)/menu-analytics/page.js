"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getPriceOptimization, classifyMenuItems, getStrategicCombos } from "@/lib/revenue-engine";
import { motion } from "framer-motion";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine
} from "recharts";
import { TrendingUp, Info, ChevronRight, Zap, ShoppingBag, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ComboPanel = ({ title, icon: Icon, combos, colorClass }) => (
    <div className="glass rounded-[32px] border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden h-full flex flex-col bg-white/50 dark:bg-slate-900/50">
        <div className="w-full p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${colorClass}`}>
                    <Icon size={20} />
                </div>
                <div className="text-left">
                    <h4 className="font-black text-slate-900 dark:text-white tracking-tight">{title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{combos.length} AI Recommendations</p>
                </div>
            </div>
        </div>
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            {combos.map((combo, idx) => (
                <div key={idx} className="p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <h5 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{combo.name}</h5>
                        <Badge className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-none">-{combo.discount}%</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {combo.items.map((item, i) => (
                            <Badge key={i} variant="outline" className="border-slate-100 text-slate-500 font-bold bg-slate-50">
                                {item.name}
                            </Badge>
                        ))}
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <div className="flex items-baseline gap-2">
                            <span className="font-black text-slate-900 dark:text-white text-sm">₹{combo.discountedPrice}</span>
                            <span className="text-slate-400 line-through">₹{combo.basePrice}</span>
                        </div>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-tighter">Profit +₹{combo.newMargin}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default function MenuAnalyticsPage() {
    const [processedMenu, setProcessedMenu] = useState([]);
    const [strategicCombos, setStrategicCombos] = useState({ trio: [], snackBev: [], snackDessert: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchAndProcess() {
            try {
                const res = await fetch('/api/menu');
                const result = await res.json();
                if (result.success && result.data.length > 0) {
                    const items = result.data;
                    const avgMargin = items.reduce((acc, i) => acc + (i.margin || (i.price - (i.cost || 0))), 0) / items.length;
                    const avgPopularity = items.reduce((acc, i) => acc + (i.popularityScore || 0), 0) / items.length;
                    const classified = classifyMenuItems(items, avgMargin, avgPopularity);
                    const combos = getStrategicCombos(classified);
                    setProcessedMenu(classified);
                    setStrategicCombos(combos);
                }
            } catch (e) {
                console.error("Failed to load analytics data:", e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchAndProcess();
    }, []);

    // Dynamic axis domains from real data
    const maxPop = processedMenu.length > 0
        ? Math.ceil(Math.max(...processedMenu.map(i => i.popularityScore || 0)) * 1.2)
        : 10000;
    const maxMargin = processedMenu.length > 0
        ? Math.ceil(Math.max(...processedMenu.map(i => i.margin || 0)) * 1.2)
        : 150;
    const avgPopVal = processedMenu.length > 0
        ? processedMenu.reduce((a, i) => a + (i.popularityScore || 0), 0) / processedMenu.length
        : 0;
    const avgMarginVal = processedMenu.length > 0
        ? processedMenu.reduce((a, i) => a + (i.margin || 0), 0) / processedMenu.length
        : 0;

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Menu Analytics</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">SKU performance and profitability matrix</p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64 text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">
                        Loading live analytics data...
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Matrix Chart */}
                            <div className="lg:col-span-2 glass p-8 rounded-[32px] border border-slate-200/50 dark:border-slate-800 shadow-premium relative">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 italic">Popularity vs. Profitability Matrix</h3>
                                <p className="text-xs text-slate-400 font-medium mb-6">Live data · {processedMenu.length} items · dashed lines = avg thresholds</p>

                                <div className="h-[450px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ScatterChart margin={{ top: 20, right: 30, bottom: 50, left: 30 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis
                                                type="number"
                                                dataKey="popularityScore"
                                                name="Popularity"
                                                domain={[0, maxPop]}
                                                label={{ value: 'Popularity Score →', position: 'insideBottom', offset: -15, fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
                                            />
                                            <YAxis
                                                type="number"
                                                dataKey="margin"
                                                name="Profit Margin"
                                                unit="₹"
                                                domain={[0, maxMargin]}
                                                label={{ value: 'Margin (₹) →', angle: -90, position: 'insideLeft', offset: 15, fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                            />
                                            {/* Quadrant dividers at average values */}
                                            <ReferenceLine x={avgPopVal} stroke="#cbd5e1" strokeDasharray="6 3" strokeWidth={1.5} />
                                            <ReferenceLine y={avgMarginVal} stroke="#cbd5e1" strokeDasharray="6 3" strokeWidth={1.5} />
                                            <Tooltip
                                                cursor={{ strokeDasharray: '3 3' }}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-800">
                                                                <p className="font-bold text-slate-900 dark:text-white">{data.name}</p>
                                                                <p className="text-xs font-semibold text-orange-500 uppercase mb-2">{data.classification}</p>
                                                                <p className="text-xs text-slate-500">Price: ₹{data.price}</p>
                                                                <p className="text-xs text-slate-500">Margin: ₹{(data.margin || 0).toFixed(2)}</p>
                                                                <p className="text-xs text-slate-500">Popularity: {(data.popularityScore || 0).toFixed(2)}</p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Scatter name="Menu Items" data={processedMenu}>
                                                {processedMenu.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            entry.classification === "Star" ? "#10b981" :
                                                                entry.classification === "Challenge" ? "#f97316" :
                                                                    entry.classification === "Workhorse" ? "#0ea5e9" : "#94a3b8"
                                                        }
                                                        r={7}
                                                    />
                                                ))}
                                            </Scatter>
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Legend */}
                                <div className="flex flex-wrap gap-4 mt-2">
                                    {[
                                        { label: 'Star', color: '#10b981', desc: 'High Profit + High Pop' },
                                        { label: 'Workhorse', color: '#0ea5e9', desc: 'Low Profit + High Pop' },
                                        { label: 'Challenge', color: '#f97316', desc: 'High Profit + Low Pop' },
                                        { label: 'Dog', color: '#94a3b8', desc: 'Low Profit + Low Pop' },
                                    ].map(({ label, color, desc }) => (
                                        <div key={label} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
                                            <span className="text-[10px] text-slate-400 hidden sm:inline">— {desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Side Info Board */}
                            <div className="space-y-6">
                                <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-premium">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 italic">SKU Health Summary</h3>
                                    <div className="space-y-2">
                                        {[
                                            { label: 'High Velocity (Stars)', count: processedMenu.filter(i => i.classification === 'Star').length, color: 'emerald', hex: '#10b981' },
                                            { label: 'Under-promoted (Challenges)', count: processedMenu.filter(i => i.classification === 'Challenge').length, color: 'orange', hex: '#f97316' },
                                            { label: 'Volume Staple (Workhorses)', count: processedMenu.filter(i => i.classification === 'Workhorse').length, color: 'blue', hex: '#0ea5e9' },
                                            { label: 'Underperforming (Dogs)', count: processedMenu.filter(i => i.classification === 'Dog').length, color: 'slate', hex: '#94a3b8' },
                                        ].map((stat, i) => (
                                            <div key={i} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.hex }} />
                                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{stat.label}</span>
                                                </div>
                                                <span className={`text-xs font-bold text-${stat.color}-600 bg-${stat.color}-50 dark:bg-${stat.color}-900/30 px-2 py-0.5 rounded-md`}>
                                                    {stat.count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Optimization Strategies */}
                                <div className="bg-slate-900 p-5 rounded-2xl text-white shadow-premium relative overflow-hidden">
                                    <TrendingUp className="absolute -right-2 -bottom-2 w-24 h-24 opacity-10" />
                                    <h3 className="text-base font-bold mb-3 italic">Price Optimization</h3>
                                    <div className="space-y-2 relative z-10">
                                        {[
                                            { color: 'emerald', label: 'Stars (High Demand)', text: 'Inelastic demand detected. Consider a +5% to +8% price increase to maximize margins.' },
                                            { color: 'blue', label: 'Workhorses (Staples)', text: 'Highly price sensitive. Maintain pricing but optimize supply chain food costs.' },
                                            { color: 'orange', label: 'Challenges (High Profit)', text: 'Bundle with Workhorses or run promotions to boost trial rates and ticket size.' },
                                        ].map(({ color, label, text }) => (
                                            <div key={label} className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/5">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <div className={`w-2 h-2 rounded-full bg-${color}-400`} />
                                                    <h4 className="font-bold text-[11px] tracking-widest uppercase">{label}</h4>
                                                </div>
                                                <p className="text-[10px] font-medium text-white/90 leading-relaxed">{text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bundle Intelligence Area */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 px-2">
                                <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-100">
                                    <Zap className="text-white w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-400 dark:text-slate-500 tracking-tight">AI STRATEGIC BUNDLES</h2>
                                    <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">Cross-Category Optimization Engines</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <ComboPanel title="Supreme Trio Engine" icon={Star} combos={strategicCombos.trio || []} colorClass="bg-indigo-50 text-indigo-600" />
                                <ComboPanel title="Quick Bite Engine" icon={ShoppingBag} combos={strategicCombos.snackBev || []} colorClass="bg-emerald-50 text-emerald-600" />
                                <ComboPanel title="Sweet Pairing Engine" icon={Zap} combos={strategicCombos.snackDessert || []} colorClass="bg-orange-50 text-orange-600" />
                            </div>
                        </div>

                        {/* Detailed Table */}
                        <div className="glass rounded-[32px] border border-slate-200/50 dark:border-slate-800 shadow-premium overflow-hidden">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white italic">Detailed SKU Performance</h3>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                    <Info size={14} /> Live from MongoDB
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                            {['Item Name', 'Cost / Price', 'Margin %', 'Velocity', 'Classification', 'Suggested Price'].map(h => (
                                                <th key={h} className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {([...processedMenu].sort((a, b) => (b.margin || 0) - (a.margin || 0))).map((item, i) => (
                                            <motion.tr
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: i * 0.02 }}
                                                key={item.foodId || item._id}
                                                className="group hover:bg-slate-50/50 transition-colors cursor-default"
                                            >
                                                <td className="px-8 py-6">
                                                    <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{item.category}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 font-bold">
                                                        <span className="text-slate-400 dark:text-slate-500 text-xs">₹{item.cost ?? '—'}</span>
                                                        <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
                                                        <span className="text-slate-900 dark:text-white">₹{item.price}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-1.5 w-20 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-emerald-500 rounded-full"
                                                                style={{ width: `${Math.min(100, ((item.margin || 0) / item.price) * 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                            {(((item.margin || 0) / item.price) * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{(item.popularityScore || 0).toFixed(2)}</span>
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
                                                <td className="px-8 py-6">
                                                    <span className="text-sm font-black text-slate-900">₹{getPriceOptimization(item).suggestedPrice}</span>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{getPriceOptimization(item).suggestion}</p>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
