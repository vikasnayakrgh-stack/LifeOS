import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { selectTopTasks } from '@/lib/services/roi-scorer'
import { logAudit } from '@/lib/services/audit-logger'
import { checkRateLimit, rateLimitResponse } from '@/lib/middleware/rate-limiter'

export async function POST() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rl = await checkRateLimit(user.id, '/api/select-top-3')
    if (!rl.allowed) return rateLimitResponse()

    // Get user's impact weights
    const { data: settings } = await supabase
        .from('system_settings')
        .select('impact_weights')
        .eq('user_id', user.id)
        .single()

    const weights = settings?.impact_weights as Record<string, number> | undefined

    // Reset all focus_today flags
    await supabase
        .from('tasks')
        .update({ focus_today: false })
        .eq('focus_today', true)

    // Get pending tasks
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'pending')
        .eq('is_deleted', false)
        .is('archived_at', null)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const topTasks = selectTopTasks(tasks || [], 3, weights)

    // Mark top tasks as focus
    for (const task of topTasks) {
        await supabase
            .from('tasks')
            .update({ focus_today: true, version: task.version + 1 })
            .eq('id', task.id)
            .eq('version', task.version)

        await logAudit({
            taskId: task.id,
            action: 'focus_started',
            newState: { focus_today: true },
        })
    }

    return NextResponse.json({
        focusTasks: topTasks.map(t => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            impact_type: t.impact_type,
            estimated_time: t.estimated_time,
        })),
    })
}
