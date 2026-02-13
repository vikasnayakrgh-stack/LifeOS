import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyCronSecret, unauthorizedResponse } from '@/lib/middleware/cron-auth'

// UTC schedule: "*/5 * * * *" = every 5 minutes
// Worker picks pending jobs with atomic locking to prevent race conditions
export async function POST(request: Request) {
    if (!verifyCronSecret(request)) return unauthorizedResponse()

    const supabase = await createClient()
    const results: { job_type: string; status: string; error?: string }[] = []

    // Atomic job pickup: UPDATE...WHERE status='pending' RETURNING *
    // This prevents two workers from picking the same job
    const { data: jobs, error: fetchError } = await supabase.rpc('pick_pending_jobs', { batch_size: 5 })

    // If RPC doesn't exist, fallback to direct query
    let jobsToProcess = jobs
    if (fetchError || !jobs) {
        const { data: fallbackJobs } = await supabase
            .from('jobs')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: true })
            .limit(5)

        if (fallbackJobs && fallbackJobs.length > 0) {
            // Atomically lock each job
            jobsToProcess = []
            for (const job of fallbackJobs) {
                const { data: locked } = await supabase
                    .from('jobs')
                    .update({ status: 'processing' })
                    .eq('id', job.id)
                    .eq('status', 'pending') // Atomic: only succeeds if still pending
                    .select()
                    .single()

                if (locked) jobsToProcess.push(locked)
            }
        }
    }

    if (!jobsToProcess || jobsToProcess.length === 0) {
        return NextResponse.json({ message: 'No pending jobs', processed: 0 })
    }

    for (const job of jobsToProcess) {
        try {
            switch (job.job_type) {
                case 'daily_generator': {
                    // Get all users and generate tasks for each
                    const { data: users } = await supabase.auth.admin.listUsers()
                    if (users?.users) {
                        for (const user of users.users) {
                            const dayOfWeek = new Date().getDay()
                            const today = new Date().toISOString().split('T')[0]

                            const weekdayTasks = [
                                { title: 'Deep Work Block (9 AM - 12 PM)', domain: 'Productivity', subdomain: 'Deep Work', priority: 5, impact_type: 'revenue' as const, energy_type: 'deep' as const, estimated_time: 180, due_date: `${today}T06:30:00.000Z` },
                                { title: 'Sales Block (2 PM - 4 PM)', domain: 'Business', subdomain: 'Sales', priority: 5, impact_type: 'revenue' as const, energy_type: 'deep' as const, estimated_time: 120, due_date: `${today}T10:30:00.000Z` },
                                { title: 'Content Creation (5 PM - 7 PM)', domain: 'Marketing', subdomain: 'Content', priority: 4, impact_type: 'growth' as const, energy_type: 'shallow' as const, estimated_time: 120, due_date: `${today}T13:30:00.000Z` },
                                { title: 'Email & Communication Triage', domain: 'Operations', subdomain: 'Admin', priority: 2, impact_type: 'maintenance' as const, energy_type: 'shallow' as const, estimated_time: 30, due_date: `${today}T04:30:00.000Z` },
                            ]
                            const sundayTasks = [
                                { title: 'Weekly Review & Planning', domain: 'Productivity', subdomain: 'Review', priority: 5, impact_type: 'growth' as const, energy_type: 'deep' as const, estimated_time: 90, due_date: `${today}T06:30:00.000Z` },
                                { title: 'Finance Review', domain: 'Finance', subdomain: 'Review', priority: 4, impact_type: 'revenue' as const, energy_type: 'deep' as const, estimated_time: 60, due_date: `${today}T08:30:00.000Z` },
                                { title: 'Next Week Goal Setting', domain: 'Productivity', subdomain: 'Planning', priority: 4, impact_type: 'growth' as const, energy_type: 'shallow' as const, estimated_time: 45, due_date: `${today}T09:30:00.000Z` },
                            ]

                            const tasksArr = dayOfWeek === 0 ? sundayTasks : weekdayTasks
                            await supabase.from('tasks').insert(
                                tasksArr.map(t => ({ ...t, user_id: user.id, status: 'pending' as const, money_impact: t.impact_type === 'revenue' }))
                            )
                        }
                    }
                    break
                }

                case 'reminder': {
                    // Process overdue tasks
                    const now = new Date().toISOString()
                    const { data: overdueTasks } = await supabase
                        .from('tasks')
                        .select('*')
                        .eq('status', 'pending')
                        .eq('is_deleted', false)
                        .is('archived_at', null)
                        .lt('due_date', now)

                    if (overdueTasks) {
                        for (const task of overdueTasks) {
                            await supabase
                                .from('tasks')
                                .update({
                                    reminder_level: task.reminder_level + 1,
                                    delay_count: task.delay_count + 1,
                                    version: task.version + 1,
                                })
                                .eq('id', task.id)
                                .eq('version', task.version) // optimistic lock

                            // Auto-create micro-task for frequently delayed
                            if (task.delay_count >= 2) {
                                await supabase.from('tasks').insert({
                                    user_id: task.user_id,
                                    title: `[Micro] ${task.title} — 15 min sprint`,
                                    domain: task.domain,
                                    subdomain: task.subdomain,
                                    priority: Math.min(task.priority + 1, 5),
                                    impact_type: task.impact_type,
                                    energy_type: 'shallow',
                                    estimated_time: 15,
                                    due_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                                    money_impact: task.money_impact,
                                })
                            }
                        }
                    }
                    break
                }

                case 'archive': {
                    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
                    await supabase
                        .from('tasks')
                        .update({ archived_at: new Date().toISOString() })
                        .eq('status', 'completed')
                        .eq('is_deleted', false)
                        .is('archived_at', null)
                        .lt('updated_at', thirtyDaysAgo)
                    break
                }

                default:
                    console.warn(`Unknown job type: ${job.job_type}`)
            }

            // Mark job as completed
            await supabase
                .from('jobs')
                .update({ status: 'completed', processed_at: new Date().toISOString() })
                .eq('id', job.id)

            results.push({ job_type: job.job_type, status: 'completed' })
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error'
            await supabase
                .from('jobs')
                .update({ status: 'failed', error: errMsg, processed_at: new Date().toISOString() })
                .eq('id', job.id)

            results.push({ job_type: job.job_type, status: 'failed', error: errMsg })
        }
    }

    return NextResponse.json({ processed: results.length, results })
}
