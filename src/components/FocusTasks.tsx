'use client'

import { useRouter } from 'next/navigation'

interface Task {
    id: string
    title: string
    priority: number
    impact_type: string
    estimated_time: number
    domain: string | null
    status: string
    version: number
}

interface FocusTasksProps {
    tasks: Task[]
}

export default function FocusTasks({ tasks }: FocusTasksProps) {
    const router = useRouter()

    const handleSelectTop3 = async () => {
        try {
            await fetch('/api/select-top-3', { method: 'POST' })
            router.refresh()
        } catch (err) {
            console.error('Failed to select top 3:', err)
        }
    }

    const handleCompleteTask = async (task: Task) => {
        try {
            await fetch('/api/tasks/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: task.id,
                    version: task.version || 1,
                    status: 'completed',
                }),
            })
            router.refresh()
        } catch (err) {
            console.error('Failed to complete task:', err)
        }
    }

    return (
        <div className="bg-[#12121a] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">
                        Today&#39;s Focus
                    </h3>
                </div>
                <button
                    onClick={handleSelectTop3}
                    className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
                >
                    🎯 Auto-Select Top 3
                </button>
            </div>

            {tasks.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No focus tasks selected yet</p>
                    <p className="text-gray-600 text-xs mt-1">Click &quot;Auto-Select Top 3&quot; to let the ROI engine choose</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {tasks.map((task, i) => (
                        <div
                            key={task.id}
                            className="group relative overflow-hidden rounded-xl border border-cyan-500/10 bg-gradient-to-b from-cyan-500/5 to-transparent p-5 hover:border-cyan-500/20 transition-all"
                        >
                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-cyan-400">#{i + 1}</span>
                            </div>
                            <div className="mb-3">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                                    {task.impact_type} · P{task.priority}
                                </span>
                            </div>
                            <p className="text-white font-semibold text-sm mb-2 pr-8">{task.title}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>⏱ {task.estimated_time}m</span>
                                    {task.domain && <span>· {task.domain}</span>}
                                </div>
                                {task.status !== 'completed' && (
                                    <button
                                        onClick={() => handleCompleteTask(task)}
                                        className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all"
                                    >
                                        ✓ Done
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
