import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/services/audit-logger'
import { checkRateLimit, rateLimitResponse } from '@/lib/middleware/rate-limiter'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rl = await checkRateLimit(user.id, '/api/tasks/delete')
    if (!rl.allowed) return rateLimitResponse()

    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'Task id required' }, { status: 400 })

    // Fetch current state
    const { data: current } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single()

    if (!current) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

    // Soft delete
    const { data, error } = await supabase
        .from('tasks')
        .update({ is_deleted: true })
        .eq('id', id)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({
        taskId: id,
        action: 'deleted',
        previousState: current,
        newState: data,
    })

    return NextResponse.json({ success: true })
}
