import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_deleted', false)
        .gte('created_at', weekAgo.toISOString())

    if (!tasks || tasks.length === 0) {
        return NextResponse.json({
            analysis: {
                period: { start: weekAgo.toISOString(), end: now.toISOString() },
                executionRatio: 0,
                tasksCreated: 0,
                tasksCompleted: 0,
                mostDelayedSubdomain: null,
                highestROIMissed: null,
                busyWorkPercent: 0,
                revenueCompletionPercent: 0,
                deepWorkMinutes: 0,
                topInsight: 'No data this week. Create tasks to get behavioral insights.',
            },
        })
    }

    const created = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const executionRatio = created > 0 ? Math.round((completed / created) * 100) : 0

    // Most delayed subdomain
    const delayMap: Record<string, number> = {}
    tasks.filter(t => t.delay_count > 0).forEach(t => {
        const key = t.subdomain || 'Uncategorized'
        delayMap[key] = (delayMap[key] || 0) + t.delay_count
    })
    const mostDelayed = Object.entries(delayMap).sort((a, b) => b[1] - a[1])[0]

    // Highest missed ROI
    const weights: Record<string, number> = { revenue: 5, growth: 3, maintenance: 2, vanity: 1 }
    const missedTasks = tasks
        .filter(t => t.status !== 'completed' && t.delay_count > 0)
        .sort((a, b) => {
            const scoreA = (weights[a.impact_type] || 1) * a.priority
            const scoreB = (weights[b.impact_type] || 1) * b.priority
            return scoreB - scoreA
        })
    const topMissed = missedTasks[0]

    const vanityTasks = tasks.filter(t => t.impact_type === 'vanity')
    const busyWorkPercent = Math.round((vanityTasks.length / tasks.length) * 100)

    const revenueTasks = tasks.filter(t => t.impact_type === 'revenue')
    const revenueCompleted = revenueTasks.filter(t => t.status === 'completed').length
    const revenueCompletionPercent = revenueTasks.length > 0
        ? Math.round((revenueCompleted / revenueTasks.length) * 100)
        : 0

    const deepWorkMinutes = tasks
        .filter(t => t.energy_type === 'deep' && t.status === 'completed')
        .reduce((acc, t) => acc + (t.estimated_time || 0), 0)

    // Insight generation
    let topInsight = ''
    if (executionRatio < 30)
        topInsight = '⚠️ Execution ratio critically low. Complete existing tasks before adding new ones.'
    else if (busyWorkPercent > 40)
        topInsight = '🔴 Over 40% vanity/busy work. Redirect to revenue tasks.'
    else if (revenueCompletionPercent < 50)
        topInsight = '💰 Revenue completion below 50%. Focus on money-making activities.'
    else if (executionRatio > 70)
        topInsight = '🟢 Strong execution! Consider increasing task complexity.'
    else
        topInsight = '📊 Steady progress. Keep focusing on high-ROI tasks.'

    return NextResponse.json({
        analysis: {
            period: { start: weekAgo.toISOString(), end: now.toISOString() },
            executionRatio,
            tasksCreated: created,
            tasksCompleted: completed,
            mostDelayedSubdomain: mostDelayed ? mostDelayed[0] : null,
            highestROIMissed: topMissed
                ? { title: topMissed.title, impact: topMissed.impact_type, delay: topMissed.delay_count }
                : null,
            busyWorkPercent,
            revenueCompletionPercent,
            deepWorkMinutes,
            topInsight,
        },
    })
}
