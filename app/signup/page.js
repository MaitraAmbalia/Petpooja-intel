"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Sparkles,
    Loader2,
    User,
    Mail,
    Lock,
    ArrowRight,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong");
                return;
            }

            setSuccess(true);

            // Auto sign-in after signup
            setTimeout(async () => {
                const result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                });

                if (result?.ok) {
                    router.push("/dashboard");
                } else {
                    router.push("/login");
                }
            }, 1500);
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600"></div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="bg-emerald-500 p-4 rounded-full inline-flex mb-6">
                        <CheckCircle2 className="text-white w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Account Created!</h2>
                    <p className="text-slate-500 text-sm">Redirecting you to your dashboard...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[440px]"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-orange-500 p-2.5 rounded-2xl shadow-lg shadow-orange-100 mb-4">
                        <Sparkles className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 text-center">Create your workspace</h1>
                    <p className="text-slate-500 text-sm mt-1">Start managing your restaurant with AI</p>
                </div>

                <Card className="border-[#e2e8f0] shadow-sm rounded-3xl overflow-hidden p-2">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-lg font-bold">Sign up</CardTitle>
                        <CardDescription className="text-xs">
                            Create an account to get started
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full h-11 rounded-xl border-[#e2e8f0] hover:bg-[#f8fafc] flex items-center gap-2 font-semibold text-sm"
                            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator className="w-full" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-400 font-bold tracking-widest">Or email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <Input
                                type="text"
                                placeholder="Full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-11 rounded-xl border-[#e2e8f0] bg-[#fcfdfe] focus-visible:ring-orange-500"
                            />
                            <Input
                                type="email"
                                placeholder="name@restaurant.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11 rounded-xl border-[#e2e8f0] bg-[#fcfdfe] focus-visible:ring-orange-500"
                            />
                            <Input
                                type="password"
                                placeholder="Password (min. 6 characters)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="h-11 rounded-xl border-[#e2e8f0] bg-[#fcfdfe] focus-visible:ring-orange-500"
                            />

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[11px] font-bold text-red-500 px-1"
                                >
                                    {error}
                                </motion.p>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl mt-2 shadow-lg shadow-orange-100 transition-all hover:scale-[1.01] active:scale-[0.99]"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                    <span className="flex items-center gap-2">
                                        Create Account <ArrowRight size={16} />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pt-0">
                        <p className="text-center text-[10px] text-slate-400 px-4 leading-relaxed">
                            By signing up, you agree to our <span className="underline hover:text-slate-600 cursor-pointer">Terms of Service</span> and <span className="underline hover:text-slate-600 cursor-pointer">Privacy Policy</span>.
                        </p>
                    </CardFooter>
                </Card>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-500">
                        Already have an account? <Link href="/login" className="text-orange-600 font-bold hover:underline">Sign in</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
