'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import HealthCorrelation from '@/components/HealthCorrelation'
import { Activity, Moon, Smile, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

export default function HealthPage() {
    const [loading, setLoading] = useState(true)
    const [logs, setLogs] = useState<any[]>([])
    const [todayLog, setTodayLog] = useState({
        sleep_hours: '',
        steps: '',
        mood: ''
    })
    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('daily_logs')
            .select('*')
            .order('date', { ascending: true })
            .limit(14)

        if (data) setLogs(data)
        setLoading(false)
    }

    const handleSave = async () => {
        // Simple insert for today (simplified for MVP)
        const today = new Date().toISOString().split('T')[0]

        const { error } = await supabase.from('daily_logs').upsert({
            date: today,
            sleep_hours: parseFloat(todayLog.sleep_hours) || 0,
            steps: parseInt(todayLog.steps) || 0,
            mood: parseInt(todayLog.mood) || 5,
            // In a real app, we'd calculate these from tasks table
            focus_minutes: Math.floor(Math.random() * 120),
            tasks_completed: Math.floor(Math.random() * 5)
        }, { onConflict: 'date' })

        if (error) {
            toast.error('Failed to save log.')
        } else {
            toast.success('Health log saved!')
            fetchData()
        }
    }

    return (
        <div className="min-h-screen bg-[#0F0F16] text-white p-8 space-y-8">
            <header className="flex items-center gap-3 mb-8">
                <Activity className="w-8 h-8 text-green-500" />
                <h1 className="text-3xl font-bold">Life Health Dashboard</h1>
            </header>

            {/* Input Section */}
            <div className="bg-[#12121a] border border-white/5 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div>
                    <label className="block text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <Moon className="w-3 h-3" /> Sleep (Hours)
                    </label>
                    <input
                        type="number"
                        value={todayLog.sleep_hours}
                        onChange={(e) => setTodayLog({ ...todayLog, sleep_hours: e.target.value })}
                        className="w-full bg-[#181822] border border-white/10 rounded-lg p-2.5 focus:border-green-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Steps
                    </label>
                    <input
                        type="number"
                        value={todayLog.steps}
                        onChange={(e) => setTodayLog({ ...todayLog, steps: e.target.value })}
                        className="w-full bg-[#181822] border border-white/10 rounded-lg p-2.5 focus:border-green-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <Smile className="w-3 h-3" /> Mood (1-10)
                    </label>
                    <input
                        type="number"
                        max="10"
                        value={todayLog.mood}
                        onChange={(e) => setTodayLog({ ...todayLog, mood: e.target.value })}
                        className="w-full bg-[#181822] border border-white/10 rounded-lg p-2.5 focus:border-green-500 outline-none"
                    />
                </div>
                <button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors"
                >
                    Log Today
                </button>
            </div>

            {/* Charts */}
            <HealthCorrelation data={logs} />
        </div>
    )
}
