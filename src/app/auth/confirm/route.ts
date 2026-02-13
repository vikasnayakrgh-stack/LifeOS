import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = '/dashboard'

    const redirectTo = request.nextUrl.clone()
    redirectTo.pathname = next
    redirectTo.searchParams.delete('token_hash')
    redirectTo.searchParams.delete('type')

    if (token_hash && type) {
        const supabase = await createClient()
        const { error } = await supabase.auth.verifyOtp({ type, token_hash })

        if (!error) {
            // Create default system settings on first login
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase.from('system_settings').upsert(
                    { user_id: user.id },
                    { onConflict: 'user_id' }
                )
            }
            return NextResponse.redirect(redirectTo)
        }
    }

    redirectTo.pathname = '/login'
    redirectTo.searchParams.set('error', 'Invalid or expired confirmation link')
    return NextResponse.redirect(redirectTo)
}
