/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useEffect } from 'react'
import {
    CheckCircle2, Clock, TrendingUp, Zap,
    Calendar as CalendarIcon, Tag as TagIcon,
    Repeat, Check
} from 'lucide-react'
import { getAllTasks, toggleTaskCompletion, type Task } from '@/app/api/tasks'

export default function Dashboard(): React.JSX.Element {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [todayDate] = useState(new Date())
    const [togglingId, setTogglingId] = useState<string | null>(null)

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true)
                const tasksData = await getAllTasks()
                setTasks(tasksData)
                setError(null)
            } catch (err) {
                console.error('Error fetching tasks:', err)
                setError('Failed to load tasks')
                setTasks([])
            } finally {
                setLoading(false)
            }
        }

        fetchTasks()
    }, [])

    // Filter tasks for today
    const getTodayString = () => {
        const year = todayDate.getFullYear()
        const month = String(todayDate.getMonth() + 1).padStart(2, '0')
        const day = String(todayDate.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const getDateString = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const calculateStreak = (): number => {
        let streak = 0
        const currentDate = new Date(todayDate)

        // Start from today and go backwards
        while (true) {
            const dateString = getDateString(currentDate)
            const dayTasks = tasks.filter(task => task.dueDate === dateString)
            const hasCompletedTask = dayTasks.some(task => task.completed)

            if (hasCompletedTask) {
                streak++
                // Go to previous day
                currentDate.setDate(currentDate.getDate() - 1)
            } else {
                // Stop if no completed tasks for this day
                break
            }
        }

        return streak
    }

    const getOverdueCount = (): number => {
        const today = new Date(todayDate)
        today.setHours(0, 0, 0, 0)

        return tasks.filter(task => {
            // Only count incomplete tasks
            if (task.completed) return false

            // Task must have a due date
            if (!task.dueDate) return false

            // Parse the due date
            const [year, month, day] = task.dueDate.split('-').map(Number)
            const dueDate = new Date(year, month - 1, day)
            dueDate.setHours(0, 0, 0, 0)

            // Check if task is overdue (due date is before today)
            return dueDate < today
        }).length
    }

    const todayString = getTodayString()
    const todayTasks = tasks.filter(task => task.dueDate === todayString)
    const completedCount = todayTasks.filter(task => task.completed).length
    const totalCount = todayTasks.length
    const overdueCount = getOverdueCount()
    const progress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0
    const streak = calculateStreak()

    const toggleTask = async (id: string) => {
        try {
            setTogglingId(id)
            const updatedTask = await toggleTaskCompletion(id)
            setTasks(prev => prev.map(task => (task.id === id ? updatedTask : task)))
        } catch (err) {
            console.error('Error toggling task:', err)
        } finally {
            setTogglingId(null)
        }
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) {
            return { text: 'Good morning! 👋', emoji: '🌅' }
        } else if (hour < 17) {
            return { text: 'Good afternoon! 👋', emoji: '☀️' }
        } else if (hour < 21) {
            return { text: 'Good evening! 👋', emoji: '🌆' }
        } else {
            return { text: 'Good night! 🌙', emoji: '🌙' }
        }
    }

    const greeting = getGreeting()

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans text-slate-900">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">{greeting.text}</h1>
                <p className="text-slate-500 mt-1">{formatDate(todayDate)}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-6 mb-10">
                <StatCard icon={<CheckCircle2 />} label="Today" value={`${completedCount}`} total={`/${totalCount}`} subtext="Tasks completed" color="indigo" />
                <StatCard icon={<Clock />} label="Overdue" value={`${overdueCount}`} subtext="Tasks past due" color="rose" />
                <StatCard icon={<TrendingUp />} label="Progress" value={`${progress}%`} subtext="Overall completion" color="emerald" />
                <StatCard icon={<Zap />} label="Start" value="25:00" subtext="Focus session" color="amber" isTimer />
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Section: Tasks */}
                <div className="col-span-8 space-y-6">
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-2xl font-bold">Today&apos;s Tasks</h2>
                        <span className="text-slate-400 text-sm font-medium">{totalCount} tasks</span>
                    </div>

                    {loading ? (
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center text-slate-400">
                            Loading tasks...
                        </div>
                    ) : error ? (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-600 text-sm font-semibold">
                            {error}
                        </div>
                    ) : todayTasks.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center text-slate-400">
                            No tasks scheduled for today
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {todayTasks.map(task => (
                                <TaskCard key={task.id} {...task} onToggle={() => toggleTask(task.id)} isTogglingId={togglingId === task.id} />
                            ))}
                        </div>
                    )}

                    <h3 className="text-xl font-bold pt-6">Upcoming Deadlines</h3>
                </div>

                {/* Right Section: Sidebar */}
                <div className="col-span-4 space-y-6">
                    {/* Calendar Widget */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-6 text-indigo-600">
                            <CalendarIcon size={20} />
                            <span className="font-bold">This Week</span>
                        </div>
                        <div className="flex justify-between">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                <div key={i} className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${i === 6 ? 'bg-indigo-600 text-white shadow-lg' : ''}`}>
                                    <span className="text-[10px] font-bold opacity-70">{day}</span>
                                    <span className="text-sm font-bold">{15 + i}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Streak Widget */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">🔥</span>
                            <span className="font-bold">Productivity Streak</span>
                        </div>
                        <div className="text-4xl font-black mb-2">{streak} {streak === 1 ? 'day' : 'days'}</div>
                        <p className="text-slate-400 text-sm mb-4">
                            {streak === 0 ? 'Complete a task to start your streak!' : streak === 1 ? 'Great start! Keep it going!' : 'Amazing! Keep up the momentum!'}
                        </p>
                        <div className="flex gap-1.5">
                            {[...Array(Math.max(7, streak))].map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 flex-1 rounded-full transition-all ${i < streak ? 'bg-rose-400' : 'bg-slate-200'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Priority Tasks */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="font-bold mb-4">Overdue Tasks</h3>
                        <div className="space-y-3">
                            {tasks.filter(t => {
                                if (t.completed) return false
                                if (!t.dueDate) return false
                                const [year, month, day] = t.dueDate.split('-').map(Number)
                                const dueDate = new Date(year, month - 1, day)
                                const today = new Date(todayDate)
                                today.setHours(0, 0, 0, 0)
                                dueDate.setHours(0, 0, 0, 0)
                                return dueDate < today
                            }).map(t => (
                                <div key={t.id} className="flex items-center justify-between p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
                                    <div className="flex-1">
                                        <span className="text-sm font-semibold truncate block">{t.title}</span>
                                        <span className="text-[11px] text-slate-400">{t.dueDate}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => toggleTask(t.id)}
                                        disabled={togglingId === t.id}
                                        className="w-5 h-5 border-2 border-rose-400 rounded-md shrink-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label={`Mark ${t.title} as completed`}
                                    />
                                </div>
                            ))}
                            {tasks.filter(t => {
                                if (t.completed) return false
                                if (!t.dueDate) return false
                                const [year, month, day] = t.dueDate.split('-').map(Number)
                                const dueDate = new Date(year, month - 1, day)
                                const today = new Date(todayDate)
                                today.setHours(0, 0, 0, 0)
                                dueDate.setHours(0, 0, 0, 0)
                                return dueDate < today
                            }).length === 0 && (
                                <p className="text-sm text-slate-400 text-center py-4">No overdue tasks! 🎉</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- Helper Components ---

function StatCard({ icon, label, value, total, subtext, color, isTimer }: any) {
    const colors: any = {
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
    }

    return (
        <div className={`${colors[color]} border p-6 rounded-3xl relative overflow-hidden shadow-sm`}>
            <div className="flex justify-between items-start mb-6">
                <div className={`p-2.5 rounded-xl bg-white shadow-sm`}>{icon}</div>
                {isTimer ? (
                    <button className="text-[10px] font-bold px-3 py-1 bg-amber-200/50 rounded-lg uppercase tracking-wider">Start</button>
                ) : (
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">{label}</span>
                )}
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">{value}</span>
                {total && <span className="text-slate-400 font-bold">{total}</span>}
            </div>
            <p className="text-slate-400 text-sm font-medium mt-1">{subtext}</p>
        </div>
    )
}

function TaskCard({ title, description, priority, dueTime, tags, recurring, completed, onToggle, isTogglingId }: any) {
    return (
        <div className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex gap-4 transition-all hover:shadow-md ${completed ? 'opacity-50' : ''}`}>
            <button
                type="button"
                onClick={onToggle}
                disabled={isTogglingId}
                aria-pressed={completed}
                className={`w-6 h-6 rounded-lg border-2 mt-1 shrink-0 flex items-center justify-center transition-all ${completed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {completed && <Check size={14} className="text-white" />}
            </button>
            <div className="flex-1">
                <h4 className={`font-bold text-lg ${completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{title}</h4>
                {description && <p className="text-slate-500 text-sm mt-1">{description}</p>}
                <div className="flex flex-wrap gap-2 mt-4">
                    <Badge text={priority} type={priority === 'high' ? 'error' : priority === 'medium' ? 'warning' : 'success'} />
                    {dueTime && <Badge text={dueTime} icon={<Clock size={12} />} />}
                    {recurring && <Badge text={recurring} icon={<Repeat size={12} />} type="teal" />}
                    {tags && tags.length > 0 && tags.map((tag: any, index: number) => (
                        <Badge key={`${tag.id}-${index}`} text={tag.name} icon={<TagIcon size={12} />} type="coral" />
                    ))}
                </div>
            </div>
        </div>
    )
}

function Badge({ text, icon, type = 'default' }: any) {
    const styles: any = {
        default: 'bg-slate-100 text-slate-500 border-slate-100',
        error: 'bg-rose-50 text-rose-500 border-rose-100',
        warning: 'bg-amber-50 text-amber-500 border-amber-100',
        success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        teal: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        coral: 'bg-rose-50 text-rose-400 border-rose-100',
    }
    return (
        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 uppercase tracking-wide ${styles[type]}`}>
            {icon} {text}
        </span>
    )
}