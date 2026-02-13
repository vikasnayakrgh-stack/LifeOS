import { createClient } from '@/lib/supabase/server'
import MetricsWidget from '@/components/MetricsWidget'
import FocusTasks from '@/components/FocusTasks'
import TasksTable from '@/components/TasksTable'
import WeeklyAnalysis from '@/components/WeeklyAnalysis'
import FocusModeButton from '@/components/FocusModeButton'
import TaskModal from '@/components/TaskModal'
import NaturalInput from '@/components/NaturalInput'

import Link from 'next/link'
import { Sparkles, Bell, Activity } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Fetch all active tasks
    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_deleted', false)
        .is('archived_at', null)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

    // Fetch focus tasks
    const { data: focusTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('focus_today', true)
        .eq('is_deleted', false)
        .is('archived_at', null)
        .order('priority', { ascending: false })
        .limit(3)

    // Calculate metrics
    const allTasks = tasks || []
    const total = allTasks.length
    const completed = allTasks.filter(t => t.status === 'completed').length
    const executionRatio = total > 0 ? Math.round((completed / total) * 100) : 0

    const revenueTasks = allTasks.filter(t => t.impact_type === 'revenue')
    const revenueCompleted = revenueTasks.filter(t => t.status === 'completed').length
    const revenueCompletion = revenueTasks.length > 0
        ? Math.round((revenueCompleted / revenueTasks.length) * 100)
        : 0

    const vanityTasks = allTasks.filter(t => t.impact_type === 'vanity')
    const vanityPercent = total > 0 ? Math.round((vanityTasks.length / total) * 100) : 0

    const overdueTasks = allTasks.filter(
        t => t.status === 'pending' && t.due_date && new Date(t.due_date) < new Date()
    )
    const overduePercent = total > 0 ? Math.round((overdueTasks.length / total) * 100) : 0

    const deepWorkMinutes = allTasks
        .filter(t => t.energy_type === 'deep' && t.status === 'completed')
        .reduce((acc, t) => acc + (t.estimated_time || 0), 0)

    const metrics = {
        executionRatio,
        revenueCompletion,
        vanityPercent,
        overduePercent,
        totalTasks: total,
        completedTasks: completed,
        deepWorkMinutes,
    }

    // Categorize tasks
    const revenuePending = allTasks.filter(t => t.impact_type === 'revenue' && t.status === 'pending')
    const deepWorkTasks = allTasks.filter(t => t.energy_type === 'deep' && t.status === 'pending')

    return (
        <div className="space-y-8">
            {/* Top bar: actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                    <p className="text-gray-500 text-sm mt-1">Execute, don't just plan.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/plan">
                        <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-opacity">
                            <Sparkles className="w-4 h-4" /> Weekly Review
                        </button>
                    </Link>
                    <Link href="/health">
                        <button className="p-2 text-gray-400 hover:text-green-400 transition-colors" title="Health Dashboard">
                            <Activity className="w-5 h-5" />
                        </button>
                    </Link>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    </button>
                    <div className="h-6 w-[1px] bg-white/10 mx-1" />
                    <FocusModeButton />
                    <TaskModal />
                </div>
            </div>

            {/* Natural Language Input */}
            <NaturalInput />

            {/* Metrics */}
            <MetricsWidget metrics={metrics} />

            {/* Focus Tasks */}
            <FocusTasks tasks={focusTasks || []} />

            {/* Revenue + Overdue + Deep Work Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Tasks */}
                <div className="bg-[#12121a] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wide">Revenue Tasks</h3>
                    </div>
                    {revenuePending.length === 0 ? (
                        <p className="text-gray-600 text-sm">No revenue tasks pending</p>
                    ) : (
                        <div className="space-y-3">
                            {revenuePending.slice(0, 5).map(task => (
                                <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                                    <div>
                                        <p className="text-sm text-white font-medium">{task.title}</p>
                                        <p className="text-xs text-gray-500">{task.domain} · P{task.priority}</p>
                                    </div>
                                    <span className="text-xs text-green-400 font-mono">{task.estimated_time}m</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Overdue Tasks */}
                <div className="bg-[#12121a] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wide">Overdue</h3>
                    </div>
                    {overdueTasks.length === 0 ? (
                        <p className="text-gray-600 text-sm">No overdue tasks 🎉</p>
                    ) : (
                        <div className="space-y-3">
                            {overdueTasks.slice(0, 5).map(task => (
                                <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                                    <div>
                                        <p className="text-sm text-white font-medium">{task.title}</p>
                                        <p className="text-xs text-gray-500">Delayed {task.delay_count}x · P{task.priority}</p>
                                    </div>
                                    <span className="text-xs text-red-400 font-mono">⚠️ L{task.reminder_level}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Deep Work */}
                <div className="bg-[#12121a] border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-purple-400" />
                        <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wide">Deep Work</h3>
                    </div>
                    {deepWorkTasks.length === 0 ? (
                        <p className="text-gray-600 text-sm">No deep work tasks</p>
                    ) : (
                        <div className="space-y-3">
                            {deepWorkTasks.slice(0, 5).map(task => (
                                <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                                    <div>
                                        <p className="text-sm text-white font-medium">{task.title}</p>
                                        <p className="text-xs text-gray-500">{task.domain} · P{task.priority}</p>
                                    </div>
                                    <span className="text-xs text-purple-400 font-mono">{task.estimated_time}m</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Weekly Analysis */}
            <WeeklyAnalysis />

            {/* All Tasks Table */}
            <TasksTable tasks={allTasks} />
        </div>
    )
}
