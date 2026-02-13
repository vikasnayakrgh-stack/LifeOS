import { createClient } from '@/lib/supabase/client'

export class BriefingService {
    static async generateMorningBriefing(chatId: number) {
        const supabase = createClient()

        // 1. Fetch Focus Tasks (or top priority if no focus)
        const { data: focusTasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('status', 'pending')
            .or('focus_today.eq.true,priority.eq.5')
            .limit(3)

        // 2. Fetch Overdue Count
        const today = new Date().toISOString().split('T')[0]
        const { count: overdueCount } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .lt('due_date', today)
            .eq('status', 'pending')

        // 3. Construct Message
        let message = `🌅 *Good Morning, Commander.*\n\n`

        if (focusTasks && focusTasks.length > 0) {
            message += `*🎯 Today's Top Focus:*\n`
            focusTasks.forEach((t, i) => {
                message += `${i + 1}. ${t.title} ${t.priority === 5 ? '🔥' : ''}\n`
            })
        } else {
            message += `*🎯 No focus tasks set.* Use /focus to set one!\n`
        }

        if (overdueCount && overdueCount > 0) {
            message += `\n⚠️ *You have ${overdueCount} overdue tasks.* Clear them out!\n`
        }

        const quotes = [
            "\"Discipline is freedom.\" - Jocko",
            "\"Action cures fear.\"",
            "\"Focus on the step in front of you.\"",
            "\"Execute.\""
        ]
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]

        message += `\n_${randomQuote}_`

        return message
    }
}
