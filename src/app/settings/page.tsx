'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client' // Assuming standard client location
import { toast } from 'sonner'
import { Loader2, Check, Send } from 'lucide-react'

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null)
    const [telegramConnected, setTelegramConnected] = useState(false)
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                const { data } = await supabase
                    .from('user_settings')
                    .select('telegram_chat_id')
                    .eq('user_id', user.id)
                    .single()

                if (data?.telegram_chat_id) setTelegramConnected(true)
            }
            setLoading(false)
        }
        load()
    }, [])

    const handleConnect = () => {
        if (!user) return
        // Deep link to bot with user ID as start parameter
        // In prod, generate a secure random token instead of raw ID
        const botName = 'LifeOS_Bot' // Replace with actual bot name if known, or make dynamic
        const link = `https://t.me/LifeOS_Bot?start=${user.id}`
        window.open(link, '_blank')
    }

    if (loading) return <div className="p-8 text-white"><Loader2 className="animate-spin" /></div>

    return (
        <div className="p-8 max-w-4xl mx-auto text-white space-y-8">
            <h1 className="text-3xl font-bold">Settings</h1>

            <div className="bg-[#12121a] p-6 rounded-xl border border-white/10 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Send className="w-5 h-5 text-blue-400" />
                            Telegram Integration
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                            Receive notifications and manage tasks via Telegram.
                        </p>
                    </div>
                    {telegramConnected ? (
                        <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full text-sm font-medium">
                            <Check className="w-4 h-4" /> Connected
                        </div>
                    ) : (
                        <button
                            onClick={handleConnect}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Connect Telegram
                        </button>
                    )}
                </div>

                {telegramConnected && (
                    <div className="bg-white/5 p-4 rounded-lg text-sm text-gray-300">
                        <p>You can now use commands:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
                            <li><code>/task Buy milk tomorrow</code> - Create tasks</li>
                            <li><code>/focus 25</code> - Start focus session</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}
