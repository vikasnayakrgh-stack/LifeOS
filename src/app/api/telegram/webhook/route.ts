import { NextRequest, NextResponse } from 'next/server'
import { getBot } from '@/lib/telegram/bot'
import { createClient } from '@supabase/supabase-js'
import { parseTaskInput } from '@/lib/os-parser'
import { BriefingService } from '@/lib/services/briefing'


// Initialize Supabase Admin client to verify users securely if needed
// For now we will rely on verification code or just basic command handling
// Note: In a real app, use SERVICE_RJLE_KEY for admin tasks like finding user by ID without RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const bot = getBot()

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        // Handle Telegram updates via Telegraf
        await bot.handleUpdate(body)

        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('Error handling Telegram update:', error)
        return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 })
    }
}

// Ensure bot commands are registered (doing this here is a bit hacky but works for serverless)
// Better place would be a separate script or on deployment
bot.start(async (ctx) => {
    const payload = ctx.message.text.split(' ')[1] // /start <token>

    if (payload) {
        // Linking Flow
        // 1. Verify token in DB (we need to implement this part)
        // 2. If valid, update user_settings with chat_id

        /* 
           Simulated Logic for now:
           Pass the user's UUID as the token for direct linking (in dev).
           In prod, use a short-lived random code mapped to UUID.
        */
        const userId = payload

        const { error } = await supabase
            .from('user_settings')
            .upsert({
                user_id: userId,
                telegram_chat_id: ctx.chat.id,
                telegram_username: ctx.from.username,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })

        if (error) {
            console.error('Linking error:', error)
            return ctx.reply('❌ Failed to link account. Invalid token or server error.')
        }

        return ctx.reply(`✅ Account linked successfully! Welcome, ${ctx.from.first_name}.`)
    }

    return ctx.reply('👋 Welcome to Life OS! Please use the link from your Settings page to connect.')
})

bot.command('task', async (ctx) => {
    const text = ctx.message.text.replace('/task', '').trim()
    if (!text) return ctx.reply('⚠️ Usage: /task My new task tomorrow #work')

    // Parse
    const parsed = parseTaskInput(text)

    // Identify User
    const { data: settings } = await supabase
        .from('user_settings')
        .select('user_id')
        .eq('telegram_chat_id', ctx.chat.id)
        .single()

    if (!settings) return ctx.reply('⚠️ Account not linked! Go to Settings to connect.')

    // Create Task
    const { error } = await supabase
        .from('tasks')
        .insert({
            user_id: settings.user_id,
            title: parsed.title,
            domain: parsed.domain,
            priority: parsed.priority || 3,
            due_date: parsed.due_date,
            status: 'pending',
            estimated_time: 30
        })

    if (error) {
        console.error('Task creation error:', error)
        return ctx.reply('❌ Failed to create task.')
    }

    return ctx.reply(`✅ Task Created:\n**${parsed.title}**\n📅 ${parsed.due_date ? new Date(parsed.due_date).toLocaleString() : 'No date'}`)
})

bot.command('focus', (ctx) => {
    const minutes = parseInt(ctx.message.text.split(' ')[1]) || 25
    ctx.reply(`🧘 Focus Mode started for ${minutes} minutes! DO NOT DISTURB.`)
    // Here we would trigger the focus timer logic if we had a realtime connection
})

bot.command('morning', async (ctx) => {
    try {
        const briefing = await BriefingService.generateMorningBriefing(ctx.chat.id)
        return ctx.replyWithMarkdown(briefing)
    } catch (error) {
        console.error('Briefing error:', error)
        return ctx.reply('❌ Failed to generate briefing.')
    }
})

