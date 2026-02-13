'use client'

import { useState } from 'react'
import { LayoutGrid, List, Search, Filter, X } from 'lucide-react'
import TasksTable from '@/components/TasksTable'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import NaturalInput from '@/components/NaturalInput'

interface Task {
    id: string
    title: string
    priority: number
    status: string
    domain: string | null
    estimated_time: number
    impact_type: string
    energy_type: string
    subdomain: string | null
    due_date: string | null
    delay_count: number
    focus_today: boolean
    version: number
    created_at: string
}

interface Props {
    tasks: Task[]
}

type FilterType = 'all' | 'revenue' | 'deep' | 'high_priority' | 'quick'

export default function TasksView({ tasks }: Props) {
    const [view, setView] = useState<'board' | 'table'>('board')
    const [search, setSearch] = useState('')
    const [activeFilter, setActiveFilter] = useState<FilterType>('all')

    const filteredTasks = tasks.filter(task => {
        // Search
        if (search && !task.title.toLowerCase().includes(search.toLowerCase()) &&
            !task.domain?.toLowerCase().includes(search.toLowerCase())) {
            return false
        }

        // Filter
        if (activeFilter === 'all') return true
        if (activeFilter === 'revenue') return task.impact_type === 'revenue'
        if (activeFilter === 'deep') return task.energy_type === 'deep'
        if (activeFilter === 'high_priority') return task.priority >= 4
        if (activeFilter === 'quick') return task.estimated_time <= 15

        return true
    })

    const filters: { id: FilterType; label: string; icon?: React.ReactNode }[] = [
        { id: 'all', label: 'All' },
        { id: 'revenue', label: '💰 Revenue' },
        { id: 'deep', label: '🧠 Deep Work' },
        { id: 'high_priority', label: '🚨 High Priority' },
        { id: 'quick', label: '⚡ Quick Wins' },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-white">Tasks</h1>

                <div className="flex flex-1 max-w-xl gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search tasks..."
                            className="w-full bg-[#12121a] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-white/20 transition-all"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex bg-[#12121a] p-1 rounded-lg border border-white/10 shrink-0">
                    <button
                        onClick={() => setView('board')}
                        className={`p-2 rounded-md transition-all ${view === 'board' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                        title="Kanban Board"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setView('table')}
                        className={`p-2 rounded-md transition-all ${view === 'table' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                        title="Table View"
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <NaturalInput />

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2">
                {filters.map(f => (
                    <button
                        key={f.id}
                        onClick={() => setActiveFilter(f.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${activeFilter === f.id
                                ? 'bg-white text-black border-white'
                                : 'bg-transparent text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
                {(search || activeFilter !== 'all') && (
                    <div className="ml-auto text-xs text-gray-500 flex items-center">
                        Showing {filteredTasks.length} tasks
                    </div>
                )}
            </div>

            {view === 'board' ? (
                <KanbanBoard initialTasks={filteredTasks} />
            ) : (
                <TasksTable tasks={filteredTasks} />
            )}
        </div>
    )
}
