"use client";

import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, DollarSign, Users, ShoppingBag } from "lucide-react";

// Mock data for the Recharts graph
const revenueData = [
  { name: "Jan", revenue: 40000 }, { name: "Feb", revenue: 30000 },
  { name: "Mar", revenue: 55000 }, { name: "Apr", revenue: 45000 },
  { name: "May", revenue: 60000 }, { name: "Jun", revenue: 134789 },
  { name: "Jul", revenue: 80000 }, { name: "Aug", revenue: 70000 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total Revenue" amount="₹89,935" trend="+1.01%" isUp={true} icon={DollarSign} />
        <MetricCard title="Total Customers" amount="23,283.5" trend="+0.49%" isUp={true} icon={Users} />
        <MetricCard title="Total Orders" amount="46,827" trend="-0.91%" isUp={false} icon={ShoppingBag} />
      </div>

      {/* Main Chart Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Monthly Revenue</h2>
        <div className="bg-[#fff7ed] p-6 rounded-lg mb-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 mb-1">Average Monthly Income</p>
            <p className="text-3xl font-bold text-gray-900">₹134,789</p>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-2 font-medium">
               <ArrowUpRight size={16} /> 34.6% <span className="text-gray-400 font-normal">vs previous month</span>
            </div>
          </div>
          <div className="h-32 w-2/3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable micro-component for the stat cards
function MetricCard({ title, amount, trend, isUp, icon: Icon }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{amount}</h3>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><Icon size={20} /></div>
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${isUp ? 'text-green-600' : 'text-red-500'}`}>
        {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        {trend} <span className="text-gray-400 font-normal">this week</span>
      </div>
    </div>
  );
}