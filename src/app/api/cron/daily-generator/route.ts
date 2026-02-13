import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyCronSecret, unauthorizedResponse } from '@/lib/middleware/cron-auth'

// UTC schedule: "0 0 * * *" = 00:00 UTC = 5:30 AM IST
export async function POST(request: Request) {
    if (!verifyCronSecret(request)) return unauthorizedResponse()

    const supabase = await createClient()

    // Push job to queue instead of executing directly
    const { error } = await supabase.from('jobs').insert({
        job_type: 'daily_generator',
        status: 'pending',
        payload: { triggered_at: new Date().toISOString() },
    })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Daily generator job queued' })
}
