import { createClient } from '@/lib/supabase/server'

export interface WeeklyAnalysis {
    period: { start: string; end: string }
    executionRatio: number
    tasksCreated: number
    tasksCompleted: number
    mostDelayedSubdomain: string | null
    highestROIMissed: { title: string; impact: string; delay: number } | null
    busyWorkPercent: number
    revenueCompletionPercent: number
    deepWorkMinutes: number
    topInsight: string
}

export async function generateWeeklyAnalysis(): Promise<WeeklyAnalysis> {
    const supabase = await createClient()
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // All tasks from last 7 days
    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .gte('created_at', weekAgo.toISOString())
        .eq('is_deleted', false)

    if (!tasks || tasks.length === 0) {
        return {
            period: { start: weekAgo.toISOString(), end: now.toISOString() },
            executionRatio: 0,
            tasksCreated: 0,
            tasksCompleted: 0,
            mostDelayedSubdomain: null,
            highestROIMissed: null,
            busyWorkPercent: 0,
            revenueCompletionPercent: 0,
            deepWorkMinutes: 0,
            topInsight: 'No tasks found this week. Start creating tasks to see insights!',
        }
    }

    const created = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const executionRatio = created > 0 ? completed / created : 0

    // Most delayed subdomain
    const delayMap: Record<string, number> = {}
    tasks.filter(t => t.delay_count > 0).forEach(t => {
        const key = t.subdomain || 'Uncategorized'
        delayMap[key] = (delayMap[key] || 0) + t.delay_count
    })
    const mostDelayed = Object.entries(delayMap).sort((a, b) => b[1] - a[1])[0]

    // Highest ROI missed (overdue + high impact)
    const missedTasks = tasks
        .filter(t => t.status !== 'completed' && t.delay_count > 0)
        .sort((a, b) => {
            const weights: Record<string, number> = { revenue: 5, growth: 3, maintenance: 2, vanity: 1 }
            const scoreA = (weights[a.impact_type] || 1) * a.priority
            const scoreB = (weights[b.impact_type] || 1) * b.priority
            return scoreB - scoreA
        })
    const topMissed = missedTasks[0]

    // Vanity/busy work %
    const vanityTasks = tasks.filter(t => t.impact_type === 'vanity')
    const busyWorkPercent = tasks.length > 0 ? vanityTasks.length / tasks.length : 0

    // Revenue completion
    const revenueTasks = tasks.filter(t => t.impact_type === 'revenue')
    const revenueCompleted = revenueTasks.filter(t => t.status === 'completed').length
    const revenueCompletionPercent = revenueTasks.length > 0 ? revenueCompleted / revenueTasks.length : 0

    // Deep work minutes
    const deepWorkMinutes = tasks
        .filter(t => t.energy_type === 'deep' && t.status === 'completed')
        .reduce((acc, t) => acc + (t.estimated_time || 0), 0)

    // Generate insight
    let topInsight = ''
    if (executionRatio < 0.3) {
        topInsight = '⚠️ Execution ratio is critically low. Focus on completing existing tasks before adding new ones.'
    } else if (busyWorkPercent > 0.4) {
        topInsight = '🔴 Over 40% of your tasks are vanity/busy work. Redirect energy to revenue tasks.'
    } else if (revenueCompletionPercent < 0.5) {
        topInsight = '💰 Revenue task completion is below 50%. Prioritize money-making activities.'
    } else if (executionRatio > 0.7) {
        topInsight = '🟢 Strong execution this week! Consider increasing task complexity.'
    } else {
        topInsight = '📊 Steady progress. Keep focusing on high-ROI tasks.'
    }

    return {
        period: { start: weekAgo.toISOString(), end: now.toISOString() },
        executionRatio: Math.round(executionRatio * 10000) / 10000,
        tasksCreated: created,
        tasksCompleted: completed,
        mostDelayedSubdomain: mostDelayed ? mostDelayed[0] : null,
        highestROIMissed: topMissed
            ? { title: topMissed.title, impact: topMissed.impact_type, delay: topMissed.delay_count }
            : null,
        busyWorkPercent: Math.round(busyWorkPercent * 10000) / 10000,
        revenueCompletionPercent: Math.round(revenueCompletionPercent * 10000) / 10000,
        deepWorkMinutes,
        topInsight,
    }
}
