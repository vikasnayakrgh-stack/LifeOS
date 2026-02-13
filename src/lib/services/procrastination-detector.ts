import { createClient } from '@/lib/supabase/server'

interface ProcrastinationAlert {
    taskId: string
    title: string
    delayCount: number
    suggestedMicroTask: string
}

export async function detectProcrastination(): Promise<ProcrastinationAlert[]> {
    const supabase = await createClient()

    const { data: delayedTasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'pending')
        .eq('is_deleted', false)
        .is('archived_at', null)
        .gte('delay_count', 2)
        .order('delay_count', { ascending: false })

    if (error) throw error
    if (!delayedTasks || delayedTasks.length === 0) return []

    const alerts: ProcrastinationAlert[] = []

    for (const task of delayedTasks) {
        const microTitle = `[Micro] ${task.title} — 15 min sprint`

        alerts.push({
            taskId: task.id,
            title: task.title,
            delayCount: task.delay_count,
            suggestedMicroTask: microTitle,
        })

        // Auto-create a micro-task
        await supabase.from('tasks').insert({
            user_id: task.user_id,
            title: microTitle,
            domain: task.domain,
            subdomain: task.subdomain,
            priority: Math.min(task.priority + 1, 5),
            impact_type: task.impact_type,
            energy_type: 'shallow',
            estimated_time: 15,
            due_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
            money_impact: task.money_impact,
        })
    }

    return alerts
}
