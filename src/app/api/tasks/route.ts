import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, rateLimitResponse } from '@/lib/middleware/rate-limiter'

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rl = await checkRateLimit(user.id, '/api/tasks')
    if (!rl.allowed) return rateLimitResponse()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const impact_type = searchParams.get('impact_type')
    const energy_type = searchParams.get('energy_type')
    const focus_today = searchParams.get('focus_today')

    let query = supabase
        .from('tasks')
        .select('*')
        .eq('is_deleted', false)
        .is('archived_at', null)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (impact_type) query = query.eq('impact_type', impact_type)
    if (energy_type) query = query.eq('energy_type', energy_type)
    if (focus_today === 'true') query = query.eq('focus_today', true)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ tasks: data })
}
