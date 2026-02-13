import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyCronSecret, unauthorizedResponse } from '@/lib/middleware/cron-auth'

// UTC schedule: "*/30 * * * *" = every 30 minutes
export async function POST(request: Request) {
    if (!verifyCronSecret(request)) return unauthorizedResponse()

    const supabase = await createClient()

    const { error } = await supabase.from('jobs').insert({
        job_type: 'reminder',
        status: 'pending',
        payload: { triggered_at: new Date().toISOString() },
    })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Reminder job queued' })
}
