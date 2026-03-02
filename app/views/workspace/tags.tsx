/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useEffect } from 'react'
import { Tag as TagIcon, Plus, X, Palette, Type, Edit2, Trash2 } from 'lucide-react'
import { createTag, updateTag, deleteTag, getAllTags } from '@/app/api/tags'

interface TagData {
    id: number
    name: string
    color: string
    taskCount: number
}

interface ColorOption {
    name: string
    bg: string
}

// Helper function to derive lighter background color from hex color
const getLighterColor = (hexColor: string): string => {
    const hex = hexColor.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    const lighten = (value: number) => Math.min(255, Math.round(value + (255 - value) * 0.9))
    const newR = lighten(r).toString(16).padStart(2, '0')
    const newG = lighten(g).toString(16).padStart(2, '0')
    const newB = lighten(b).toString(16).padStart(2, '0')

    return `#${newR}${newG}${newB}`
}

const colorOptions: ColorOption[] = [
    { name: 'violet', bg: '#8b5cf6' },
    { name: 'amber', bg: '#f59e0b' },
    { name: 'rose', bg: '#f43f5e' },
    { name: 'cyan', bg: '#06b6d4' },
    { name: 'emerald', bg: '#10b981' },
]

export default function Tags(): React.JSX.Element {
    const [tagsData, setTagsData] = useState<TagData[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
    const [editingTagId, setEditingTagId] = useState<number | null>(null)
    const [newTagName, setNewTagName] = useState('')
    const [selectedColor, setSelectedColor] = useState('indigo')
    const [customColor, setCustomColor] = useState('#6366f1')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteTagId, setDeleteTagId] = useState<number | null>(null)

    const fetchTags = async () => {
        try {
            const tags = await getAllTags()
            setTagsData(tags)
        } catch (err) {
            console.error('Failed to fetch tags:', err)
        }
    }

    useEffect(() => {
        fetchTags()
    }, [])

    const toggleModal = () => setIsModalOpen(!isModalOpen)
    const openModalForCreate = () => {
        setModalMode('create')
        setEditingTagId(null)
        setNewTagName('')
        setSelectedColor('indigo')
        setCustomColor('#6366f1')
        setError('')
        setIsModalOpen(true)
    }

    const openModalForEdit = (tag: TagData) => {
        setModalMode('edit')
        setEditingTagId(tag.id)
        setNewTagName(tag.name)
        setCustomColor(tag.color)
        setSelectedColor(`custom-${tag.color}`)
        setError('')
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setModalMode('create')
        setEditingTagId(null)
        setNewTagName('')
        setSelectedColor('indigo')
        setCustomColor('#6366f1')
        setError('')
    }
    const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value
        setCustomColor(color)
        setSelectedColor(`custom-${color}`)
    }

    const getColorValue = (): string => {
        if (selectedColor.startsWith('custom')) {
            return customColor
        }
        const color = colorOptions.find((c) => c.name === selectedColor)
        return color?.bg || '#6366f1'
    }

    const handleCreateTag = async () => {
        if (!newTagName.trim()) {
            setError('Please enter a tag name')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const colorValue = getColorValue()
            
            if (modalMode === 'edit' && editingTagId) {
                await updateTag(editingTagId, newTagName, colorValue)
            } else {
                await createTag(newTagName, colorValue)
            }
            
            closeModal()
            // Refresh tags list
            await fetchTags()
        } catch (err: any) {
            setError(err.message || (modalMode === 'edit' ? 'Failed to update tag' : 'Failed to create tag'))
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteTag = async () => {
        if (!deleteTagId) return

        setIsLoading(true)
        try {
            await deleteTag(deleteTagId)
            setShowDeleteConfirm(false)
            setDeleteTagId(null)
            await fetchTags()
        } catch (err: any) {
            setError(err.message || 'Failed to delete tag')
        } finally {
            setIsLoading(false)
        }
    }

    console.log(tagsData);

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans text-slate-900 relative">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-3xl font-bold">Tags</h1>
                    <p className="text-slate-400 font-medium mt-1">{tagsData.length} tags</p>
                </div>
                <button
                    onClick={openModalForCreate}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-semibold shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    <span>New Tag</span>
                </button>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tagsData.map((tag) => (
                    <div key={tag.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group relative">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => openModalForEdit(tag)}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                title="Edit tag"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={() => {
                                    setDeleteTagId(tag.id)
                                    setShowDeleteConfirm(true)
                                }}
                                className="p-2 hover:bg-red-100 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                                title="Delete tag"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: getLighterColor(tag.color) }}>
                            <TagIcon className="w-6 h-6" style={{ color: tag.color }} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{tag.name}</h3>
                        <p className="text-slate-400 text-sm font-medium mt-1">{tag.taskCount} tasks</p>
                    </div>
                ))}

                {/* Create New Tag Placeholder */}
                <div
                    onClick={openModalForCreate}
                    className="bg-transparent border-2 border-dashed border-slate-200 p-8 rounded-3xl flex flex-col items-center justify-center text-center group cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100/50 flex items-center justify-center mb-4 group-hover:bg-indigo-100">
                        <Plus className="text-indigo-600 w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">Create New Tag</h3>
                    <p className="text-slate-400 text-xs font-medium mt-1">Categorize tasks</p>
                </div>
            </div>

            {/* MODAL COMPONENT */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Blurred Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={closeModal}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-50">
                            <h2 className="text-xl font-bold text-slate-900">
                                {modalMode === 'edit' ? 'Update Tag' : 'Add New Tag'}
                            </h2>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Error Message */}
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            {/* Tag Name Input */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 px-1">
                                    <Type size={16} className="text-slate-400" />
                                    Tag Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter tag name (e.g. Work, Study)"
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 placeholder:text-slate-500"
                                />
                            </div>

                            {/* Color Picker Section */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 px-1">
                                    <Palette size={16} className="text-slate-400" />
                                    Select Tag Color
                                </label>
                                <div className="grid grid-cols-6 gap-3">
                                    {colorOptions.map((color: ColorOption) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColor(color.name)}
                                            style={{ backgroundColor: color.bg }}
                                            className={`h-10 rounded-xl transition-all ${selectedColor === color.name
                                                ? `ring-4 ring-offset-2 ring-indigo-500 scale-110`
                                                : `opacity-60 hover:opacity-100`
                                                }`}
                                        />
                                    ))}

                                    {/* Custom Color Picker Slot */}
                                    <label className={`h-10 rounded-xl transition-all cursor-pointer flex items-center justify-center relative ring-inset ${selectedColor.startsWith('custom') ? 'ring-4 ring-offset-2 ring-indigo-500 scale-110' : 'opacity-60 hover:opacity-100'}`} style={selectedColor.startsWith('custom') ? { backgroundColor: customColor } : { backgroundColor: '#f5f5f5' }}>
                                        <input
                                            type="color"
                                            value={customColor}
                                            onChange={handleColorPickerChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-xl"
                                            title="Pick a custom color"
                                        />
                                        {!selectedColor.startsWith('custom') && <Plus size={20} className="text-slate-400 pointer-events-none" />}
                                    </label>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={closeModal}
                                    disabled={isLoading}
                                    className="flex-1 py-4 px-6 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateTag}
                                    disabled={isLoading}
                                    className="flex-1 py-4 px-6 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading 
                                        ? (modalMode === 'edit' ? 'Updating...' : 'Creating...') 
                                        : (modalMode === 'edit' ? 'Update Tag' : 'Create Tag')
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION DIALOG */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                    {/* Blurred Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setShowDeleteConfirm(false)}
                    />

                    {/* Confirmation Dialog */}
                    <div className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 space-y-6">
                            <div className="space-y-3">
                                <h3 className="text-xl font-bold text-slate-900">Delete Tag?</h3>
                                <p className="text-slate-500 text-sm">
                                    Are you sure you want to delete this tag? This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isLoading}
                                    className="flex-1 py-3 px-4 border border-slate-200 rounded-2xl font-semibold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteTag}
                                    disabled={isLoading}
                                    className="flex-1 py-3 px-4 bg-red-600 text-white rounded-2xl font-semibold hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}