import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_deleted', false)
        .is('archived_at', null)

    if (!tasks || tasks.length === 0) {
        return NextResponse.json({
            metrics: {
                executionRatio: 0,
                revenueCompletion: 0,
                vanityPercent: 0,
                overduePercent: 0,
                totalTasks: 0,
                completedTasks: 0,
                deepWorkMinutes: 0,
            },
        })
    }

    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const executionRatio = total > 0 ? completed / total : 0

    const revenueTasks = tasks.filter(t => t.impact_type === 'revenue')
    const revenueCompleted = revenueTasks.filter(t => t.status === 'completed').length
    const revenueCompletion = revenueTasks.length > 0 ? revenueCompleted / revenueTasks.length : 0

    const vanityTasks = tasks.filter(t => t.impact_type === 'vanity')
    const vanityPercent = total > 0 ? vanityTasks.length / total : 0

    const overdueTasks = tasks.filter(
        t => t.status === 'pending' && t.due_date && new Date(t.due_date) < new Date()
    )
    const overduePercent = total > 0 ? overdueTasks.length / total : 0

    const deepWorkMinutes = tasks
        .filter(t => t.energy_type === 'deep' && t.status === 'completed')
        .reduce((acc, t) => acc + (t.estimated_time || 0), 0)

    return NextResponse.json({
        metrics: {
            executionRatio: Math.round(executionRatio * 100),
            revenueCompletion: Math.round(revenueCompletion * 100),
            vanityPercent: Math.round(vanityPercent * 100),
            overduePercent: Math.round(overduePercent * 100),
            totalTasks: total,
            completedTasks: completed,
            deepWorkMinutes,
        },
    })
}
