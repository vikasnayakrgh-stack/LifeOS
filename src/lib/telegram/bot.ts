import { Telegraf } from 'telegraf'

// Singleton instance to prevent multiple polls in dev
let botInstance: Telegraf | null = null

export const getBot = () => {
    if (botInstance) return botInstance

    const token = process.env.TELEGRAM_TOKEN
    if (!token) {
        throw new Error('TELEGRAM_TOKEN is not defined in environment variables')
    }

    botInstance = new Telegraf(token)

    // Graceful stop
    process.once('SIGINT', () => botInstance?.stop('SIGINT'))
    process.once('SIGTERM', () => botInstance?.stop('SIGTERM'))

    return botInstance
}
