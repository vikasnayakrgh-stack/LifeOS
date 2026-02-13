import { getBot } from '@/lib/telegram/bot'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export class NotificationService {
    private bot = getBot()

    async send(userId: string, message: string) {
        try {
            // Get chat ID
            const { data: settings } = await supabase
                .from('user_settings')
                .select('telegram_chat_id')
                .eq('user_id', userId)
                .single()

            if (!settings?.telegram_chat_id) {
                console.warn(`No Telegram linked for user ${userId}. Logging instead: ${message}`)
                return false
            }

            await this.bot.telegram.sendMessage(settings.telegram_chat_id, message, { parse_mode: 'Markdown' })
            return true
        } catch (error) {
            console.error('Failed to send notification:', error)
            return false
        }
    }

    async broadcast(message: string) {
        // Admin function to broadcast to all users (future use)
    }
}

export const notifier = new NotificationService()
