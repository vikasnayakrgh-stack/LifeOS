import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/services/audit-logger'
import { checkRateLimit, rateLimitResponse } from '@/lib/middleware/rate-limiter'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rl = await checkRateLimit(user.id, '/api/tasks/create')
    if (!rl.allowed) return rateLimitResponse()

    const body = await request.json()

    const { data, error } = await supabase
        .from('tasks')
        .insert({
            user_id: user.id,
            title: body.title,
            domain: body.domain || null,
            subdomain: body.subdomain || null,
            priority: body.priority || 3,
            impact_type: body.impact_type || 'maintenance',
            energy_type: body.energy_type || 'shallow',
            estimated_time: body.estimated_time || 30,
            due_date: body.due_date || null,
            recurrence_type: body.recurrence_type || null,
            recurrence_rule: body.recurrence_rule || null,
            money_impact: body.money_impact || false,
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({
        taskId: data.id,
        action: 'created',
        newState: data,
    })

    return NextResponse.json({ task: data }, { status: 201 })
}
