import { createClient } from '@/lib/supabase/server'

interface AuditLogInput {
    taskId: string | null
    action: 'created' | 'updated' | 'deleted' | 'escalated' | 'focus_started' | 'archived' | 'status_changed'
    previousState?: Record<string, unknown>
    newState?: Record<string, unknown>
}

export async function logAudit(input: AuditLogInput) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('task_logs').insert({
        task_id: input.taskId,
        user_id: user.id,
        action: input.action,
        previous_state: input.previousState || null,
        new_state: input.newState || null,
    })

    if (error) {
        console.error('[Audit] Failed to log:', error.message)
    }
}

export async function getRecentLogs(taskId?: string, limit = 50) {
    const supabase = await createClient()

    let query = supabase
        .from('task_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (taskId) {
        query = query.eq('task_id', taskId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
}
