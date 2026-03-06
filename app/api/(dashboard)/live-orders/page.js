"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PhoneCall, AlertCircle, CheckCircle, FileText, FileJson, Clock } from "lucide-react";

// Mock data representing incoming webhooks from the Voice AI backend
const mockCalls = [
  {
    id: "CALL_089",
    time: "2 mins ago",
    phone: "+91 98765 43210",
    status: "human_transfer",
    confidence: 0.45,
    transcript: "Uh yes, I want the combo but with no onions and make the green chutney extra spicy... wait, actually change it to a large size.",
    jsonPayload: { intent: "order_combo", items: [{ id: "combo_1", size: "large", modifiers: ["no_onion", "extra_spicy_chutney"] }], status: "unresolved" },
    actionRequired: "Resolve modifier ambiguity"
  },
  {
    id: "CALL_088",
    time: "5 mins ago",
    phone: "+91 87654 32109",
    status: "ai_completed",
    confidence: 0.92,
    transcript: "I'd like two paneer tikka wraps and one sweet lassi.",
    jsonPayload: { intent: "order_items", items: [{ id: "sku_pnr_wrap", qty: 2 }, { id: "sku_ls_swt", qty: 1 }], status: "pushed_to_pos" },
    actionRequired: null
  }
];

export default function LiveOrdersPage() {
  const [selectedCall, setSelectedCall] = useState(mockCalls[0]);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 max-w-7xl mx-auto">
      {/* Left Column: Call Queue */}
      <div className="w-1/3 bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><PhoneCall size={18} /> Call Queue</h2>
          <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-semibold">1 Pending</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {mockCalls.map((call) => (
            <motion.div
              key={call.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedCall(call)}
              className={`p-4 rounded-lg cursor-pointer border transition-colors ${
                selectedCall.id === call.id ? "border-[#f97316] bg-[#fff7ed]" : "border-gray-100 hover:border-gray-300"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-gray-900 text-sm">{call.phone}</span>
                <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} /> {call.time}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium">
                {call.status === "human_transfer" ? (
                  <span className="text-red-600 flex items-center gap-1"><AlertCircle size={14} /> Human Transfer</span>
                ) : (
                  <span className="text-green-600 flex items-center gap-1"><CheckCircle size={14} /> AI Handled</span>
                )}
                <span className="text-gray-400">|</span>
                <span className="text-gray-500">Conf: {call.confidence * 100}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right Column: Call Diagnostics */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Call Details: {selectedCall.id}</h2>
            <p className="text-sm text-gray-500">Caller: {selectedCall.phone}</p>
          </div>
          {selectedCall.status === "human_transfer" && (
            <button className="bg-[#f97316] hover:bg-[#ea580c] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Push to POS
            </button>
          )}
        </div>
        
        <div className="flex-1 p-6 grid grid-cols-2 gap-6 overflow-y-auto bg-gray-50">
          {/* Transcript Panel */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><FileText size={16} /> Live Transcript</h3>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded border border-gray-100">
              "{selectedCall.transcript}"
            </p>
            {selectedCall.actionRequired && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100 flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p><strong>Action Required:</strong> {selectedCall.actionRequired}</p>
              </div>
            )}
          </div>

          {/* JSON Payload Panel */}
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 shadow-sm overflow-hidden flex flex-col">
             <h3 className="font-semibold text-gray-100 mb-3 flex items-center gap-2"><FileJson size={16} /> Structured JSON</h3>
             <pre className="text-xs text-green-400 overflow-x-auto flex-1 font-mono">
               {JSON.stringify(selectedCall.jsonPayload, null, 2)}
             </pre>
          </div>
        </div>
      </div>
    </div>
  );
}