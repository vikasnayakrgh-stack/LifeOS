import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/services/audit-logger'
import { checkRateLimit, rateLimitResponse } from '@/lib/middleware/rate-limiter'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rl = await checkRateLimit(user.id, '/api/focus')
    if (!rl.allowed) return rateLimitResponse()

    // Get user's focus duration from settings
    const { data: settings } = await supabase
        .from('system_settings')
        .select('focus_duration')
        .eq('user_id', user.id)
        .single()

    const focusDuration = settings?.focus_duration || 90
    const body = await request.json().catch(() => ({}))

    const startTime = new Date()
    const endTime = new Date(startTime.getTime() + focusDuration * 60 * 1000)

    // Create a focus session task
    const { data: task, error } = await supabase
        .from('tasks')
        .insert({
            user_id: user.id,
            title: body.title || `Deep Focus Session (${focusDuration} min)`,
            domain: body.domain || 'Productivity',
            subdomain: 'Focus',
            priority: 5,
            impact_type: 'revenue',
            energy_type: 'deep',
            estimated_time: focusDuration,
            due_date: endTime.toISOString(),
            focus_today: true,
            money_impact: true,
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({
        taskId: task.id,
        action: 'focus_started',
        newState: {
            focus_duration: focusDuration,
            start: startTime.toISOString(),
            end: endTime.toISOString(),
        },
    })

    return NextResponse.json({
        session: {
            taskId: task.id,
            focusDuration,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            status: 'active',
            message: `🧠 Focus mode activated. ${focusDuration} minutes of deep work started.`,
        },
    })
}
