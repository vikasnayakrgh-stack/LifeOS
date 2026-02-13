'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/login?error=' + encodeURIComponent(error.message))
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        redirect('/login?error=' + encodeURIComponent(error.message))
    }

    // Create default system settings for new user
    revalidatePath('/', 'layout')
    redirect('/login?message=' + encodeURIComponent('Check your email to confirm your account'))
}

const GUEST_EMAIL = 'guest@lifeos.app'
const GUEST_PASSWORD = 'guest123456'

export async function guestLogin() {
    const supabase = await createClient()

    // Try to sign in first
    const { error: loginError } = await supabase.auth.signInWithPassword({
        email: GUEST_EMAIL,
        password: GUEST_PASSWORD,
    })

    if (!loginError) {
        revalidatePath('/', 'layout')
        redirect('/dashboard')
    }

    // If login failed, create guest account (auto-confirm)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: GUEST_EMAIL,
        password: GUEST_PASSWORD,
        options: {
            data: { display_name: 'Guest User' },
        },
    })

    if (signUpError) {
        redirect('/login?error=' + encodeURIComponent(signUpError.message))
    }

    // If email confirmation is required, try signing in anyway (some projects auto-confirm)
    if (signUpData.user && !signUpData.session) {
        const { error: retryError } = await supabase.auth.signInWithPassword({
            email: GUEST_EMAIL,
            password: GUEST_PASSWORD,
        })
        if (retryError) {
            redirect('/login?error=' + encodeURIComponent('Guest account created but needs email confirmation. Please try signing in manually.'))
        }
    }

    // Seed demo tasks for guest via internal API
    try {
        const userId = signUpData?.user?.id || ''
        await fetch(new URL('/api/guest-seed', process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        })
    } catch {
        // Seeding is best-effort, don't block login
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
