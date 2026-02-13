import { createClient } from '@/lib/supabase/server'

interface DailyTask {
    title: string
    domain: string
    subdomain: string
    priority: number
    impact_type: 'revenue' | 'growth' | 'maintenance' | 'vanity'
    energy_type: 'deep' | 'shallow'
    estimated_time: number
    due_date: string
}

function getTodayISO(): string {
    return new Date().toISOString().split('T')[0]
}

function getWeekdayTasks(): DailyTask[] {
    const today = getTodayISO()
    return [
        {
            title: 'Deep Work Block (9 AM - 12 PM)',
            domain: 'Productivity',
            subdomain: 'Deep Work',
            priority: 5,
            impact_type: 'revenue',
            energy_type: 'deep',
            estimated_time: 180,
            due_date: `${today}T12:00:00.000Z`,
        },
        {
            title: 'Sales Block (2 PM - 4 PM)',
            domain: 'Business',
            subdomain: 'Sales',
            priority: 5,
            impact_type: 'revenue',
            energy_type: 'deep',
            estimated_time: 120,
            due_date: `${today}T16:00:00.000Z`,
        },
        {
            title: 'Content Creation Block (5 PM - 7 PM)',
            domain: 'Marketing',
            subdomain: 'Content',
            priority: 4,
            impact_type: 'growth',
            energy_type: 'shallow',
            estimated_time: 120,
            due_date: `${today}T19:00:00.000Z`,
        },
        {
            title: 'Email & Communication Triage',
            domain: 'Operations',
            subdomain: 'Admin',
            priority: 2,
            impact_type: 'maintenance',
            energy_type: 'shallow',
            estimated_time: 30,
            due_date: `${today}T10:00:00.000Z`,
        },
    ]
}

function getSundayTasks(): DailyTask[] {
    const today = getTodayISO()
    return [
        {
            title: 'Weekly Review & Planning',
            domain: 'Productivity',
            subdomain: 'Review',
            priority: 5,
            impact_type: 'growth',
            energy_type: 'deep',
            estimated_time: 90,
            due_date: `${today}T12:00:00.000Z`,
        },
        {
            title: 'Finance Review & Reconciliation',
            domain: 'Finance',
            subdomain: 'Review',
            priority: 4,
            impact_type: 'revenue',
            energy_type: 'deep',
            estimated_time: 60,
            due_date: `${today}T14:00:00.000Z`,
        },
        {
            title: 'Next Week Goal Setting',
            domain: 'Productivity',
            subdomain: 'Planning',
            priority: 4,
            impact_type: 'growth',
            energy_type: 'shallow',
            estimated_time: 45,
            due_date: `${today}T15:00:00.000Z`,
        },
    ]
}

export async function generateDailyTasks(userId: string) {
    const supabase = await createClient()
    const dayOfWeek = new Date().getDay() // 0 = Sunday

    const tasks = dayOfWeek === 0 ? getSundayTasks() : getWeekdayTasks()

    const tasksWithUser = tasks.map(task => ({
        ...task,
        user_id: userId,
        status: 'pending' as const,
        money_impact: task.impact_type === 'revenue',
    }))

    const { data, error } = await supabase
        .from('tasks')
        .insert(tasksWithUser)
        .select()

    if (error) throw error
    return data
}
