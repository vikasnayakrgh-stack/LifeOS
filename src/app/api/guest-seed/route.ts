import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This uses the service role to seed guest tasks — NOT exposed to users
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

const DEMO_TASKS = [
    {
        title: 'Close deal with Acme Corp — ₹2.5L proposal',
        priority: 5,
        impact_type: 'revenue',
        energy_type: 'deep',
        estimated_time: 45,
        domain: 'Business',
        subdomain: 'Sales',
        money_impact: true,
        status: 'pending',
        focus_today: true,
    },
    {
        title: 'Follow up on 3 warm leads from LinkedIn',
        priority: 4,
        impact_type: 'revenue',
        energy_type: 'shallow',
        estimated_time: 20,
        domain: 'Business',
        subdomain: 'Sales',
        money_impact: true,
        status: 'pending',
        focus_today: true,
    },
    {
        title: 'Record YouTube video on automation tips',
        priority: 4,
        impact_type: 'growth',
        energy_type: 'deep',
        estimated_time: 90,
        domain: 'Content',
        subdomain: 'YouTube',
        money_impact: false,
        status: 'pending',
        focus_today: true,
    },
    {
        title: 'Review and approve freelancer invoices',
        priority: 3,
        impact_type: 'maintenance',
        energy_type: 'shallow',
        estimated_time: 15,
        domain: 'Operations',
        subdomain: 'Finance',
        money_impact: false,
        status: 'pending',
        focus_today: false,
    },
    {
        title: 'Update Instagram stories — behind the scenes',
        priority: 2,
        impact_type: 'vanity',
        energy_type: 'shallow',
        estimated_time: 20,
        domain: 'Content',
        subdomain: 'Social Media',
        money_impact: false,
        status: 'pending',
        focus_today: false,
    },
    {
        title: 'Write cold email sequence for SaaS founders',
        priority: 5,
        impact_type: 'revenue',
        energy_type: 'deep',
        estimated_time: 60,
        domain: 'Marketing',
        subdomain: 'Email',
        money_impact: true,
        status: 'pending',
        focus_today: false,
    },
    {
        title: 'Fix broken chatbot flow — demo failing',
        priority: 5,
        impact_type: 'revenue',
        energy_type: 'deep',
        estimated_time: 30,
        domain: 'Product',
        subdomain: 'Engineering',
        money_impact: true,
        status: 'completed',
        focus_today: false,
    },
    {
        title: 'Organize Google Drive folders',
        priority: 1,
        impact_type: 'vanity',
        energy_type: 'shallow',
        estimated_time: 25,
        domain: 'Operations',
        subdomain: 'Admin',
        money_impact: false,
        status: 'completed',
        focus_today: false,
    },
    {
        title: 'Prep deck for investor call Thursday',
        priority: 5,
        impact_type: 'revenue',
        energy_type: 'deep',
        estimated_time: 120,
        domain: 'Business',
        subdomain: 'Fundraising',
        money_impact: true,
        status: 'pending',
        focus_today: false,
        delay_count: 2,
    },
    {
        title: 'Weekly team standup meeting',
        priority: 3,
        impact_type: 'maintenance',
        energy_type: 'shallow',
        estimated_time: 30,
        domain: 'Operations',
        subdomain: 'Team',
        money_impact: false,
        status: 'completed',
        focus_today: false,
    },
]

export async function POST(request: Request) {
    try {
        const { userId } = await request.json()

        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 })
        }

        // Check if tasks already exist for this user
        const { data: existing } = await supabaseAdmin
            .from('tasks')
            .select('id')
            .eq('user_id', userId)
            .limit(1)

        if (existing && existing.length > 0) {
            return NextResponse.json({ message: 'Tasks already seeded', count: 0 })
        }

        // Insert demo tasks
        const tasksToInsert = DEMO_TASKS.map(task => ({
            ...task,
            user_id: userId,
            delay_count: task.delay_count || 0,
        }))

        const { error } = await supabaseAdmin
            .from('tasks')
            .insert(tasksToInsert)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Insert default system_settings
        await supabaseAdmin
            .from('system_settings')
            .upsert({
                user_id: userId,
                focus_duration: 90,
                reminder_interval: 60,
                impact_weights: { revenue: 4, growth: 3, maintenance: 2, vanity: 1 },
                deep_work_hours: { start: 9, end: 12 },
            }, { onConflict: 'user_id' })

        return NextResponse.json({ message: 'Demo tasks seeded', count: tasksToInsert.length })

    } catch (err) {
        return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
    }
}
