'use client'
import React from 'react'
import { MailCheck, ArrowRight, RefreshCcw } from 'lucide-react'

interface CheckInboxProps {
    email: string;
    handleResend: () => void;
    handleAuthStateChange: (state: "login" | "register" | "verify" | "checkInbox" | "workspace") => void;
}

export default function CheckInbox({ email, handleResend, handleAuthStateChange }: CheckInboxProps): React.JSX.Element {
    const userEmail = email;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
            {/* Logo */}
            <div className="flex flex-col items-center mb-6">
                <div className="bg-gradient-to-br from-indigo-600 to-cyan-500 p-2 rounded-xl mb-4 shadow-lg">
                    <MailCheck className="text-white w-10 h-10" />
                </div>
            </div>

            {/* Verification Card */}
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 w-full max-w-md border border-slate-100 text-center">
                <h1 className="text-3xl font-bold tracking-tight mb-3">Check your inbox</h1>
                <p className="text-slate-500 mb-6 leading-relaxed">
                    We&apos;ve sent a verification link to <br />
                    <span className="font-semibold text-slate-900">{userEmail}</span>
                </p>

                <div className="space-y-4">
                    <button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 group"
                    // className="w-full cursor-pointer text-indigo-600 border-1 border-indigo-500 font-semibold py-3 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 group"
                    >
                        Go to Email App
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 ease-in-out transition-transform" />
                    </button>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-100"></span>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-white px-3 text-slate-400">Didn&apos;t receive it?</span>
                        </div>
                    </div>

                    <button
                        className="w-full flex cursor-pointer items-center justify-center gap-2 border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-all group"
                        onClick={handleResend}
                    >
                        <RefreshCcw className="w-4 h-4 transition-transform duration-500 ease-in-out group-hover:-rotate-180" />
                        Resend Link
                    </button>
                </div>
            </div>

            {/* Back to Login link */}
            <button onClick={() => handleAuthStateChange("login")} className="mt-8 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                Back to Sign In
            </button>
        </div>
    )
}