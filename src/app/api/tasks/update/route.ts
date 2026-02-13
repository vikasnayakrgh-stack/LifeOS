import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/services/audit-logger'
import { checkRateLimit, rateLimitResponse } from '@/lib/middleware/rate-limiter'

export async function PATCH(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rl = await checkRateLimit(user.id, '/api/tasks/update')
    if (!rl.allowed) return rateLimitResponse()

    const body = await request.json()
    const { id, version, ...updates } = body

    if (!id || version === undefined) {
        return NextResponse.json({ error: 'id and version are required' }, { status: 400 })
    }

    // Fetch current state for audit log
    const { data: current } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single()

    if (!current) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

    // Optimistic locking
    const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, version: version + 1 })
        .eq('id', id)
        .eq('version', version)
        .eq('is_deleted', false)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) {
        return NextResponse.json(
            { error: 'Version conflict. Task was modified by another process.' },
            { status: 409 }
        )
    }

    await logAudit({
        taskId: id,
        action: 'updated',
        previousState: current,
        newState: data,
    })

    return NextResponse.json({ task: data })
}
