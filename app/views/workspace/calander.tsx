/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useEffect, useRef } from 'react'
import {
    ChevronLeft, ChevronRight, Clock, Check,
    Tag as TagIcon, Repeat
} from 'lucide-react'
import { getAllTasks, type Task } from '@/app/api/tasks'

function toLocalDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function taskDueDateKey(dueDate: string): string {
    if (!dueDate) {
        return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
        return dueDate;
    }

    const parsedDate = new Date(dueDate);
    if (Number.isNaN(parsedDate.getTime())) {
        return '';
    }

    return toLocalDateKey(parsedDate);
}

function getIsoWeekNumber(date: Date): number {
    const workingDate = new Date(date);
    const day = workingDate.getDay() || 7;
    workingDate.setDate(workingDate.getDate() + 4 - day);
    const yearStart = new Date(workingDate.getFullYear(), 0, 1);
    return Math.ceil((((workingDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export default function Calendar(): React.JSX.Element {
    const [view, setView] = useState<'Day' | 'Week' | 'Month'>('Day');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true);
                const tasksData = await getAllTasks();
                setTasks(tasksData);
                setError(null);
            } catch (err) {
                console.error('Error fetching tasks:', err);
                setError('Failed to load tasks');
                setTasks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const handlePrevious = () => {
        const newDate = new Date(selectedDate);
        if (view === 'Day') {
            newDate.setDate(newDate.getDate() - 1);
        } else if (view === 'Week') {
            newDate.setDate(newDate.getDate() - 7);
        } else if (view === 'Month') {
            newDate.setMonth(newDate.getMonth() - 1);
        }
        setSelectedDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(selectedDate);
        if (view === 'Day') {
            newDate.setDate(newDate.getDate() + 1);
        } else if (view === 'Week') {
            newDate.setDate(newDate.getDate() + 7);
        } else if (view === 'Month') {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setSelectedDate(newDate);
    };

    const getDisplayDate = () => {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        if (view === 'Day') {
            return `${dayNames[selectedDate.getDay()]}, ${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
        } else if (view === 'Week') {
            const weekStart = new Date(selectedDate);
            weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
        } else {
            return `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
        }
    };

    const getNavigationLabel = () => {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        if (view === 'Day') {
            const today = new Date();
            const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const selectedOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            const dayDiff = Math.round((selectedOnly.getTime() - todayOnly.getTime()) / 86400000);

            if (dayDiff === 0) {
                return 'Today';
            }

            if (dayDiff === -1) {
                return 'Yesterday';
            }

            if (dayDiff === 1) {
                return 'Tomorrow';
            }

            return `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
        }

        if (view === 'Week') {
            return `Week ${getIsoWeekNumber(selectedDate)}`;
        }

        return `${monthNames[selectedDate.getMonth()]}`;
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans text-slate-900">
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Calendar</h1>
                    <p className="text-slate-400 font-medium mt-1">{getDisplayDate()}</p>
                </div>

                <div className="flex items-center gap-6">
                    {/* View Switcher */}
                    <div className="flex bg-white border border-slate-200 p-1 rounded-2xl shadow-sm">
                        {['Day', 'Week', 'Month'].map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v as any)}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === v ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrevious} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm text-slate-700 min-w-[170px] text-center">
                            {getNavigationLabel()}
                        </div>
                        <button onClick={handleNext} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                        {/* <button onClick={handleToday} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
                            Today
                        </button> */}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-slate-400">Loading tasks...</div>
                </div>
            ) : error ? (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-600 text-sm font-semibold">
                    {error}
                </div>
            ) : (
                <>
                    {view === 'Day' && <DayView tasks={tasks} selectedDate={selectedDate} />}
                    {view === 'Week' && <WeekView tasks={tasks} selectedDate={selectedDate} />}
                    {view === 'Month' && <MonthView tasks={tasks} selectedDate={selectedDate} />}
                </>
            )}
        </div>
    )
}

// --- SUB-COMPONENTS ---

function DayView({ tasks, selectedDate }: { tasks: Task[]; selectedDate: Date }) {
    const hourSlots = Array.from({ length: 24 }, (_, hour) => hour);
    const hourRowHeight = 56;
    const scheduleScrollRef = useRef<HTMLDivElement | null>(null);
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000);

        return () => clearInterval(timer);
    }, []);

    // Get selected date
    const todayString = toLocalDateKey(selectedDate);

    // Filter tasks for selected day
    const todayTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = taskDueDateKey(task.dueDate);
        return taskDate === todayString;
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayLabel = `${dayNames[selectedDate.getDay()]}, ${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}`;
    const isTodayView = toLocalDateKey(selectedDate) === toLocalDateKey(currentTime);
    const currentMinuteOfDay = currentTime.getHours() * 60 + currentTime.getMinutes();
    const currentTimeLineTop = (currentMinuteOfDay / 60) * hourRowHeight;

    useEffect(() => {
        if (!isTodayView || !scheduleScrollRef.current) {
            return;
        }

        const container = scheduleScrollRef.current;
        const visibleTop = container.scrollTop;
        const visibleBottom = visibleTop + container.clientHeight;
        const padding = 48;

        if (currentTimeLineTop < visibleTop + padding || currentTimeLineTop > visibleBottom - padding) {
            const nextTop = Math.max(0, currentTimeLineTop - container.clientHeight / 2);
            container.scrollTo({ top: nextTop, behavior: 'smooth' });
        }
    }, [currentTimeLineTop, isTodayView]);

    const formatHourLabel = (hour: number) => {
        const normalizedHour = hour % 12 || 12;
        const suffix = hour >= 12 ? 'PM' : 'AM';
        return `${normalizedHour}:00 ${suffix}`;
    };

    const timedTasks = todayTasks
        .filter((task) => typeof task.dueTime === 'string' && task.dueTime.trim().length > 0)
        .map((task) => {
            const matchedTime = (task.dueTime || '').match(/^([01]\d|2[0-3]):([0-5]\d)$/);

            if (!matchedTime) {
                return null;
            }

            const hour = Number(matchedTime[1]);
            const minute = Number(matchedTime[2]);
            const isValidTime = !Number.isNaN(hour) && !Number.isNaN(minute);

            if (!isValidTime) {
                return null;
            }

            return {
                id: task.id,
                title: task.title,
                dueTime: task.dueTime,
                priority: task.priority,
                completed: task.completed,
                hour,
                minuteOfDay: hour * 60 + minute,
            };
        })
        .filter((task): task is {
            id: string;
            title: string;
            dueTime: string;
            priority: 'low' | 'medium' | 'high';
            completed: boolean;
            hour: number;
            minuteOfDay: number;
        } => task !== null)
        .sort((a, b) => a.minuteOfDay - b.minuteOfDay);

    // Calculate layers for overlapping tasks
    const TASK_DURATION_MINUTES = 30; // Default task duration for overlap calculation
    const tasksWithLayers: Array<{
        id: string;
        title: string;
        dueTime: string;
        priority: 'low' | 'medium' | 'high';
        completed: boolean;
        hour: number;
        minuteOfDay: number;
        layer: number;
    }> = [];

    for (let index = 0; index < timedTasks.length; index++) {
        const task = timedTasks[index];
        const taskStart = task.minuteOfDay;
        const taskEnd = taskStart + TASK_DURATION_MINUTES;

        // Find the minimum available layer that doesn't conflict with overlapping tasks
        const usedLayers = new Set<number>();

        for (let i = 0; i < index; i++) {
            const prevTask = timedTasks[i];
            const prevStart = prevTask.minuteOfDay;
            const prevEnd = prevStart + TASK_DURATION_MINUTES;

            // Check if tasks overlap
            if (prevEnd > taskStart && prevStart < taskEnd) {
                // Find what layer this previous task was assigned
                const prevTaskWithLayer = tasksWithLayers[i];
                if (prevTaskWithLayer) {
                    usedLayers.add(prevTaskWithLayer.layer);
                }
            }
        }

        // Find the minimum available layer (starting from 0)
        let layer = 0;
        while (usedLayers.has(layer)) {
            layer++;
        }

        tasksWithLayers.push({ ...task, layer });
    }

    return (
        <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-500">
            {/* Left: Task List */}
            <div className="col-span-8 space-y-4">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">{dayLabel}</h2>
                {todayTasks.length === 0 ? (
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center text-slate-400">
                        No tasks scheduled for today
                    </div>
                ) : (
                    todayTasks.map(task => (
                        <div key={task.id} className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 transition-all ${task.completed ? 'opacity-60' : ''}`}>
                            <div className={`w-6 h-6 rounded-lg border-2 shrink-0 flex items-center justify-center transition-all ${task.completed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'}`}>
                                {task.completed && <Check size={14} className="text-white font-bold" />}
                            </div>
                            <div className="flex-1">
                                <h4 className={`font-bold text-lg ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                    {task.title}
                                </h4>
                                {task.description && (
                                    <p className="text-slate-400 text-sm mt-1 mb-3 leading-relaxed">
                                        {task.description}
                                    </p>
                                )}

                                {/* Badges Row - Same as tasks component */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {/* Priority Badge */}
                                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border uppercase tracking-wide ${task.priority === 'high'
                                        ? 'bg-rose-50 text-rose-500 border-rose-100'
                                        : task.priority === 'medium'
                                            ? 'bg-amber-50 text-amber-500 border-amber-100'
                                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                        {task.priority}
                                    </span>

                                    {/* Time/Date Badge */}
                                    {(task.dueTime || task.dueDate) && (
                                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold border bg-slate-100 text-slate-500 border-slate-100 flex items-center gap-1.5 uppercase tracking-wide">
                                            <Clock size={12} /> {task.dueTime || task.dueDate}
                                        </span>
                                    )}

                                    {/* Recurring Badge */}
                                    {task.recurring && (
                                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold border bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center gap-1.5 uppercase tracking-wide">
                                            <Repeat size={12} /> {task.recurring}
                                        </span>
                                    )}

                                    {/* Project Badge */}
                                    {task.projectId && (
                                        <span
                                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 uppercase tracking-wide text-white"
                                            style={{
                                                backgroundColor: task.projectId.color,
                                                borderColor: task.projectId.color
                                            }}
                                        >
                                            <span
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
                                            ></span>
                                            {task.projectId.name}
                                        </span>
                                    )}

                                    {/* Tag Badges */}
                                    {task.tags.map((tag, index) => (
                                        <span key={`${tag.id}-${index}`} className="px-2.5 py-1 rounded-lg text-[11px] font-bold border bg-rose-50 text-rose-400 border-rose-100 flex items-center gap-1.5 uppercase tracking-wide">
                                            <TagIcon size={12} /> {tag.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Right: Vertical Schedule */}
            <div className="col-span-4 bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 max-h-[70vh] overflow-hidden flex flex-col">
                <div className="sticky top-0 z-10 bg-white pb-4 border-b border-slate-100">
                    <h3 className="font-bold text-lg">Schedule</h3>
                </div>

                <div ref={scheduleScrollRef} className="relative flex-1 overflow-y-auto pt-4 pr-1">
                    <div className="relative" style={{ minHeight: `${hourSlots.length * hourRowHeight}px` }}>
                        <div>
                            {hourSlots.map((hour) => (
                                <div key={hour} className="flex" style={{ height: `${hourRowHeight}px` }}>
                                    <div className="w-16 pr-2 text-[11px] font-bold text-slate-500 pt-1">
                                        {formatHourLabel(hour)}
                                    </div>
                                    <div className="flex-1 border-t border-slate-100"></div>
                                </div>
                            ))}
                        </div>

                        <div className="absolute left-16 right-2 top-0">
                            {tasksWithLayers.map((task) => {
                                const leftMargin = task.layer * 40; // 40px per layer
                                return (
                                    <div
                                        key={task.id}
                                        className={`absolute p-2 border-l-4 rounded-lg text-[11px] font-semibold shadow-sm transition-all cursor-pointer hover:shadow-lg hover:scale-105 ${task.priority === 'high'
                                            ? 'bg-rose-50 border-rose-500 text-rose-700'
                                            : task.priority === 'medium'
                                                ? 'bg-amber-50 border-amber-500 text-amber-700'
                                                : 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                            } ${task.completed ? 'opacity-60 line-through' : ''}`}
                                        style={{
                                            top: `${(task.minuteOfDay / 60) * hourRowHeight}px`,
                                            left: `${8 + leftMargin}px`,
                                            right: '0',
                                            zIndex: task.layer
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.zIndex = '999';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.zIndex = String(task.layer);
                                        }}
                                    >
                                        {task.title}
                                        <span className="ml-1 opacity-80">({task.dueTime})</span>
                                    </div>
                                );
                            })}

                            {isTodayView && (
                                <div className="absolute left-0 right-0" style={{ top: `${currentTimeLineTop}px` }}>
                                    <div className="relative">
                                        <span className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-white"></span>
                                        <div className="h-0.5 bg-rose-500 w-full"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {tasksWithLayers.length === 0 && (
                            <div className="mt-2 ml-16 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500">
                                No timed tasks for this day
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function WeekView({ tasks, selectedDate }: { tasks: Task[]; selectedDate: Date }) {
    // Get the week start (Sunday) for the selected date
    const weekStart = new Date(selectedDate);
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getTasksForDay = (dayIndex: number) => {
        const targetDate = new Date(weekStart);
        targetDate.setDate(weekStart.getDate() + dayIndex);
        const targetString = toLocalDateKey(targetDate);

        return tasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDate = taskDueDateKey(task.dueDate);
            return taskDate === targetString;
        });
    };

    const getDayLabel = (dayIndex: number) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + dayIndex);
        return `${dayNames[dayIndex]} ${date.getDate()}`;
    };

    const isToday = (dayIndex: number) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + dayIndex);
        const today = new Date();
        return toLocalDateKey(date) === toLocalDateKey(today);
    };

    return (
        <div className="grid grid-cols-7 gap-4 animate-in fade-in duration-500">
            {dayNames.map((_, i) => {
                const dayTasks = getTasksForDay(i);

                return (
                    <div key={i} className="space-y-4">
                        <div className={`text-center py-6 rounded-[24px] font-bold transition-all ${isToday(i) ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white border border-slate-100 text-slate-800'}`}>
                            <span className="block text-xs opacity-70 mb-1">{getDayLabel(i).split(' ')[0]}</span>
                            <span className="text-2xl">{getDayLabel(i).split(' ')[1]}</span>
                        </div>
                        {/* Tasks for the specific day */}
                        {dayTasks.length > 0 && (
                            <div className="space-y-3">
                                {dayTasks.map(t => (
                                    <div key={t.id} className={`p-3 bg-white border border-slate-100 rounded-2xl shadow-sm ${t.completed ? 'opacity-70' : ''}`}>
                                        <p className={`text-[11px] font-bold leading-tight mb-2 ${t.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{t.title}</p>
                                        <div className="flex flex-wrap gap-1 items-center">
                                            <div className={`w-1.5 h-1.5 rounded-full ${t.priority === 'high' ? 'bg-rose-400' : t.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                            {t.completed && (
                                                <span className="text-[10px] font-bold text-indigo-500 uppercase flex items-center gap-1">
                                                    <Check size={10} />
                                                </span>
                                            )}
                                            {t.dueTime && (
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{t.dueTime}</span>
                                            )}
                                            {t.projectId && (
                                                <span
                                                    className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white truncate max-w-full"
                                                    style={{
                                                        backgroundColor: t.projectId.color
                                                    }}
                                                >
                                                    {t.projectId.name}
                                                </span>
                                            )}
                                            {t.tags && t.tags.length > 0 && (
                                                <span className="text-[9px] font-bold text-rose-400 uppercase flex items-center gap-0.5">
                                                    <TagIcon size={9} /> {t.tags[0].name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    )
}

function MonthView({ tasks, selectedDate }: { tasks: Task[]; selectedDate: Date }) {
    const [hoveredDay, setHoveredDay] = useState<number | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number; transformOrigin: string }>({ x: 0, y: 0, transformOrigin: 'translate(-50%, -100%)' });
    const tooltipRef = useRef<HTMLDivElement>(null);
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    // Get first day of the month and days in month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const getTasksForDay = (dayNumber: number) => {
        const targetDate = new Date(year, month, dayNumber);
        const targetString = toLocalDateKey(targetDate);

        return tasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDate = taskDueDateKey(task.dueDate);
            return taskDate === targetString;
        });
    };

    const handleDayHover = (day: number, event: React.MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const tooltipWidth = 384; // max-w-sm = 384px
        const tooltipHeight = 384; // max-h-96 = 384px (approximate)
        const padding = 16;

        let x = rect.left + rect.width / 2;
        let y = rect.top - 10;
        let transform = 'translate(-50%, -100%)';

        // Check horizontal boundaries
        const leftEdge = x - tooltipWidth / 2;
        const rightEdge = x + tooltipWidth / 2;

        if (leftEdge < padding) {
            // Too far left, align to left edge
            x = padding + tooltipWidth / 2;
        } else if (rightEdge > window.innerWidth - padding) {
            // Too far right, align to right edge
            x = window.innerWidth - padding - tooltipWidth / 2;
        }

        // Check vertical boundaries
        if (y - tooltipHeight < padding) {
            // Not enough space above, show below instead
            y = rect.bottom + 10;
            transform = 'translate(-50%, 0)';
        }

        setHoveredDay(day);
        setTooltipPosition({ x, y, transformOrigin: transform });
    };

    const handleDayLeave = () => {
        setHoveredDay(null);
    };

    return (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="grid grid-cols-7 border-b border-slate-50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="py-4 text-center text-xs font-bold text-slate-400 border-r border-slate-50">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7">
                {/* Empty cells for days before the first of the month */}
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-32 border-r border-b border-slate-50 bg-slate-50"></div>
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const dayTasks = getTasksForDay(day);
                    const visibleTasks = dayTasks.slice(0, 2);
                    const remainingCount = dayTasks.length - 2;

                    return (
                        <div
                            key={day}
                            className="h-32 border-r border-b border-slate-50 p-3 hover:bg-slate-50 transition-colors group relative"
                            onMouseEnter={(e) => dayTasks.length > 0 && handleDayHover(day, e)}
                            onMouseLeave={handleDayLeave}
                        >
                            <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600">{day}</span>
                            {dayTasks.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {visibleTasks.map(task => (
                                        <div
                                            key={task.id}
                                            className={`p-1.5 border-l-2 text-[9px] font-bold rounded-md truncate ${task.priority === 'high'
                                                ? 'bg-rose-50 border-rose-400 text-rose-700'
                                                : task.priority === 'medium'
                                                    ? 'bg-amber-50 border-amber-400 text-amber-700'
                                                    : 'bg-emerald-50 border-emerald-400 text-emerald-700'
                                                } ${task.completed ? 'opacity-70' : ''}`}
                                        >
                                            <span className={`inline-flex items-center gap-1 ${task.completed ? 'line-through' : ''}`}>
                                                {task.completed && <Check size={10} />}
                                                {task.title}
                                            </span>
                                        </div>
                                    ))}
                                    {remainingCount > 0 && (
                                        <div className="text-[9px] font-bold text-slate-400 px-1">+{remainingCount} more</div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Tooltip for showing all tasks */}
            {hoveredDay !== null && (
                <div
                    ref={tooltipRef}
                    className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 max-w-sm max-h-96 overflow-y-auto animate-in fade-in duration-200"
                    style={{
                        left: `${tooltipPosition.x}px`,
                        top: `${tooltipPosition.y}px`,
                        transform: tooltipPosition.transformOrigin
                    }}
                >
                    <div className="font-bold text-sm text-slate-800 mb-3 border-b border-slate-100 pb-2">
                        {hoveredDay} {new Date(year, month).toLocaleDateString('en-US', { month: 'long' })}
                    </div>
                    <div className="space-y-3">
                        {getTasksForDay(hoveredDay).map(task => (
                            <div
                                key={task.id}
                                className={`p-3 bg-white border border-slate-100 rounded-2xl shadow-sm ${task.completed ? 'opacity-70' : ''}`}
                            >
                                <p className={`text-[11px] font-bold leading-tight mb-2 ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                    {task.title}
                                </p>
                                {task.description && (
                                    <p className="text-[10px] text-slate-400 leading-tight mb-2 line-clamp-2">
                                        {task.description}
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-1 items-center">
                                    <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'high' ? 'bg-rose-400' : task.priority === 'medium' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                                    {task.completed && (
                                        <span className="text-[10px] font-bold text-indigo-500 uppercase flex items-center gap-1">
                                            <Check size={10} />
                                        </span>
                                    )}
                                    {task.dueTime && (
                                        <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                            <Clock size={10} /> {task.dueTime}
                                        </span>
                                    )}
                                    {task.projectId && (
                                        <span
                                            className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white truncate max-w-full"
                                            style={{
                                                backgroundColor: task.projectId.color
                                            }}
                                        >
                                            {task.projectId.name}
                                        </span>
                                    )}
                                    {task.tags && task.tags.length > 0 && (
                                        <span className="text-[9px] font-bold text-rose-400 uppercase flex items-center gap-0.5">
                                            <TagIcon size={9} /> {task.tags[0].name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}