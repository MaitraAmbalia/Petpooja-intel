"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, UtensilsCrossed, MoveLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                {/* Visual element */}
                <div className="relative mb-8 flex justify-center">
                    <motion.div
                        animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="bg-orange-500 p-8 rounded-[2.5rem] shadow-2xl shadow-orange-200 relative z-10"
                    >
                        <UtensilsCrossed size={64} className="text-white" />
                    </motion.div>

                    {/* Shadow / Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-orange-200 rounded-full blur-3xl opacity-50 -z-0"></div>
                </div>

                <h1 className="text-8xl font-black text-slate-900 mb-4 tracking-tighter">404</h1>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Table Not Found</h2>
                <p className="text-slate-500 mb-10 leading-relaxed font-medium">
                    The page you're looking for seems to have been taken off the menu.
                    Let's get you back to the main course.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        asChild
                        variant="ghost"
                        className="rounded-2xl h-14 px-8 text-slate-600 font-bold hover:bg-slate-200"
                    >
                        <Link href="javascript:history.back()" className="flex items-center gap-2">
                            <MoveLeft size={18} />
                            Go Back
                        </Link>
                    </Button>

                    <Button
                        asChild
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl h-14 px-8 font-bold shadow-lg shadow-orange-100 transition-all hover:scale-105 active:scale-95"
                    >
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <Home size={18} />
                            Dashboard
                        </Link>
                    </Button>
                </div>
            </motion.div>

            {/* Subtle background detail */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600"></div>
        </div>
    );
}
