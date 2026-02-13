'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCard } from './KanbanCard'

interface Task {
    id: string
    title: string
    priority: number
    status: string
    domain: string | null
    estimated_time: number
}

interface Props {
    id: string
    title: string
    tasks: Task[]
    onTimerStop: (taskId: string, duration: number) => void
}

export function KanbanColumn({ id, title, tasks, onTimerStop }: Props) {
    const { setNodeRef } = useDroppable({ id })

    return (
        <div className="flex-1 min-w-[300px] bg-[#12121a] rounded-2xl p-4 border border-white/5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-semibold text-gray-400 text-sm">{title}</h3>
                <span className="text-xs bg-white/5 px-2 py-1 rounded text-gray-500">{tasks.length}</span>
            </div>

            <div ref={setNodeRef} className="flex-1 overflow-y-auto min-h-[150px] space-y-3">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <KanbanCard key={task.id} task={task} onTimerStop={onTimerStop} />
                    ))}
                </SortableContext>
                {tasks.length === 0 && (
                    <div className="h-full border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-gray-700 text-xs">
                        Drop items here
                    </div>
                )}
            </div>
        </div>
    )
}
