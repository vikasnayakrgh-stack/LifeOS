import { differenceInDays } from 'date-fns'
import { Flame } from 'lucide-react'

interface TaskWithResistance {
    created_at?: string
    reschedule_count?: number
}

export function useResistance(task: TaskWithResistance) {
    if (!task.created_at) return { score: 0, level: 'none', color: '', Icon: null }

    const daysOld = differenceInDays(new Date(), new Date(task.created_at))
    const reschedules = task.reschedule_count || 0

    // Formula: Age + (Reschedules * 2)
    const score = daysOld + (reschedules * 2)

    if (score > 14) {
        return {
            score,
            level: 'critical',
            color: 'text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]',
            Icon: Flame
        }
    }

    if (score > 7) {
        return {
            score,
            level: 'high',
            color: 'text-orange-500',
            Icon: Flame
        }
    }

    if (score > 3) {
        return {
            score,
            level: 'medium',
            color: 'text-yellow-500/80',
            Icon: Flame
        }
    }

    return { score, level: 'none', color: '', Icon: null }
}
