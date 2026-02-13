'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Task {
    id: string
    title: string
    priority: number
    impact_type: string
    energy_type: string
    estimated_time: number
    domain: string | null
    subdomain: string | null
    status: string
    due_date: string | null
    delay_count: number
    focus_today: boolean
    version: number
    created_at: string
}

interface TasksTableProps {
    tasks: Task[]
}

export default function TasksTable({ tasks }: TasksTableProps) {
    const router = useRouter()
    const [filter, setFilter] = useState<string>('all')

    const filteredTasks = tasks.filter(t => {
        if (filter === 'all') return true
        if (filter === 'pending') return t.status === 'pending'
        if (filter === 'completed') return t.status === 'completed'
        if (filter === 'revenue') return t.impact_type === 'revenue'
        if (filter === 'deep') return t.energy_type === 'deep'
        return true
    })

    const handleComplete = async (task: Task) => {
        await fetch('/api/tasks/update', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: task.id, version: task.version, status: 'completed' }),
        })
        router.refresh()
    }

    const handleDelete = async (id: string) => {
        await fetch('/api/tasks/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        })
        router.refresh()
    }

    const filters = [
        { key: 'all', label: 'All' },
        { key: 'pending', label: 'Pending' },
        { key: 'completed', label: 'Completed' },
        { key: 'revenue', label: 'Revenue' },
        { key: 'deep', label: 'Deep Work' },
    ]

    const impactColors: Record<string, string> = {
        revenue: 'text-green-400 bg-green-500/10',
        growth: 'text-blue-400 bg-blue-500/10',
        maintenance: 'text-gray-400 bg-gray-500/10',
        vanity: 'text-orange-400 bg-orange-500/10',
    }

    const statusColors: Record<string, string> = {
        pending: 'text-yellow-400 bg-yellow-500/10',
        completed: 'text-green-400 bg-green-500/10',
        overdue: 'text-red-400 bg-red-500/10',
    }

    return (
        <div className="bg-[#12121a] border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">All Tasks</h3>
                    <span className="text-xs text-gray-500">{filteredTasks.length} tasks</span>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                    {filters.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${filter === f.key
                                    ? 'bg-white/10 text-white border border-white/20'
                                    : 'text-gray-500 hover:text-gray-300 border border-transparent'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-t border-white/5">
                            <th className="text-left text-xs text-gray-500 font-medium px-6 py-3">Task</th>
                            <th className="text-left text-xs text-gray-500 font-medium px-4 py-3 hidden md:table-cell">Impact</th>
                            <th className="text-left text-xs text-gray-500 font-medium px-4 py-3 hidden md:table-cell">Priority</th>
                            <th className="text-left text-xs text-gray-500 font-medium px-4 py-3 hidden lg:table-cell">Time</th>
                            <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Status</th>
                            <th className="text-right text-xs text-gray-500 font-medium px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-gray-600">
                                    No tasks found
                                </td>
                            </tr>
                        ) : (
                            filteredTasks.map(task => (
                                <tr key={task.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className={`font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'}`}>
                                                {task.title}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-0.5">
                                                {task.domain}{task.subdomain ? ` · ${task.subdomain}` : ''}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 hidden md:table-cell">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${impactColors[task.impact_type] || 'text-gray-400'}`}>
                                            {task.impact_type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 hidden md:table-cell">
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map(p => (
                                                <div
                                                    key={p}
                                                    className={`w-1.5 h-4 rounded-full ${p <= task.priority ? 'bg-purple-400' : 'bg-white/10'}`}
                                                />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 hidden lg:table-cell">
                                        <span className="text-xs text-gray-400 font-mono">{task.estimated_time}m</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[task.status] || 'text-gray-400'}`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {task.status === 'pending' && (
                                                <button
                                                    onClick={() => handleComplete(task)}
                                                    className="text-xs px-2 py-1 rounded-lg text-green-400 hover:bg-green-500/10 transition-all"
                                                    title="Mark complete"
                                                >
                                                    ✓
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(task.id)}
                                                className="text-xs px-2 py-1 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                                                title="Delete"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
