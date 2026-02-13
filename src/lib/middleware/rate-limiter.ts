import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RateLimitResult {
    allowed: boolean
    remaining: number
    resetAt: Date
}

const MAX_REQUESTS = 30
const WINDOW_MS = 60 * 1000 // 1 minute

export async function checkRateLimit(
    userId: string,
    endpoint: string
): Promise<RateLimitResult> {
    const supabase = await createClient()
    const now = new Date()
    const windowStart = new Date(now.getTime() - WINDOW_MS)

    // Try to get existing rate limit entry
    const { data: existing } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('user_id', userId)
        .eq('endpoint', endpoint)
        .single()

    if (!existing || new Date(existing.window_start) < windowStart) {
        // Reset window
        await supabase
            .from('rate_limits')
            .upsert({
                user_id: userId,
                endpoint,
                request_count: 1,
                window_start: now.toISOString(),
            }, { onConflict: 'user_id,endpoint' })

        return {
            allowed: true,
            remaining: MAX_REQUESTS - 1,
            resetAt: new Date(now.getTime() + WINDOW_MS),
        }
    }

    if (existing.request_count >= MAX_REQUESTS) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: new Date(new Date(existing.window_start).getTime() + WINDOW_MS),
        }
    }

    // Increment counter
    await supabase
        .from('rate_limits')
        .update({ request_count: existing.request_count + 1 })
        .eq('user_id', userId)
        .eq('endpoint', endpoint)

    return {
        allowed: true,
        remaining: MAX_REQUESTS - existing.request_count - 1,
        resetAt: new Date(new Date(existing.window_start).getTime() + WINDOW_MS),
    }
}

export function rateLimitResponse() {
    return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
    )
}
