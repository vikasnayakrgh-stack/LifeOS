'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TaskModal() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const body = {
            title: formData.get('title'),
            domain: formData.get('domain') || null,
            subdomain: formData.get('subdomain') || null,
            priority: Number(formData.get('priority')) || 3,
            impact_type: formData.get('impact_type') || 'maintenance',
            energy_type: formData.get('energy_type') || 'shallow',
            estimated_time: Number(formData.get('estimated_time')) || 30,
            due_date: formData.get('due_date') || null,
            money_impact: formData.get('impact_type') === 'revenue',
        }

        try {
            await fetch('/api/tasks/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            setOpen(false)
            router.refresh()
        } catch (err) {
            console.error('Create task error:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium border border-white/10 transition-all active:scale-[0.97]"
            >
                <span>+</span> New Task
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div
                        className="bg-[#12121a] border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">Create Task</h2>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5">Title *</label>
                                <input
                                    name="title"
                                    required
                                    placeholder="e.g. Close deal with client X"
                                    className="w-full px-4 py-2.5 bg-[#1a1a2e] border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1.5">Domain</label>
                                    <input
                                        name="domain"
                                        placeholder="Business"
                                        className="w-full px-4 py-2.5 bg-[#1a1a2e] border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1.5">Subdomain</label>
                                    <input
                                        name="subdomain"
                                        placeholder="Sales"
                                        className="w-full px-4 py-2.5 bg-[#1a1a2e] border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1.5">Priority (1-5)</label>
                                    <select
                                        name="priority"
                                        defaultValue="3"
                                        className="w-full px-4 py-2.5 bg-[#1a1a2e] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                                    >
                                        <option value="1">1 - Low</option>
                                        <option value="2">2</option>
                                        <option value="3">3 - Medium</option>
                                        <option value="4">4</option>
                                        <option value="5">5 - Critical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1.5">Impact</label>
                                    <select
                                        name="impact_type"
                                        defaultValue="maintenance"
                                        className="w-full px-4 py-2.5 bg-[#1a1a2e] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                                    >
                                        <option value="revenue">💰 Revenue</option>
                                        <option value="growth">📈 Growth</option>
                                        <option value="maintenance">🔧 Maintenance</option>
                                        <option value="vanity">✨ Vanity</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1.5">Energy</label>
                                    <select
                                        name="energy_type"
                                        defaultValue="shallow"
                                        className="w-full px-4 py-2.5 bg-[#1a1a2e] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                                    >
                                        <option value="deep">🧠 Deep</option>
                                        <option value="shallow">⚡ Shallow</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1.5">Est. Time (min)</label>
                                    <input
                                        name="estimated_time"
                                        type="number"
                                        defaultValue="30"
                                        min="5"
                                        max="480"
                                        className="w-full px-4 py-2.5 bg-[#1a1a2e] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1.5">Due Date</label>
                                    <input
                                        name="due_date"
                                        type="datetime-local"
                                        className="w-full px-4 py-2.5 bg-[#1a1a2e] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="flex-1 py-2.5 rounded-xl bg-white/5 text-gray-300 text-sm hover:bg-white/10 border border-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-medium hover:from-purple-500 hover:to-cyan-500 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
