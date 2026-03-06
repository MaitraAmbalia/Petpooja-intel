"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { REVENUE_HISTORY, PROCESSED_MENU, TEAM_MEMBERS } from "@/lib/data-store";
import { motion } from "framer-motion";
import {
    DollarSign,
    Users,
    ShoppingBag,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    Star,
    TrendingUp,
    Activity,
    Package,
    Sparkles
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MetricCard = ({ title, value, subValue, trend, icon: Icon, isActive, onClick }) => (
    <Card
        onClick={onClick}
        className={cn(
            "border-none shadow-sm p-5 rounded-2xl flex-1 cursor-pointer transition-all duration-300",
            isActive ? "bg-orange-500 text-white ring-4 ring-orange-50" : "bg-white hover:bg-slate-50 border border-transparent hover:border-slate-100"
        )}
    >
        <div className="flex justify-between items-center mb-1">
            <h4 className={cn("text-2xl font-bold tracking-tight", isActive ? "text-white" : "text-slate-900")}>
                {typeof value === 'number' ? value.toFixed(2) : value}
            </h4>
            <div className={cn("p-2 rounded-xl", isActive ? "bg-white/20" : "bg-slate-50")}>
                <Icon className={isActive ? "text-white" : "text-slate-400"} size={18} />
            </div>
        </div>
        <p className={cn("text-xs font-semibold uppercase tracking-wider", isActive ? "text-white/80" : "text-slate-400")}>{title}</p>
        <div className="flex items-center gap-1.5 mt-4">
            {trend > 0 ? (
                <div className={cn("flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-lg", isActive ? "text-white bg-white/20" : "text-emerald-600 bg-emerald-50")}>
                    <ArrowUpRight size={12} /> {trend.toFixed(2)}%
                </div>
            ) : (
                <div className={cn("flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-lg", isActive ? "text-white bg-white/20" : "text-red-600 bg-red-50")}>
                    <ArrowDownRight size={12} /> {Math.abs(trend).toFixed(2)}%
                </div>
            )}
            <span className={cn("text-[11px] font-medium truncate", isActive ? "text-white/60" : "text-slate-400")}>{subValue}</span>
        </div>
    </Card>
);

export default function DashboardPage() {
    const sortedByPopularity = [...PROCESSED_MENU].sort((a, b) => b.popularityScore - a.popularityScore);
    const bestSeller = sortedByPopularity[0];
    const worstSeller = sortedByPopularity[sortedByPopularity.length - 1];

    const todayProfit = 1245.80;
    const todayOrders = 142;

    const [activeMetric, setActiveMetric] = useState('all');

    const toggleMetric = (metric) => {
        if (activeMetric === metric) setActiveMetric('all');
        else setActiveMetric(metric);
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex flex-col xl:flex-row gap-8">
                    {/* Main Content Area */}
                    <div className="flex-1 space-y-8">
                        {/* Header Section */}
                        <div className="flex justify-between items-center bg-white p-5 rounded-3xl shadow-sm border border-slate-50">
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
                                <p className="text-xs text-slate-400 font-medium mt-1">Intelligence Overview • Real-time</p>
                            </div>
                            <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1">
                                <button
                                    onClick={() => setActiveMetric('all')}
                                    className={cn(
                                        "px-4 py-2 text-xs font-bold tracking-wide rounded-xl transition-all",
                                        activeMetric === 'all'
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    Overview
                                </button>
                                <button
                                    className="px-4 py-2 text-xs font-bold text-slate-300 cursor-not-allowed"
                                    disabled
                                >
                                    Reports
                                </button>
                            </div>
                        </div>

                        {/* KPIS Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <MetricCard
                                title="Revenue"
                                value="₹89,935.00"
                                trend={1.01}
                                subValue="this week"
                                icon={DollarSign}
                                isActive={activeMetric === 'revenue'}
                                onClick={() => toggleMetric('revenue')}
                            />
                            <MetricCard
                                title="Net Profit"
                                value="₹24,360.00"
                                trend={2.40}
                                subValue="this week"
                                icon={TrendingUp}
                                isActive={activeMetric === 'profit'}
                                onClick={() => toggleMetric('profit')}
                            />
                            <MetricCard
                                title="Operating Cost"
                                value="₹65,575.00"
                                trend={-0.92}
                                subValue="this week"
                                icon={Activity}
                                isActive={activeMetric === 'costs'}
                                onClick={() => toggleMetric('costs')}
                            />
                        </div>

                        {/* Interactive Main Chart */}
                        <Card className="border-none shadow-sm rounded-3xl p-8 bg-white overflow-hidden">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">Performance Visualization</h3>
                                    <p className="text-xs text-slate-400 font-medium mt-1">Daily interaction tracking</p>
                                </div>
                                <div className="flex flex-wrap gap-6">
                                    {(activeMetric === 'all' || activeMetric === 'revenue') && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Revenue</span>
                                        </div>
                                    )}
                                    {(activeMetric === 'all' || activeMetric === 'profit') && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Profit</span>
                                        </div>
                                    )}
                                    {(activeMetric === 'all' || activeMetric === 'costs') && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-slate-400" />
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Op. Cost</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={REVENUE_HISTORY}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.08} />
                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.06} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.06} />
                                                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fontWeight: 500, fill: '#64748b' }}
                                            dy={15}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 500, fill: '#64748b' }}
                                            tickFormatter={(value) => `₹${value}`}
                                            dx={-10}
                                        />
                                        <Tooltip
                                            formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]}
                                            contentStyle={{
                                                borderRadius: '16px',
                                                border: '1px solid #f1f5f9',
                                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                padding: '12px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.98)'
                                            }}
                                            labelStyle={{ fontWeight: 700, color: '#0f172a', marginBottom: '8px', fontSize: '12px' }}
                                        />
                                        {(activeMetric === 'all' || activeMetric === 'revenue') && (
                                            <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={1000} />
                                        )}
                                        {(activeMetric === 'all' || activeMetric === 'profit') && (
                                            <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" animationDuration={1000} />
                                        )}
                                        {(activeMetric === 'all' || activeMetric === 'costs') && (
                                            <Area type="monotone" dataKey="costs" stroke="#94a3b8" strokeWidth={3} fillOpacity={1} fill="url(#colorCosts)" animationDuration={1000} />
                                        )}
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Order Volume */}
                        <Card className="border-none shadow-sm rounded-3xl p-8 bg-white overflow-hidden">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">Order Volume</h3>
                                    <p className="text-xs text-slate-400 font-medium mt-1">Transaction frequency analysis</p>
                                </div>
                                <Badge className="bg-orange-50 text-orange-600 border-none px-3 py-1 font-bold text-xs uppercase tracking-wide">Live</Badge>
                            </div>
                            <div className="h-[140px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={REVENUE_HISTORY}>
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 500, fill: '#64748b' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 500, fill: '#64748b' }}
                                            dx={-10}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="orders" fill="#f97316" radius={[4, 4, 0, 0]} barSize={24} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    {/* Rights Column - Insights */}
                    <div className="w-full xl:w-96 space-y-6">
                        {/* Pulses Hub */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-3xl p-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white relative overflow-hidden h-36 flex flex-col justify-between transition-colors">
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1">Today's Profit</p>
                                    <h4 className="text-2xl font-bold tracking-tight">₹{todayProfit.toFixed(2)}</h4>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="p-2 bg-slate-50 dark:bg-white/10 rounded-xl transition-colors">
                                        <TrendingUp size={16} className="text-emerald-500 dark:text-emerald-400 text-emerald-400" />
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                </div>
                            </Card>
                            <Card className="border-none shadow-sm rounded-3xl p-6 bg-white border border-slate-50 h-36 flex flex-col justify-between">
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Today's Orders</p>
                                    <h4 className="text-2xl font-bold tracking-tight text-slate-900">{todayOrders}</h4>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="p-2 bg-orange-50 rounded-xl">
                                        <Package size={16} className="text-orange-500" />
                                    </div>
                                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-orange-500 border-orange-100">Live</Badge>
                                </div>
                            </Card>
                        </div>

                        {/* Intelligence Card */}
                        <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-3xl p-7 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white transition-colors">
                            <div className="flex items-center gap-2 mb-8">
                                <Sparkles size={16} className="text-orange-500 dark:text-orange-400" />
                                <h3 className="font-bold text-xs uppercase tracking-widest">Menu Intelligence</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest">Best Performer</p>
                                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 shadow-sm dark:shadow-none flex items-center justify-center text-xl transition-colors">🔥</div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold truncate leading-tight tracking-tight">{bestSeller.foodName}</p>
                                                <p className="text-xs text-slate-500 font-medium mt-1">Pop: {bestSeller.popularityScore.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-400 dark:text-slate-700" />
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-white/5 w-full transition-colors" />

                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Least Performer</p>
                                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between opacity-80 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 shadow-sm dark:shadow-none flex items-center justify-center text-xl transition-colors">🧊</div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold truncate leading-tight tracking-tight">{worstSeller.foodName}</p>
                                                <p className="text-xs text-slate-500 font-medium mt-1">Pop: {worstSeller.popularityScore.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-400 dark:text-slate-700" />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Team Tracker */}
                        <Card className="border-none shadow-sm rounded-3xl p-7 bg-white">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="font-bold text-slate-900 tracking-tight text-base">Team Snapshot</h3>
                                <Badge className="bg-slate-50 text-slate-400 border-none text-[10px] font-bold uppercase tracking-widest">Active</Badge>
                            </div>
                            <div className="space-y-5">
                                {TEAM_MEMBERS.slice(0, 5).map((member) => (
                                    <div key={member.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <Avatar className="w-10 h-10 ring-2 ring-slate-50">
                                                    <AvatarImage src={member.image} />
                                                    <AvatarFallback className="text-xs font-bold"> {member.name[0]} </AvatarFallback>
                                                </Avatar>
                                                <div className={cn(
                                                    "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                                                    member.status === "Present" ? "bg-emerald-500" : "bg-red-400"
                                                )} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 truncate tracking-tight mb-1">{member.name}</p>
                                                <p className="text-xs text-slate-400 font-medium uppercase tracking-tight">{member.role}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-slate-200 group-hover:text-slate-900 transition-colors">
                                            <ChevronRight size={18} />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    className="w-full h-11 rounded-2xl border-slate-100 text-xs font-bold text-slate-500 hover:text-orange-500 transition-all uppercase tracking-widest mt-2"
                                >
                                    Roster Detail
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
