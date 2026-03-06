"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { PROCESSED_MENU, STRATEGIC_COMBOS } from "@/lib/data-store";
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
import { TrendingUp, AlertCircle, Info, ChevronRight, Zap, ShoppingBag, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";


const MatrixLabel = ({ x, y, label, color }) => (
    <div className={`absolute ${x} ${y} flex items-center gap-2 px-3 py-1.5 rounded-xl border ${color} bg-white dark:bg-slate-800 shadow-sm z-10`}>
        <span className="text-[10px] dark:text-white font-bold uppercase tracking-widest">{label}</span>
    </div>
);

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
                                {item.foodName}
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
    const avgMargin = PROCESSED_MENU.reduce((acc, i) => acc + i.margin, 0) / PROCESSED_MENU.length;
    const avgPop = 50;

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Menu Analytics</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">SKU performance and profitability matrix</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Matrix Chart */}
                    <div className="lg:col-span-2 glass p-8 rounded-[32px] border border-slate-200/50 dark:border-slate-800 shadow-premium relative">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 italic">Popularity vs. Profitability Matrix</h3>

                        <div className="absolute inset-0 pointer-events-none p-12">
                            {/* Labels Removed as requested */}
                        </div>

                        <div className="h-[450px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        type="number"
                                        dataKey="popularityScore"
                                        name="Popularity"
                                        domain={[0, 8000]}
                                        label={{ value: 'Popularity Score →', position: 'bottom', offset: 0, fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                    />
                                    <YAxis
                                        type="number"
                                        dataKey="margin"
                                        name="Profit Margin"
                                        unit="₹"
                                        domain={[0, 12]}
                                        label={{ value: 'Margin (₹) →', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                    />
                                    <Tooltip
                                        cursor={{ strokeDasharray: '3 3' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-800">
                                                        <p className="font-bold text-slate-900 dark:text-white">{data.foodName}</p>
                                                        <p className="text-xs font-semibold text-orange-500 uppercase">{data.classification}</p>
                                                        <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                                            <p>Margin: ₹{data.margin.toFixed(2)}</p>
                                                            <p>Popularity: {data.popularityScore.toFixed(2)}</p>
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


                        <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-premium">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 italic">SKU Health Summary</h3>
                            <div className="space-y-2">
                                {[
                                    { label: 'High Velocity (Stars)', count: PROCESSED_MENU.filter(i => i.classification === 'Star').length, color: 'emerald', hex: '#10b981' },
                                    { label: 'Under-promoted (Challenges)', count: PROCESSED_MENU.filter(i => i.classification === 'Challenge').length, color: 'orange', hex: '#f97316' },
                                    { label: 'Volume Staple (Workhorses)', count: PROCESSED_MENU.filter(i => i.classification === 'Workhorse').length, color: 'blue', hex: '#0ea5e9' },
                                    { label: 'Underperforming (Dogs)', count: PROCESSED_MENU.filter(i => i.classification === 'Dog').length, color: 'slate', hex: '#94a3b8' },
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
                                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/5">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                        <h4 className="font-bold text-[11px] tracking-widest uppercase">Stars (High Demand)</h4>
                                    </div>
                                    <p className="text-[10px] font-medium text-white/90 leading-relaxed">Inelastic demand detected. Consider testing a <span className="font-black text-white px-1 py-0.5 bg-white/20 rounded">+5% to +8%</span> price increase to maximize margins.</p>
                                </div>
                                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/5">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                                        <h4 className="font-bold text-[11px] tracking-widest uppercase">Workhorses (Staples)</h4>
                                    </div>
                                    <p className="text-[10px] font-medium text-white/90 leading-relaxed">Highly sensitive to price changes. Maintain current pricing but strictly optimize supply chain food costs.</p>
                                </div>
                                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/5">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="w-2 h-2 rounded-full bg-orange-400" />
                                        <h4 className="font-bold text-[11px] tracking-widest uppercase">Challenges (High Profit)</h4>
                                    </div>
                                    <p className="text-[10px] font-medium text-white/90 leading-relaxed">Bundle with Workhorses or offer limited-time promotions to boost trial rates and overall ticket size.</p>
                                </div>
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
                        <ComboPanel
                            title="Supreme Trio Engine"
                            icon={Star}
                            combos={STRATEGIC_COMBOS.trio}
                            colorClass="bg-indigo-50 text-indigo-600"
                        />
                        <ComboPanel
                            title="Quick Bite Engine"
                            icon={ShoppingBag}
                            combos={STRATEGIC_COMBOS.snackBev}
                            colorClass="bg-emerald-50 text-emerald-600"
                        />
                        <ComboPanel
                            title="Sweet Pairing Engine"
                            icon={Zap}
                            combos={STRATEGIC_COMBOS.snackDessert}
                            colorClass="bg-orange-50 text-orange-600"
                        />
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="glass rounded-[32px] border border-slate-200/50 dark:border-slate-800 shadow-premium overflow-hidden">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white italic">Detailed SKU Performance</h3>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            <Info size={14} /> Auto-synced with POS
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Item Name</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Cost/Price</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Margin %</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Velocity</th>
                                    <th className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Classification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {([...PROCESSED_MENU].sort((a, b) => b.margin - a.margin)).map((item, i) => (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={item.foodId}
                                        className="group hover:bg-slate-50/50 transition-colors cursor-default"
                                    >
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-slate-900 dark:text-white">{item.foodName}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{item.category}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 font-bold">
                                                <span className="text-slate-400 dark:text-slate-500 text-xs">₹{item.foodCost}</span>
                                                <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
                                                <span className="text-slate-900 dark:text-white">₹{item.price}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 w-20 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 rounded-full"
                                                        style={{ width: `${(item.margin / item.price) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    {((item.margin / item.price) * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.popularityScore.toFixed(2)}</span>
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
