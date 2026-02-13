'use client'

import { useState, useCallback, useEffect } from 'react'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { toast } from 'sonner'

interface Task {
    id: string
    title: string
    priority: number
    status: string
    domain: string | null
    estimated_time: number
}

interface Props {
    initialTasks: Task[]
}

export default function KanbanBoard({ initialTasks }: Props) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [activeId, setActiveId] = useState<string | null>(null)

    // Update local state when initialTasks change (e.g. from server refresh)
    useEffect(() => {
        setTasks(initialTasks)
    }, [initialTasks])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const columns = [
        { id: 'pending', title: 'Pending' },
        { id: 'in_progress', title: 'In Progress' },
        { id: 'completed', title: 'Completed' },
    ]

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        // Find the task
        const task = tasks.find(t => t.id === activeId)
        if (!task) return

        // Determine new status
        // If dropped on a column, overId is the column id
        // If dropped on a card, find that card's column
        let newStatus = overId

        // Check if overId is a task id
        const overTask = tasks.find(t => t.id === overId)
        if (overTask) {
            newStatus = overTask.status
        }

        // If status hasn't changed, we might just be reordering (not implemented yet)
        if (task.status === newStatus) {
            setActiveId(null)
            return
        }

        // Optimistic update
        setTasks(prev => prev.map(t =>
            t.id === activeId ? { ...t, status: newStatus } : t
        ))

        setActiveId(null)

        // API call
        try {
            await fetch('/api/tasks/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: activeId, status: newStatus }),
            })
            toast.success('Task status updated')
        } catch (error) {
            console.error('Failed to update task status:', error)
            toast.error('Failed to update task status')
            // Revert on error
            setTasks(initialTasks)
        }
    }

    const getTasksByStatus = (status: string) => {
        return tasks.filter(task => task.status === status)
    }

    const activeTask = tasks.find(t => t.id === activeId)

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-6 h-[calc(100vh-200px)] overflow-x-auto pb-4">
                {columns.map(col => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        tasks={getTasksByStatus(col.id)}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeTask ? <KanbanCard task={activeTask} /> : null}
            </DragOverlay>
        </DndContext>
    )
}
