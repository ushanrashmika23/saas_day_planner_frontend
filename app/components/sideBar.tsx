'use client'
import React, { useState } from 'react'
import {
    LayoutGrid, Calendar, CheckSquare, Folder,
    Tag, BarChart3, Settings, ChevronLeft, ChevronRight, Lightbulb
} from 'lucide-react'

const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', view: 'dashboard' as const },
    { icon: Calendar, label: 'Calendar', view: 'calendar' as const },
    { icon: CheckSquare, label: 'Tasks', view: 'tasks' as const },
    { icon: Folder, label: 'Projects', view: 'projects' as const },
    { icon: Tag, label: 'Tags', view: 'tags' as const },
    { icon: BarChart3, label: 'Analytics', view: null },
    { icon: Settings, label: 'Settings', view: null },
]

export default function Sidebar({ handleViewChange }: { handleViewChange?: (view: "dashboard" | "tags" |"tasks"| "projects" | "calendar") => void }): React.JSX.Element {
    const [isExpanded, setIsExpanded] = useState(true)
    const [activeView, setActiveView] = useState<string>('dashboard')

    return (
        <div className={`relative flex flex-col h-screen bg-white border-r border-slate-100 transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'}`}>

            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute -right-3 top-16 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:bg-slate-50 z-50"
            >
                {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>

            {/* Logo Section */}
            <div className="p-6 flex items-center gap-3 border-b border-slate-50 overflow-hidden">
                <div className="bg-gradient-to-br from-indigo-500 to-cyan-400 p-1.5 rounded-lg shrink-0">
                    <CheckSquare className="text-white w-6 h-6" />
                </div>
                {isExpanded && (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                        <h1 className="text-xl font-bold text-slate-900 leading-none">DayFlow</h1>
                        <p className="text-xs text-slate-400 mt-1">Plan your day</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
                {menuItems.map((item) => (
                    <button
                        key={item.label}
                        className={`w-full flex items-center gap-4 px-3 py-3 rounded-2xl transition-all group ${
                            activeView === item.view
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : !item.view
                                ? 'text-slate-300 cursor-not-allowed opacity-50'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                            }`}
                        onClick={() => {
                            if (item.view && handleViewChange) {
                                setActiveView(item.view)
                                handleViewChange(item.view)
                            }
                        }}
                        disabled={!item.view}
                    >
                        <item.icon className={`w-6 h-6 shrink-0 ${activeView === item.view ? 'text-white' : !item.view ? 'text-slate-300' : 'group-hover:text-indigo-600'}`} />
                        {isExpanded && (
                            <span className="font-semibold text-sm whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                                {item.label}
                            </span>
                        )}
                    </button>
                ))}
            </nav>

            {/* Pro Tip Card */}
            <div className="p-4">
                <div className={`bg-slate-50 rounded-2xl p-4 transition-all ${isExpanded ? 'opacity-100' : 'opacity-0 scale-90 invisible'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="text-yellow-400 w-4 h-4" />
                        <span className="text-xs font-bold text-slate-900">Pro Tip</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        Use <kbd className="bg-white border border-slate-200 px-1 rounded shadow-sm font-sans">Cmd+K</kbd> to quickly add tasks
                    </p>
                </div>
            </div>
        </div>
    )
}