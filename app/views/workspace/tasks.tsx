/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useEffect, useRef } from 'react'
import {
    List, Grid, Filter, ChevronDown,
    Check, Clock, Repeat, Tag as TagIcon,
    X
} from 'lucide-react'
import { getAllTasks, toggleTaskCompletion, deleteTask, type Task } from '@/app/api/tasks'

export default function TasksPage(): React.JSX.Element {
    const [filter, setFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
    const [projectFilter, setProjectFilter] = useState<string | 'all'>('all');
    const [tagFilter, setTagFilter] = useState<string | 'all'>('all');
    const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
    const [showProjectDropdown, setShowProjectDropdown] = useState(false);
    const [showTagDropdown, setShowTagDropdown] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('dueDate');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [tasksData, setTasksData] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const filterContainerRef = useRef<HTMLDivElement>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ taskId: string; taskTitle: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true);
                const tasks = await getAllTasks();
                setTasksData(tasks);
                setError(null);
            } catch (err) {
                console.error('Error fetching tasks:', err);
                setError('Failed to load tasks');
                setTasksData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    // Close all dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterContainerRef.current && !filterContainerRef.current.contains(event.target as Node)) {
                setShowPriorityDropdown(false);
                setShowProjectDropdown(false);
                setShowTagDropdown(false);
                setShowSortDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const closeAllDropdowns = () => {
        setShowPriorityDropdown(false);
        setShowProjectDropdown(false);
        setShowTagDropdown(false);
        setShowSortDropdown(false);
    };

    const getUniqueProjects = () => {
        const projects = new Map();
        tasksData.forEach((task) => {
            if (task.projectId) {
                projects.set(task.projectId.id, task.projectId);
            }
        });
        return Array.from(projects.values());
    };

    const getUniqueTags = () => {
        const tags = new Map();
        tasksData.forEach((task) => {
            task.tags.forEach((tag) => {
                tags.set(tag.id, tag);
            });
        });
        return Array.from(tags.values());
    };

    const resetFilters = () => {
        setFilter('All');
        setPriorityFilter('all');
        setProjectFilter('all');
        setTagFilter('all');
    };

    const getSortedTasks = () => {
        let filtered = [...tasksData];

        // Apply completion status filter
        if (filter === 'Active') {
            filtered = filtered.filter((task) => !task.completed);
        } else if (filter === 'Completed') {
            filtered = filtered.filter((task) => task.completed);
        }

        // Apply priority filter
        if (priorityFilter !== 'all') {
            filtered = filtered.filter((task) => task.priority === priorityFilter);
        }

        // Apply project filter
        if (projectFilter !== 'all') {
            filtered = filtered.filter((task) => task.projectId?.id === projectFilter);
        }

        // Apply tag filter
        if (tagFilter !== 'all') {
            filtered = filtered.filter((task) => task.tags.some((tag) => tag.id === tagFilter));
        }

        // Now sort
        const sorted = [...filtered];

        if (sortBy === 'dueDate') {
            return sorted.sort((a, b) => {
                // Tasks without due date go to top
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return -1;
                if (!b.dueDate) return 1;
                // Sort by date ascending
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            });
        }

        if (sortBy === 'priority') {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        }

        if (sortBy === 'created') {
            return sorted.sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
        }

        return sorted;
    };

    const handleToggleTask = async (taskId: string) => {
        try {
            const updatedTask = await toggleTaskCompletion(taskId);
            setTasksData(prevTasks =>
                prevTasks.map(task => task.id === taskId ? updatedTask : task)
            );
        } catch (err) {
            console.error('Error toggling task:', err);
        }
    };

    const handleDeleteTask = async () => {
        if (!deleteConfirmation) return;
        
        try {
            setIsDeleting(true);
            await deleteTask(deleteConfirmation.taskId);
            setTasksData(prevTasks =>
                prevTasks.filter(task => task.id !== deleteConfirmation.taskId)
            );
            setDeleteConfirmation(null);
        } catch (err) {
            console.error('Error deleting task:', err);
            setDeleteConfirmation(null);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div ref={filterContainerRef} className="p-8 bg-gray-50 min-h-screen font-sans text-slate-900">
            {/* Header with Sort and View Toggles */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">
                        {loading ? 'Loading...' : `${tasksData.length} all tasks`}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2 relative">
                        <span className="text-slate-400"><Filter size={18} /></span>
                        <button
                            onClick={() => {
                                closeAllDropdowns();
                                setShowSortDropdown(!showSortDropdown);
                            }}
                            className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
                        >
                            {sortBy === 'dueDate' ? 'Due Date' : sortBy === 'priority' ? 'Priority' : 'Created'}
                            <ChevronDown size={14} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Sort Dropdown Menu */}
                        {showSortDropdown && (
                            <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50">
                                {[
                                    { value: 'dueDate', label: 'Due Date' },
                                    { value: 'priority', label: 'Priority' },
                                    { value: 'created', label: 'Created Date' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setSortBy(option.value as 'dueDate' | 'priority' | 'created');
                                            setShowSortDropdown(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-all border-b border-slate-100 last:border-0 ${
                                            sortBy === option.value
                                                ? 'bg-indigo-50 text-indigo-600'
                                                : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        ✓ {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-slate-200/50 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Grid size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Pills and Additional Filters Row */}
            <div className="flex gap-3 mb-6 items-center justify-between flex-wrap">
                {/* Left Section: Additional Filters */}
                <div className="flex gap-3 flex-wrap items-center">
                    {/* Priority Filter */}
                <div className="relative">
                    <button
                        onClick={() => {
                            closeAllDropdowns();
                            setShowPriorityDropdown(!showPriorityDropdown);
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border flex items-center gap-2 ${
                            priorityFilter !== 'all'
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        Priority: {priorityFilter === 'all' ? 'All' : priorityFilter.charAt(0).toUpperCase() + priorityFilter.slice(1)}
                        <ChevronDown size={14} className={`transition-transform ${showPriorityDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showPriorityDropdown && (
                        <div className="absolute top-full mt-2 left-0 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-50">
                            {[
                                { value: 'all', label: 'All Priorities' },
                                { value: 'high', label: 'High' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'low', label: 'Low' }
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setPriorityFilter(option.value as 'all' | 'high' | 'medium' | 'low');
                                        setShowPriorityDropdown(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-all border-b border-slate-100 last:border-0 ${
                                        priorityFilter === option.value
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Project Filter */}
                {getUniqueProjects().length > 0 && (
                    <div className="relative">
                        <button
                            onClick={() => {
                                closeAllDropdowns();
                                setShowProjectDropdown(!showProjectDropdown);
                            }}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border flex items-center gap-2 ${
                                projectFilter !== 'all'
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Project: {projectFilter === 'all' ? 'All' : getUniqueProjects().find((p) => p.id === projectFilter)?.name}
                            <ChevronDown size={14} className={`transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showProjectDropdown && (
                            <div className="absolute top-full mt-2 left-0 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                                <button
                                    onClick={() => {
                                        setProjectFilter('all');
                                        setShowProjectDropdown(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-all border-b border-slate-100 ${
                                        projectFilter === 'all'
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    All Projects
                                </button>
                                {getUniqueProjects().map((project) => (
                                    <button
                                        key={project.id}
                                        onClick={() => {
                                            setProjectFilter(project.id);
                                            setShowProjectDropdown(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-all border-b border-slate-100 last:border-0 flex items-center gap-2 ${
                                            projectFilter === project.id
                                                ? 'bg-indigo-50 text-indigo-600'
                                                : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: project.color }}
                                        ></span>
                                        {project.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tag Filter */}
                {getUniqueTags().length > 0 && (
                    <div className="relative">
                        <button
                            onClick={() => {
                                closeAllDropdowns();
                                setShowTagDropdown(!showTagDropdown);
                            }}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border flex items-center gap-2 ${
                                tagFilter !== 'all'
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Tag: {tagFilter === 'all' ? 'All' : getUniqueTags().find((t) => t.id === tagFilter)?.name}
                            <ChevronDown size={14} className={`transition-transform ${showTagDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showTagDropdown && (
                            <div className="absolute top-full mt-2 left-0 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                                <button
                                    onClick={() => {
                                        setTagFilter('all');
                                        setShowTagDropdown(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-all border-b border-slate-100 ${
                                        tagFilter === 'all'
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    All Tags
                                </button>
                                {getUniqueTags().map((tag) => (
                                    <button
                                        key={tag.id}
                                        onClick={() => {
                                            setTagFilter(tag.id);
                                            setShowTagDropdown(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-all border-b border-slate-100 last:border-0 flex items-center gap-2 ${
                                            tagFilter === tag.id
                                                ? 'bg-indigo-50 text-indigo-600'
                                                : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: tag.color }}
                                        ></span>
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Reset Filters Button - Conditional */}
                {(filter !== 'All' || priorityFilter !== 'all' || projectFilter !== 'all' || tagFilter !== 'all') && (
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-all"
                    >
                        <X size={16} />
                    </button>
                )}
                </div>

                {/* Right Section: Status Filter Pills */}
                <div className="flex gap-2">
                    {['All', 'Active', 'Completed'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${filter === tab
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                    : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-600 text-sm font-semibold mb-6">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-slate-400">Loading tasks...</div>
                </div>
            )}

            {/* Empty State */}
            {!loading && tasksData.length === 0 && !error && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-slate-400">No tasks found</div>
                </div>
            )}

            {/* Task List/Grid */}
            {!loading && tasksData.length > 0 && (
                <div className={viewMode === 'list' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
                    {getSortedTasks().map((task) => (
                        viewMode === 'list' ? (
                            <TaskRow key={task.id} task={task} onToggle={handleToggleTask} onDelete={() => setDeleteConfirmation({ taskId: task.id, taskTitle: task.title })} />
                        ) : (
                            <TaskCard key={task.id} task={task} onToggle={handleToggleTask} onDelete={() => setDeleteConfirmation({ taskId: task.id, taskTitle: task.title })} />
                        )
                    ))}
                </div>
            )}

            {deleteConfirmation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Task?</h3>
                        <p className="text-slate-600 text-sm mb-6">
                            Are you sure you want to delete {`"`}<span className="font-semibold">{deleteConfirmation.taskTitle}</span>{`"`}? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirmation(null)}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteTask}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <X size={16} />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function TaskRow({ task, onToggle, onDelete }: { task: Task; onToggle: (taskId: string) => void; onDelete: () => void }) {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

    return (
        <div className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 transition-all hover:shadow-md relative group ${task.completed ? 'opacity-60' : ''}`}>
            {/* Delete Button - Top Right */}
            <button
                onClick={onDelete}
                className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                title="Delete task"
            >
                <X size={18} />
            </button>

            {/* Custom Checkbox */}
            <button onClick={() => onToggle(task.id)} className={`w-6 h-6 rounded-lg border-2 mt-1 shrink-0 flex items-center justify-center transition-all ${task.completed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 hover:border-indigo-400'}`}>
                {task.completed && <Check size={14} className="text-white font-bold" />}
            </button>

            {/* Content */}
            <div className="flex-1">
                <h4 className={`font-bold text-lg ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {task.title}
                </h4>
                {task.description && (
                    <p className="text-slate-400 text-sm mt-1 mb-4 leading-relaxed">
                        {task.description}
                    </p>
                )}

                {/* Badges Row */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {/* Priority Badge */}
                    <Badge
                        text={task.priority}
                        type={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'teal'}
                    />

                    {/* Time/Date Badge */}
                    {(task.dueTime || task.dueDate) && (
                        <Badge
                            text={task.dueTime || task.dueDate}
                            icon={<Clock size={12} />}
                            type={isOverdue ? 'error' : 'default'}
                        />
                    )}

                    {/* Recurring Badge */}
                    {task.recurring && (
                        <Badge text={task.recurring} icon={<Repeat size={12} />} type="teal" />
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
                        <Badge key={`${tag.id}-${index}`} text={tag.name} icon={<TagIcon size={12} />} type="coral" />
                    ))}
                </div>
            </div>
        </div>
    )
}

function TaskCard({ task, onToggle, onDelete }: { task: Task; onToggle: (taskId: string) => void; onDelete: () => void }) {
    return (
        <div className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full ${task.completed ? 'opacity-60' : ''} relative group`}>
            {/* Delete Button - Top Right */}
            <button
                onClick={onDelete}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                title="Delete task"
            >
                <X size={16} />
            </button>

            {/* Header with Checkbox */}
            <div className="flex items-start justify-between mb-3">
                <button onClick={() => onToggle(task.id)} className={`w-5 h-5 rounded-lg border-2 shrink-0 flex items-center justify-center transition-all ${task.completed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 hover:border-indigo-400'}`}>
                    {task.completed && <Check size={12} className="text-white font-bold" />}
                </button>
                <span
                    className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg ${
                        task.priority === 'high'
                            ? 'bg-rose-50 text-rose-500'
                            : task.priority === 'medium'
                            ? 'bg-amber-50 text-amber-500'
                            : 'bg-emerald-50 text-emerald-600'
                    }`}
                >
                    {task.priority}
                </span>
            </div>

            {/* Title */}
            <h4 className={`font-bold text-sm mb-2 line-clamp-2 ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                {task.title}
            </h4>

            {/* Description */}
            {task.description && (
                <p className="text-slate-400 text-xs mb-3 line-clamp-2">
                    {task.description}
                </p>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                {task.dueDate && (
                    <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {task.dueDate}
                    </span>
                )}
                {task.recurring && (
                    <span className="flex items-center gap-1">
                        <Repeat size={12} />
                        {task.recurring}
                    </span>
                )}
            </div>

            {/* Project & Tags */}
            <div className="flex-1 mb-3">
                {task.projectId && (
                    <div className="mb-2">
                        <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg text-white"
                            style={{
                                backgroundColor: task.projectId.color,
                            }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}></span>
                            {task.projectId.name}
                        </span>
                    </div>
                )}
                {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {task.tags.slice(0, 2).map((tag, index) => (
                            <span key={`${tag.id}-${index}`} className="text-[10px] font-bold bg-rose-50 text-rose-400 px-2 py-0.5 rounded-lg">
                                {tag.name}
                            </span>
                        ))}
                        {task.tags.length > 2 && (
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg">
                                +{task.tags.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

function Badge({ text, icon, type = 'default' }: { text: string, icon?: React.ReactNode, type?: string }) {
    const styles: any = {
        default: 'bg-slate-100 text-slate-500 border-slate-100',
        error: 'bg-rose-50 text-rose-500 border-rose-100',
        warning: 'bg-amber-50 text-amber-500 border-amber-100',
        teal: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        coral: 'bg-rose-50 text-rose-400 border-rose-100',
    }

    return (
        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 uppercase tracking-wide ${styles[type]}`}>
            {icon} {text}
        </span>
    )
}