"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[100]">
            <div className="relative">
                {/* Central animated icon */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="bg-orange-500 p-5 rounded-3xl shadow-xl shadow-orange-100 relative z-10"
                >
                    <Sparkles className="text-white w-8 h-8" />
                </motion.div>

                {/* Pulse Ring */}
                <motion.div
                    animate={{
                        scale: [1, 1.5],
                        opacity: [0.5, 0]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut"
                    }}
                    className="absolute inset-0 bg-orange-500 rounded-3xl -z-0"
                ></motion.div>
            </div>

            {/* Loading text with animated dots */}
            <div className="mt-8 flex flex-col items-center">
                <span className="text-slate-900 font-bold text-lg tracking-tight">
                    Preparing your workspace
                </span>
                <div className="flex gap-1.5 mt-2">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                            className="w-1.5 h-1.5 bg-orange-500 rounded-full"
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Accent */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600"></div>
        </div>
    );
}
