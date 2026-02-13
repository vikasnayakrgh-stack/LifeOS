import type { Task } from './task-service'

const DEFAULT_WEIGHTS: Record<string, number> = {
    revenue: 5,
    growth: 3,
    maintenance: 2,
    vanity: 1,
}

/**
 * Enhanced ROI Score = (impact_weight × priority) / max(estimated_time, 1)
 * Higher score = higher priority for daily selection
 */
export function calculateROI(
    task: Task,
    weights: Record<string, number> = DEFAULT_WEIGHTS
): number {
    const impactWeight = weights[task.impact_type] || 1
    const time = Math.max(task.estimated_time || 30, 1) // Prevent division by zero
    return (impactWeight * task.priority) / time
}

/**
 * Score and rank tasks, return top N
 */
export function selectTopTasks(
    tasks: Task[],
    count: number = 3,
    weights: Record<string, number> = DEFAULT_WEIGHTS
): Task[] {
    const scored = tasks
        .filter(t => t.status === 'pending' && !t.is_deleted && !t.archived_at)
        .map(task => ({
            task,
            score: calculateROI(task, weights),
        }))
        .sort((a, b) => b.score - a.score)

    return scored.slice(0, count).map(s => s.task)
}
