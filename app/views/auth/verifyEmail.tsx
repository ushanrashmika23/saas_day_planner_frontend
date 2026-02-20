'use client'
import React from 'react'
import { CheckCircle, XCircle, ArrowRight, RefreshCcw, Sparkles, AlertCircle, Loader2 } from 'lucide-react'

interface StatusProps {
    verificationStatus: boolean;
    email: string;
    handleResend: () => void;
    handleVerification: () => void;
    isVerifying?: boolean;
}

export default function VerificationResult({ verificationStatus, email, handleResend, isVerifying = false}: StatusProps): React.JSX.Element {

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
            {/* Dynamic Icon Section */}
            <div className="relative mb-6">
                {isVerifying ? (
                    <div className="bg-indigo-100 p-4 rounded-full animate-pulse">
                        <Loader2 className="text-indigo-600 w-16 h-16 animate-spin" />
                    </div>
                ) : verificationStatus ? (
                    <div className="bg-emerald-100 p-4 rounded-full animate-in zoom-in duration-500">
                        <CheckCircle className="text-emerald-500 w-16 h-16" />
                        <Sparkles className="absolute -top-2 -right-2 text-yellow-400 w-8 h-8 opacity-75 animate-pulse" />
                    </div>
                ) : (
                    <div className="bg-rose-100 p-4 rounded-full animate-in shake duration-500">
                        <XCircle className="text-rose-500 w-16 h-16" />
                    </div>
                )}
            </div>

            {/* Status Card */}
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 w-full max-w-md border border-slate-100 text-center">
                {isVerifying ? (
                    <>
                        <h1 className="text-3xl font-bold tracking-tight mb-3">
                            Verifying...
                        </h1>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            Please wait while we verify your email address.
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold tracking-tight mb-3">
                            {verificationStatus ? "Verified!" : "Verification Failed"}
                        </h1>

                {verificationStatus ? (
                    /* Success Content */
                    <>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            Great news! <span className='font-semibold'>{email}</span> has been verified. <br />
                            Your account is now fully active and ready to go.
                        </p>
                        <button onClick={() => window.location.href = "/"} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 group active:scale-95">
                            Go to Login
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </>
                ) : (
                    /* Failure Content */
                    <>
                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-6 flex items-start gap-3 text-left">
                            <AlertCircle className="text-rose-500 w-5 h-5 mt-0.5 shrink-0" />
                            <p className="text-sm text-rose-700">
                                The verification link is invalid or has expired. These links are only valid for 24 hours.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <button onClick={handleResend} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-95">
                                <RefreshCcw className="w-5 h-5" />
                                Resend Verification Link
                            </button>
                            <button onClick={() => window.location.href = "/"} className="w-full border border-slate-200 text-slate-700 font-semibold py-4 rounded-xl hover:bg-slate-50 transition-all">
                                Back to Sign In
                            </button>
                        </div>
                    </>
                )}                    </>
                )}            </div>

            {verificationStatus && (
                <p className="mt-8 text-sm text-slate-400">
                    Need help? <span className="text-indigo-600 font-medium cursor-pointer hover:underline">Contact Support</span>
                </p>
            )}
        </div>
    )
}