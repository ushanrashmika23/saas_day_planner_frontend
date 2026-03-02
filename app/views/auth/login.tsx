'use client'
import React, { useState } from 'react'
import { Mail, Lock, Eye, CheckCircle2, EyeOff } from 'lucide-react'
import { LoginPayload } from '@/app/api/auth';

interface LoginProps {
    handleAuthStateChange: (state: "login" | "register" | "verify" | "checkInbox" | "workspace") => void;
    handleLogin(): void;
    handleChange(e: React.ChangeEvent<HTMLInputElement>): void;
    formData: LoginPayload;
}

export default function Login({ handleAuthStateChange, handleChange, formData, handleLogin }: LoginProps): React.JSX.Element {


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleLogin();
        //TODO: Implement actual login logic here, and on success:
        // handleAuthStateChange("workspace");
    }

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }

    const handleGoToRegister = () => {
        handleAuthStateChange("register");
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
            {/* Logo and Header */}
            <div className="flex flex-col items-center mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-400 p-2 rounded-xl mb-4 shadow-lg">
                    <CheckCircle2 className="text-white w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
                <p className="text-slate-500 mt-1">Sign in to continue to DayFlow</p>
            </div>

            {/* Card */}
            <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200 w-full max-w-md border border-slate-100">
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-11 pr-11 py-3 bg-slate-100 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500"
                            />
                            {
                                !showPassword ? (
                                    <Eye className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 cursor-pointer" onClick={togglePasswordVisibility} />
                                ) : (
                                    <EyeOff className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 cursor-pointer" onClick={togglePasswordVisibility} />
                                )
                            }
                        </div>
                    </div>

                    <div className="text-right">
                        <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                            Forgot password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
                        onClick={handleLogin}
                    >
                        Sign In
                    </button>
                </form>

                {/* Footer Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
                    <div className="relative flex justify-center text-xs uppercase" >
                        <span className="bg-white px-3 text-slate-400">Don&apos;t have an account?</span>
                    </div>
                </div>

                <button
                    className="w-full border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-all"
                    onClick={handleGoToRegister}>
                    Create Account
                </button>
            </div>

            <p className="text-xs text-slate-400 mt-8 text-center max-w-xs">
                By continuing, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>
            </p>
        </div>
    )
}