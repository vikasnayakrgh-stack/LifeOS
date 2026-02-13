import { createClient } from '@/lib/supabase/server'

interface ReminderResult {
    taskId: string
    title: string
    level: number
    action: 'soft' | 'strong' | 'critical' | 'immediate'
    message: string
}

export async function processReminders(): Promise<ReminderResult[]> {
    const supabase = await createClient()
    const now = new Date().toISOString()

    // Fetch overdue pending tasks
    const { data: overdueTasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'pending')
        .eq('is_deleted', false)
        .is('archived_at', null)
        .lt('due_date', now)
        .order('priority', { ascending: false })

    if (error) throw error
    if (!overdueTasks || overdueTasks.length === 0) return []

    const results: ReminderResult[] = []

    for (const task of overdueTasks) {
        let action: ReminderResult['action']
        let message: string

        // Priority 5 = immediate alert regardless of level
        if (task.priority === 5) {
            action = 'immediate'
            message = `🚨 CRITICAL: "${task.title}" is overdue and high priority!`
        } else if (task.reminder_level === 0) {
            action = 'soft'
            message = `📋 Reminder: "${task.title}" is past due.`
        } else if (task.reminder_level === 1) {
            action = 'strong'
            message = `⚠️ Strong reminder: "${task.title}" needs attention NOW.`
        } else {
            action = 'critical'
            message = `🔴 ESCALATION: "${task.title}" has been overdue for too long!`
        }

        results.push({
            taskId: task.id,
            title: task.title,
            level: task.reminder_level + 1,
            action,
            message,
        })

        // Increment reminder_level and delay_count
        await supabase
            .from('tasks')
            .update({
                reminder_level: task.reminder_level + 1,
                delay_count: task.delay_count + 1,
                version: task.version + 1,
            })
            .eq('id', task.id)
            .eq('version', task.version) // optimistic lock

        // Log to console (structured for future WhatsApp API)
        console.log(JSON.stringify({
            type: 'reminder',
            action,
            task_id: task.id,
            title: task.title,
            priority: task.priority,
            reminder_level: task.reminder_level + 1,
            delay_count: task.delay_count + 1,
            timestamp: new Date().toISOString(),
        }))
    }

    return results
}
