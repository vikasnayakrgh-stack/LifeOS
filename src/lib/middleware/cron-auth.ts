import { NextResponse } from 'next/server'

export function verifyCronSecret(request: Request): boolean {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
        console.error('CRON_SECRET not configured')
        return false
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
        return false
    }

    return true
}

export function unauthorizedResponse() {
    return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
    )
}
