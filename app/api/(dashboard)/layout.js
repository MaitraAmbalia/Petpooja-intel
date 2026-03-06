"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, BarChart3, Utensils, PhoneCall, 
  Settings, Search, Bell, Moon, User 
} from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Menu Analytics", path: "/menu-analytics", icon: BarChart3 },
  { name: "Menu Management", path: "/menu-management", icon: Utensils },
  { name: "Live Orders", path: "/live-orders", icon: PhoneCall },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 flex items-center gap-2 text-[#f97316] font-bold text-2xl tracking-tight">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Restoboard
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.name} href={item.path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                    isActive 
                      ? "bg-[#fff7ed] text-[#f97316]" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon size={18} className={isActive ? "text-[#f97316]" : "text-gray-400"} />
                  {item.name}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-md w-96">
            <Search size={16} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full text-gray-700"
            />
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <Bell size={20} className="hover:text-gray-900 cursor-pointer" />
            <Moon size={20} className="hover:text-gray-900 cursor-pointer" />
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200 cursor-pointer">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                 <User size={16} />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-gray-900 leading-none">Albert Juan</p>
                <p className="text-xs text-gray-500">Manager</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}