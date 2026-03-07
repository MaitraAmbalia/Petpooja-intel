"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    TrendingUp,
    TrendingDown,
    Minus,
    DollarSign,
    ShoppingCart,
    Percent,
    ArrowUpRight,
    Search,
    Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MetricCard = ({ title, value, icon: Icon, trend, trendValue, colorClass }) => (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-4 rounded-2xl ${colorClass}`}>
                <Icon size={24} />
            </div>
            {trend && (
                <div className={cn(
                    "flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full",
                    trend === "up" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30" :
                        trend === "down" ? "text-rose-600 bg-rose-50 dark:bg-rose-900/30" :
                            "text-slate-600 bg-slate-100 dark:bg-slate-800"
                )}>
                    {trend === "up" ? <TrendingUp size={14} /> : trend === "down" ? <TrendingDown size={14} /> : <Minus size={14} />}
                    {trendValue}
                </div>
            )}
        </div>
        <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-1">{title}</h3>
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</div>
        </div>
    </div>
);

export default function UnitAnalysisPage() {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch("/api/analytics/menu");
                if (!res.ok) throw new Error("Failed to fetch");
                const json = await res.json();
                if (json.success) {
                    setAnalytics(json.data);
                }
            } catch (err) {
                console.error("Error fetching analytics:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    // Derived Summary Metrics
    const totalItems = analytics.length;
    const avgMargin = analytics.reduce((acc, curr) => acc + curr.marginPct, 0) / (totalItems || 1);
    const totalMonthlyProfit = analytics.reduce((acc, curr) => acc + curr.currentMonthlyProfit, 0);
    const potentialMonthlyProfit = analytics.reduce((acc, curr) => acc + (curr.projectedProfitAtOptimal || curr.currentMonthlyProfit), 0);
    const profitUpliftTotal = totalMonthlyProfit > 0 ? ((potentialMonthlyProfit - totalMonthlyProfit) / totalMonthlyProfit) * 100 : 0;

    const categories = ["All", ...new Set(analytics.map(item => item.category))];

    const filteredAnalytics = analytics.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "All" || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <DashboardLayout>
            <div className="p-8 max-w-[1600px] mx-auto space-y-8 pb-32">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
                                <Activity className="text-white w-6 h-6" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Unit Analysis</h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl">
                            Real-time item profitability, velocity scoring, and AI price optimization.
                        </p>
                    </div>
                    {/* Add recompute button here later if needed */}
                </div>

                {loading ? (
                    <div className="h-[400px] flex items-center justify-center">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                            <Activity className="w-8 h-8 text-indigo-500 opacity-50" />
                        </motion.div>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard
                                title="Average Margin"
                                value={`${avgMargin.toFixed(1)}%`}
                                icon={Percent}
                                colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                            />
                            <MetricCard
                                title="Total Monthly Profit"
                                value={`₹${totalMonthlyProfit.toLocaleString()}`}
                                icon={DollarSign}
                                colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                            />
                            <MetricCard
                                title="Optimal Profit Potential"
                                value={`₹${potentialMonthlyProfit.toLocaleString()}`}
                                icon={ArrowUpRight}
                                trend="up"
                                trendValue={`+${profitUpliftTotal.toFixed(1)}%`}
                                colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                            />
                            <MetricCard
                                title="Active Items Analyzed"
                                value={totalItems}
                                icon={ShoppingCart}
                                colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                            />
                        </div>

                        {/* Search and Filters */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <div className="relative w-full sm:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                                />
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
                                <Filter className="text-slate-400 h-5 w-5 mr-2 shrink-0" />
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setFilterCategory(cat)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all",
                                            filterCategory === cat
                                                ? "bg-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                                                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                                            <th className="p-4 pl-6 font-bold text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">Product</th>
                                            <th className="p-4 font-bold text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">Pricing & Margin</th>
                                            <th className="p-4 font-bold text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">Sales Velocity (30d)</th>
                                            <th className="p-4 font-bold text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">Classification</th>
                                            <th className="p-4 pr-6 font-bold text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">Price Optimization</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                        <AnimatePresence>
                                            {filteredAnalytics.map((item) => (
                                                <motion.tr
                                                    key={item.foodId}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                                                >
                                                    {/* Product details */}
                                                    <td className="p-4 pl-6">
                                                        <div className="font-bold text-slate-900 dark:text-white mb-1">{item.name}</div>
                                                        <div className="text-xs text-slate-500 font-medium">{item.category}</div>
                                                    </td>

                                                    {/* Pricing & Margin */}
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold tracking-tight">₹{item.currentPrice}</span>
                                                                <span className="text-xs text-slate-400">(Cost: ₹{item.cost})</span>
                                                            </div>
                                                            <Badge variant="outline" className={cn(
                                                                "w-fit font-bold border-none",
                                                                item.profitabilityTier === "A" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30" :
                                                                    item.profitabilityTier === "B" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30" :
                                                                        item.profitabilityTier === "C" ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30" :
                                                                            "bg-rose-50 text-rose-600 dark:bg-rose-900/30"
                                                            )}>
                                                                {item.marginPct.toFixed(1)}% Margin (Tier {item.profitabilityTier})
                                                            </Badge>
                                                        </div>
                                                    </td>

                                                    {/* Sales Velocity */}
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="font-bold text-slate-900 dark:text-white">
                                                                {item.salesVelocity} <span className="text-slate-400 font-medium text-sm">units/day</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs font-bold">
                                                                <span className={cn(
                                                                    item.velocityTrend === "rising" ? "text-emerald-500" :
                                                                        item.velocityTrend === "declining" ? "text-rose-500" :
                                                                            "text-slate-500"
                                                                )}>
                                                                    {item.velocityTrend === "rising" ? "📈 Rising" :
                                                                        item.velocityTrend === "declining" ? "📉 Declining" :
                                                                            "➖ Stable"}
                                                                </span>
                                                                <span className="text-slate-400">({item.totalQtySold30d} total)</span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Classification */}
                                                    <td className="p-4">
                                                        <Badge className={cn(
                                                            "font-bold px-3 py-1 text-sm border-none shadow-sm",
                                                            item.classification === "Hero Item" ? "bg-amber-500 text-white" :
                                                                item.classification === "Volume Driver" ? "bg-blue-500 text-white" :
                                                                    item.classification === "Hidden Gem" ? "bg-indigo-500 text-white" :
                                                                        "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                                        )}>
                                                            {item.classification === "Hero Item" && "🌟 "}
                                                            {item.classification === "Volume Driver" && "📈 "}
                                                            {item.classification === "Hidden Gem" && "💎 "}
                                                            {item.classification === "Underperformer" && "⚠️ "}
                                                            {item.classification}
                                                        </Badge>
                                                    </td>

                                                    {/* Price Optimization */}
                                                    <td className="p-4 pr-6">
                                                        {item.optimalPrice ? (
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-bold text-slate-500">Rec:</span>
                                                                    <span className="font-black text-indigo-600 dark:text-indigo-400">₹{item.optimalPrice}</span>
                                                                    {item.profitUplift && (
                                                                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-none font-black px-1.5 text-[10px]">
                                                                            {item.profitUplift}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                    Elasticity: {item.priceElasticity}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm font-medium text-slate-400 italic">Need more price data</span>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                            {filteredAnalytics.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">
                                                        No products found matching your criteria.
                                                    </td>
                                                </tr>
                                            )}
                                        </AnimatePresence>
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
