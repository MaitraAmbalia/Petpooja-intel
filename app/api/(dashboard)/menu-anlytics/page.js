"use client";

import { motion } from "framer-motion";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, AlertCircle, Target } from "lucide-react";

// Mock Data for the Margin vs Popularity Matrix
const matrixData = [
  { name: "Truffle Fries", margin: 80, volume: 40, fill: "#f97316", category: "Puzzle (High Margin, Low Sales)" },
  { name: "Classic Burger", margin: 40, volume: 200, fill: "#3b82f6", category: "Plowhorse (Low Margin, High Sales)" },
  { name: "Spicy Wrap", margin: 70, volume: 180, fill: "#22c55e", category: "Star (High Margin, High Sales)" },
  { name: "Plain Salad", margin: 30, volume: 50, fill: "#ef4444", category: "Dog (Low Margin, Low Sales)" },
];

const topPerformers = [
  { name: "Spicy Wrap", sales: 180 },
  { name: "Classic Burger", sales: 200 },
  { name: "Coke", sales: 150 },
];

export default function MenuAnalyticsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Menu Analytics</h1>
        <button className="bg-[#fff7ed] text-[#f97316] px-4 py-2 rounded-md text-sm font-semibold border border-[#ffedd5] flex items-center gap-2">
          <Target size={16} /> Export AI Targets
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Margin vs Popularity Matrix (Menu Engineering) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[450px]">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">Profitability Matrix</h2>
            <p className="text-sm text-gray-500">Contribution Margin vs. Sales Volume</p>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis type="number" dataKey="volume" name="Sales Volume" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis type="number" dataKey="margin" name="Margin (%)" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-gray-900 text-white p-3 rounded-lg text-sm shadow-lg">
                          <p className="font-bold mb-1">{data.name}</p>
                          <p className="text-gray-300">Margin: {data.margin}%</p>
                          <p className="text-gray-300">Volume: {data.volume} units</p>
                          <p className="text-[#f97316] mt-1 text-xs font-semibold">{data.category}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine x={100} stroke="#9ca3af" strokeDasharray="3 3" />
                <ReferenceLine y={50} stroke="#9ca3af" strokeDasharray="3 3" />
                <Scatter name="Menu Items" data={matrixData} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actionable Insights Panel */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4">AI Action Signals</h2>
          <div className="space-y-4 flex-1">
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div className="flex items-center gap-2 text-orange-700 font-semibold mb-1">
                <TrendingUp size={16} /> Upsell Opportunity
              </div>
              <p className="text-sm text-gray-700"><strong>Truffle Fries</strong> have an 80% margin but low sales. Add to Voice AI combos.</p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-2 text-red-700 font-semibold mb-1">
                <TrendingDown size={16} /> Margin Risk
              </div>
              <p className="text-sm text-gray-700"><strong>Plain Salad</strong> is underperforming. Consider removing to reduce inventory waste.</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 text-blue-700 font-semibold mb-1">
                <AlertCircle size={16} /> Price Optimization
              </div>
              <p className="text-sm text-gray-700"><strong>Classic Burger</strong> has high volume but low margin. Increase price by 5%.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}