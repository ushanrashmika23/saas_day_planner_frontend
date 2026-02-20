'use client'
import React, { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, CheckCircle2, User, UserCircle } from 'lucide-react'
import { RegisterPayload } from '@/app/api/auth';

interface RegisterProps {
    handleAuthStateChange: (state: "login" | "register" | "verify" | "checkInbox" | "workspace") => void;
    handleRegister: () => void;
    formData: RegisterPayload;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Register({ handleAuthStateChange, handleRegister, formData, handleChange }: RegisterProps): React.JSX.Element {
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "confirmPassword") {
            setConfirmPassword(value);
            if (passwordError) {
                setPasswordError(false);
            }
        } else {
            handleChange(e);
        }
    }

    const handleNext = () => {
        if (formData.password !== confirmPassword || confirmPassword === "") {
            setPasswordError(true);
        } else {
            setPasswordError(false);
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
        setPasswordError(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Final Registration Data:", formData);
        handleRegister();
    }

    const handleGoToLogin = () => {
        handleAuthStateChange("login");
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
            {/* Logo and Header */}
            <div className="flex flex-col items-center mb-6 text-center">
                <div className="bg-gradient-to-br from-indigo-600 to-cyan-500 p-2 rounded-xl mb-4 shadow-lg">
                    <CheckCircle2 className="text-white w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
                <p className="text-slate-500 mt-1">Join DayFlow and boost your productivity</p>
            </div>

            {/* Progressive Steps Indicator */}
            <div className="flex items-center gap-4 mb-8">
                <div className="flex flex-col items-center gap-1">
                    <div className={`h-1.5 w-16 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                    <span className={`text-xs font-semibold ${step === 1 ? 'text-indigo-600' : 'text-slate-400'}`}>Account</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className={`h-1.5 w-16 rounded-full ${step === 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                    <span className={`text-xs font-semibold ${step === 2 ? 'text-indigo-600' : 'text-slate-400'}`}>Profile</span>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 w-full max-w-md border border-slate-100">
                <form onSubmit={handleSubmit} className="space-y-5">

                    {step === 1 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="email" name="email" placeholder="you@example.com"
                                        value={formData.email} onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password" placeholder="••••••••"
                                        value={formData.password} onChange={handleChange}
                                        className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                    <button
                                        type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword" placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={handleLocalChange}
                                        className={`w-full pl-11 pr-11 py-3 bg-slate-50 border rounded-xl focus:ring-2 outline-none transition-all ${passwordError ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'
                                            }`}
                                    />
                                    <button
                                        type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {passwordError && (
                                    <p className="text-red-500 text-sm mt-2">Passwords do not match</p>
                                )}
                            </div>

                            <button
                                type="button" onClick={handleNext}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                                    <input type="text" placeholder='John' name="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                                    <input type="text" name="lastName" placeholder='Doe' value={formData.lastName} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                                <div className="relative">
                                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input type="text" name="username" placeholder='john_doe' value={formData.username} onChange={handleChange} className="w-full pl-11 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={handleBack} className="flex-1 border border-slate-200 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all">Back</button>
                                <button type="submit" className="flex-[2] bg-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Complete Registration</button>
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                    <div className="relative flex justify-center text-xs" >
                        <span className="bg-white px-3 text-slate-400">Already have an account?</span>
                    </div>
                </div>

                <button
                    className="w-full border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-all"
                    onClick={handleGoToLogin}>
                    Sign In
                </button>
            </div>

            <p className="text-xs text-slate-400 mt-8 text-center max-w-xs leading-relaxed">
                By creating an account, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>
            </p>
        </div>
    )
}