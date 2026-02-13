'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Task {
    id: string
    title: string
    priority: number
    status: string
    domain: string | null
    estimated_time: number
}

interface Props {
    task: Task
}

export function KanbanCard({ task }: Props) {
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

    const priorityColor = (p: number) => {
        if (p === 5) return 'bg-red-500/20 text-red-300 border-red-500/20'
        if (p >= 3) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/20'
        return 'bg-blue-500/20 text-blue-300 border-blue-500/20'
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="group relative bg-[#181822] p-4 rounded-xl border border-white/5 hover:border-white/20 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing mb-3"
        >
            <div className="flex items-start justify-between mb-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${priorityColor(task.priority)}`}>
                    P{task.priority}
                </span>
                {task.domain && (
                    <span className="text-[10px] text-gray-500 font-mono">@{task.domain}</span>
                )}
            </div>
            <p className="text-sm font-medium text-white mb-3 group-hover:text-purple-200 transition-colors">
                {task.title}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="bg-white/5 px-2 py-1 rounded-md">⏱ {task.estimated_time}m</span>
            </div>
        </div>
    )
}
