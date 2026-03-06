"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Plus, Edit, Trash2, Check, ArrowRight } from "lucide-react";

// Mock data combining standard items and AI suggestions
const initialMenu = [
  { id: "sku_101", name: "Classic Burger", price: "₹12.00", category: "Mains", type: "standard" },
  { id: "sku_102", name: "Truffle Fries", price: "₹6.00", category: "Sides", type: "standard" },
];

const aiSuggestions = [
  { 
    id: "ai_combo_1", 
    name: "Spicy Burger Bundle", 
    price: "₹16.50", 
    components: ["Classic Burger", "Truffle Fries", "Coke"],
    reason: "Increases AOV by 18% during lunch hours." 
  },
];

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState(initialMenu);
  const [suggestions, setSuggestions] = useState(aiSuggestions);

  const approveAiCombo = (combo) => {
    setMenuItems([...menuItems, { id: combo.id, name: combo.name, price: combo.price, category: "Combo", type: "ai_approved" }]);
    setSuggestions(suggestions.filter(s => s.id !== combo.id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <button className="bg-[#f97316] hover:bg-[#ea580c] text-white px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors">
          <Plus size={16} /> Add New Item
        </button>
      </div>

      {/* AI Hub Section - 1-Click Approvals */}
      {suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-white p-6 rounded-xl border border-orange-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-[#ea580c]">
            <Sparkles size={20} />
            <h2 className="text-lg font-bold">AI Revenue Suggestions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((suggestion) => (
              <motion.div 
                key={suggestion.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-4 rounded-lg border border-orange-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900">{suggestion.name}</h3>
                    <span className="font-bold text-[#f97316]">{suggestion.price}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Includes: {suggestion.components.join(", ")}</p>
                  <p className="text-sm text-gray-700 bg-orange-50 p-2 rounded flex items-center gap-2">
                     <ArrowRight size={14} className="text-[#f97316]"/> {suggestion.reason}
                  </p>
                </div>
                <button 
                  onClick={() => approveAiCombo(suggestion)}
                  className="mt-4 w-full bg-black text-white px-4 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                >
                  <Check size={16} /> Approve & Push to POS
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Standard Menu Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Item Name</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Price</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {menuItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                  {item.name}
                  {item.type === "ai_approved" && <Sparkles size={14} className="text-[#f97316]" />}
                </td>
                <td className="px-6 py-4">{item.category}</td>
                <td className="px-6 py-4 font-medium">{item.price}</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">Active</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-900 mr-3"><Edit size={16} /></button>
                  <button className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}