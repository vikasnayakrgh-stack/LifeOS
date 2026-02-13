'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FocusModeButton() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [active, setActive] = useState(false)
    const [endTime, setEndTime] = useState<string | null>(null)

    const handleStart = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/focus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })
            const data = await res.json()
            if (data.session) {
                setActive(true)
                setEndTime(new Date(data.session.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
                router.refresh()
            }
        } catch (err) {
            console.error('Focus mode error:', err)
        } finally {
            setLoading(false)
        }
    }

    if (active) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-xs text-purple-400 font-medium">Focus until {endTime}</span>
            </div>
        )
    }

    return (
        <button
            onClick={handleStart}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-sm font-medium transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 active:scale-[0.97] disabled:opacity-50"
        >
            {loading ? (
                <span className="animate-spin">⏳</span>
            ) : (
                <span>🧠</span>
            )}
            Start Focus Mode
        </button>
    )
}
