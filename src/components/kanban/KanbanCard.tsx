'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTaskTimer } from '@/lib/hooks/use-task-timer'
import TaskTimer from '@/components/TaskTimer'
import { useEffect, useState } from 'react'
import { Sparkles, Loader2, CalendarClock } from 'lucide-react'
import { useResistance } from '@/lib/hooks/use-resistance'
import { useSmartReschedule } from '@/lib/hooks/use-smart-reschedule'

interface Task {
    id: string
    title: string
    priority: number
    status: string
    domain: string | null
    due_date?: string | null
    estimated_time: number
    actual_time?: number
    subtasks?: { id: string; title: string; isCompleted: boolean }[] | null
    created_at?: string
    reschedule_count?: number
}

interface Props {
    task: Task
    onTimerStop?: (taskId: string, duration: number) => void
}

export function KanbanCard({ task, onTimerStop }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id, data: { task } })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    }

    // Initialize timer with 0, we track *session* time here. 
    // Total time is task.actual_time + session time.
    const { isRunning, elapsedTime, start, stop, reset } = useTaskTimer(0)

    // Resistance Logic
    const { Icon: ResistanceIcon, color: resistanceColor, level: resistanceLevel } = useResistance(task)

    // Rescheduling Logic
    const { isOverdue, getSuggestions } = useSmartReschedule()
    const [showRescheduleMenu, setShowRescheduleMenu] = useState(false)
    const overdue = isOverdue(task.due_date)

    const handleReschedule = (newDate: Date) => {
        // Optimistic update for UI demo - in real app would call API
        console.log(`Rescheduling task ${task.id} to ${newDate}`)
        setShowRescheduleMenu(false)
        // refresh/toast logic here
    }

    // Subtask state (optimistic)
    const [subtasks, setSubtasks] = useState<{ id: string; title: string; isCompleted: boolean }[]>(task.subtasks || [])
    const [isGenerating, setIsGenerating] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    const handleGenerateSubtasks = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (subtasks.length > 0) {
            setIsExpanded(!isExpanded)
            return
        }

        setIsGenerating(true)
        try {
            const res = await fetch('/api/ai/breakdown', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: task.title, domain: task.domain }),
            })
            const data = await res.json()
            if (data.subtasks) {
                setSubtasks(data.subtasks)
                setIsExpanded(true)
                // TODO: Persist to DB if we had an update endpoint active
            }
        } catch (error) {
            console.error('Failed to generate', error)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleStop = () => {
        stop()
        if (onTimerStop && elapsedTime > 0) {
            onTimerStop(task.id, elapsedTime)
            reset()
        }
    }

    const priorityColor = (p: number) => {
        if (p === 5) return 'bg-red-500/20 text-red-300 border-red-500/20'
        if (p >= 3) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/20'
        return 'bg-blue-500/20 text-blue-300 border-blue-500/20'
    }

    // Calculate progress
    const totalTime = (task.actual_time || 0) + elapsedTime
    const progress = Math.min((totalTime / (task.estimated_time * 60)) * 100, 100)
    const isOvertime = totalTime > (task.estimated_time * 60)

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="group relative bg-[#181822] p-4 rounded-xl border border-white/5 hover:border-white/20 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing mb-3"
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${priorityColor(task.priority)}`}>
                        P{task.priority}
                    </span>
                    {task.domain && (
                        <span className="text-[10px] text-gray-500 font-mono">@{task.domain}</span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Resistance Heatmap Icon */}
                    {ResistanceIcon && (
                        <div className="relative group/flame" title={`Resistance Level: ${resistanceLevel}`}>
                            <ResistanceIcon className={`w-4 h-4 ${resistanceColor}`} />
                        </div>
                    )}

                    {/* Reschedule Trigger (Only if overdue) */}
                    {overdue && (
                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowRescheduleMenu(!showRescheduleMenu) }}
                                className="text-red-400 hover:text-red-300 transition-colors p-1"
                                title="Overdue! Click to reschedule."
                            >
                                <CalendarClock className="w-4 h-4" />
                            </button>

                            {showRescheduleMenu && (
                                <div className="absolute top-6 right-0 bg-[#252532] border border-white/10 rounded-lg shadow-xl z-50 w-32 overflow-hidden flex flex-col pointer-events-auto">
                                    {getSuggestions().map((suggestion) => (
                                        <button
                                            key={suggestion.label}
                                            onClick={(e) => { e.stopPropagation(); handleReschedule(suggestion.date) }}
                                            className="text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                        >
                                            {suggestion.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <p className="text-sm font-medium text-white mb-3 group-hover:text-purple-200 transition-colors">
                {task.title}
            </p>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/5 rounded-full mb-3 overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ${isOvertime ? 'bg-red-500' : 'bg-cyan-500'}`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="bg-white/5 px-2 py-1 rounded-md">
                        Est: {task.estimated_time}m
                    </span>
                </div>

                {/* Timer Component */}
                <TaskTimer
                    isRunning={isRunning}
                    elapsedTime={(task.actual_time || 0) + elapsedTime}
                    onStart={start}
                    onStop={handleStop}
                    className="scale-90 origin-right"
                />
            </div>

            {/* Subtasks Section */}
            {(subtasks.length > 0 || isGenerating) && isExpanded && (
                <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                    {subtasks.map(st => (
                        <div key={st.id} className="flex items-start gap-2 text-xs text-gray-400">
                            <input type="checkbox" checked={st.isCompleted} readOnly className="mt-0.5 accent-purple-500" />
                            <span className={st.isCompleted ? 'line-through opacity-50' : ''}>{st.title}</span>
                        </div>
                    ))}
                    {subtasks.length === 0 && isGenerating && (
                        <div className="flex items-center gap-2 text-xs text-purple-400 animate-pulse">
                            <Sparkles className="w-3 h-3" /> Generating steps...
                        </div>
                    )}
                </div>
            )}

            {/* Magic Wand Trigger */}
            <button
                onClick={handleGenerateSubtasks}
                className="absolute top-2 right-2 p-1 text-gray-600 hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all"
                title="AI Breakdown"
            >
                {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            </button>
        </div>
    )
}
