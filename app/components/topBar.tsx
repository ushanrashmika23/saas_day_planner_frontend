'use client'
import React, { useState, useEffect, useCallback } from 'react'
import {
    Search, Plus, Bell, Moon, User, X,
    Calendar as CalendarIcon, Clock, Tag as TagIcon,
    Flag, AlignLeft, Briefcase, ChevronDown
} from 'lucide-react'
import { searchTags, type Tag } from '../api/tags'
import { searchProjects, type Project } from '../api/projects'
import { createTask } from '../api/tasks'

export default function Topbar(): React.JSX.Element {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [dueTime, setDueTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Search states
    const [tagSearchQuery, setTagSearchQuery] = useState('');
    const [projectSearchQuery, setProjectSearchQuery] = useState('');
    const [tagResults, setTagResults] = useState<Tag[]>([]);
    const [projectResults, setProjectResults] = useState<Project[]>([]);
    const [showTagDropdown, setShowTagDropdown] = useState(false);
    const [showProjectDropdown, setShowProjectDropdown] = useState(false);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Set current date when modal opens

    const resetTaskForm = useCallback(() => {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate('');
        setDueTime('');
        setTagSearchQuery('');
        setProjectSearchQuery('');
        setTagResults([]);
        setProjectResults([]);
        setShowTagDropdown(false);
        setShowProjectDropdown(false);
        setSelectedTags([]);
        setSelectedProject(null);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        resetTaskForm();
    }, [resetTaskForm]);

    useEffect(() => {
        if (isModalOpen && !dueDate) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            setDueDate(`${year}-${month}-${day}`);
        }
    }, [isModalOpen, dueDate]);

    // Keyboard shortcut Cmd+K (or Ctrl+K) to open task modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsModalOpen(true);
            }
            // Close modal with Escape key
            if (e.key === 'Escape' && isModalOpen) {
                handleCloseModal();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, handleCloseModal]);

    // Debounced search for tags
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (tagSearchQuery.trim().length === 0) {
                setTagResults([]);
                setShowTagDropdown(false);
                return;
            }

            try {
                const results = await searchTags(tagSearchQuery);
                setTagResults(results);
                setShowTagDropdown(true);
            } catch (error) {
                console.error('Error searching tags:', error);
                setTagResults([]);
                setShowTagDropdown(true);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [tagSearchQuery]);

    // Debounced search for projects
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (projectSearchQuery.trim().length === 0) {
                setProjectResults([]);
                setShowProjectDropdown(false);
                return;
            }

            try {
                const results = await searchProjects(projectSearchQuery);
                setProjectResults(results);
                setShowProjectDropdown(true);
            } catch (error) {
                console.error('Error searching projects:', error);
                setProjectResults([]);
                setShowProjectDropdown(true);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [projectSearchQuery]);

    const handleSelectTag = (tag: Tag) => {
        if (!selectedTags.find(t => t.id === tag.id)) {
            setSelectedTags([...selectedTags, tag]);
        }
        setTagSearchQuery('');
        setShowTagDropdown(false);
    };

    const handleRemoveTag = (tagId: number) => {
        setSelectedTags(selectedTags.filter(t => t.id !== tagId));
    };

    const handleSelectProject = (project: Project) => {
        setSelectedProject(project);
        setProjectSearchQuery('');
        setShowProjectDropdown(false);
    };

    const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!title.trim()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await createTask({
                title: title.trim(),
                description: description.trim(),
                completed: false,
                priority,
                dueDate,
                dueTime,
                tags: selectedTags.map((tag) => String(tag.id)),
                projectId: selectedProject ? String(selectedProject.id) : undefined,
            });

            handleCloseModal();
        } catch (error) {
            console.error('Error creating task:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <header className="h-20 w-full bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-40">
                {/* Search Bar */}
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-500"
                    />
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        title="Add Task (⌘K or Ctrl+K)"
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-semibold shadow-lg shadow-indigo-100 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Task</span>
                    </button>

                    {/* Notifications & Theme */}
                    <div className="flex items-center gap-4 text-slate-400">
                        <div className="relative cursor-pointer hover:text-slate-600">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
                        </div>
                        <button className="hover:text-slate-600 transition-colors">
                            <Moon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Profile */}
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-100 cursor-pointer group">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-400 rounded-xl flex items-center justify-center text-white">
                            <User className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-slate-700">You</span>
                    </div>
                </div>
            </header>

            {/* ADD TASK MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={handleCloseModal}
                    />

                    {/* Modal Card */}
                    <div className="relative bg-white w-full max-w-xl rounded-[32px] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-50">
                            <h2 className="text-xl font-bold text-slate-900">Add New Task</h2>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTask} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            {/* Title */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <AlignLeft size={16} className="text-slate-400" /> Task Title
                                </label>
                                <input
                                    type="text"
                                    placeholder="What do you need to do?"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-3.5 px-5 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 placeholder:text-slate-500"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Description</label>
                                <textarea
                                    placeholder="Add details..."
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-3.5 px-5 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-900 placeholder:text-slate-500"
                                />
                            </div>

                            {/* Priority Selector */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <Flag size={16} className="text-slate-400" /> Priority
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(['low', 'medium', 'high'] as const).map((p) => {
                                        const colorClasses = {
                                            low: priority === p
                                                ? 'bg-emerald-50 border-emerald-400 text-emerald-600'
                                                : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200',
                                            medium: priority === p
                                                ? 'bg-amber-50 border-amber-400 text-amber-600'
                                                : 'bg-white border-slate-100 text-slate-400 hover:border-amber-200',
                                            high: priority === p
                                                ? 'bg-rose-50 border-rose-400 text-rose-600'
                                                : 'bg-white border-slate-100 text-slate-400 hover:border-rose-200'
                                        };

                                        return (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setPriority(p)}
                                                className={`py-2.5 rounded-xl font-semibold capitalize border-2 transition-all ${colorClasses[p]}`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Date & Time Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                        <CalendarIcon size={16} className="text-slate-400" /> Due Date
                                    </label>
                                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                        <Clock size={16} className="text-slate-400" /> Due Time
                                    </label>
                                    <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900" />
                                </div>
                            </div>

                            {/* Searchable Dropdowns (Tags & Projects) */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Searchable Tags */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                        <TagIcon size={16} className="text-slate-400" /> Tags
                                    </label>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search tags..."
                                            value={tagSearchQuery}
                                            onChange={(e) => setTagSearchQuery(e.target.value)}
                                            onFocus={() => tagSearchQuery.trim().length > 0 && setShowTagDropdown(true)}
                                            className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-3 pl-4 pr-10 outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900 placeholder:text-slate-500"
                                        />
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />

                                        {/* Tag Dropdown Results */}
                                        {showTagDropdown && (
                                            <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-[101]">
                                                {tagResults.length > 0 ? (
                                                    tagResults.map(tag => (
                                                        <button
                                                            key={tag.id}
                                                            type="button"
                                                            onClick={() => handleSelectTag(tag)}
                                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left border-b border-slate-100 last:border-0"
                                                            disabled={selectedTags.some(t => t.id === tag.id)}
                                                        >
                                                            <span
                                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                                style={{ backgroundColor: tag.color }}
                                                            />
                                                            <span className="text-sm font-medium text-slate-900">{tag.name}</span>
                                                            {selectedTags.some(t => t.id === tag.id) && (
                                                                <span className="ml-auto text-xs text-indigo-600 font-semibold">Selected</span>
                                                            )}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-3 text-sm text-slate-500 text-center">
                                                        No item named &quot;{tagSearchQuery}&quot;
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected Tags */}
                                    {selectedTags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedTags.map(tag => (
                                                <span
                                                    key={tag.id}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 border-2"
                                                    style={{ backgroundColor: tag.color + '30', borderColor: tag.color }}
                                                >
                                                    {tag.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag.id)}
                                                        className="hover:bg-white/50 rounded-full p-0.5"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Searchable Projects (Optional) */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                        <Briefcase size={16} className="text-slate-400" /> Project <span className="text-[10px] text-slate-400 font-normal ml-1">(Optional)</span>
                                    </label>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Select project..."
                                            value={projectSearchQuery}
                                            onChange={(e) => setProjectSearchQuery(e.target.value)}
                                            onFocus={() => projectSearchQuery.trim().length > 0 && setShowProjectDropdown(true)}
                                            className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-3 pl-4 pr-10 outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900 placeholder:text-slate-500"
                                        />
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />

                                        {/* Project Dropdown Results */}
                                        {showProjectDropdown && (
                                            <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-[101]">
                                                {projectResults.length > 0 ? (
                                                    projectResults.map(project => (
                                                        <button
                                                            key={project.id}
                                                            type="button"
                                                            onClick={() => handleSelectProject(project)}
                                                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 text-left border-b border-slate-100 last:border-0"
                                                        >
                                                            <span
                                                                className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                                                                style={{ backgroundColor: project.color }}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium text-slate-900">{project.name}</div>
                                                                {project.description && (
                                                                    <div className="text-xs text-slate-500 truncate mt-0.5">{project.description}</div>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-3 text-sm text-slate-500 text-center">
                                                        No item named &quot;{projectSearchQuery}&quot;
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected Project */}
                                    {selectedProject && (
                                        <div className="mt-2">
                                            <span
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 border-2"
                                                style={{ backgroundColor: selectedProject.color + '30', borderColor: selectedProject.color }}
                                            >
                                                {selectedProject.name}
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedProject(null)}
                                                    className="hover:bg-white/50 rounded-full p-0.5"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Adding...' : 'Add Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}