'use client'

import { useEffect, useState } from 'react'

interface Analysis {
    executionRatio: number
    tasksCreated: number
    tasksCompleted: number
    mostDelayedSubdomain: string | null
    highestROIMissed: { title: string; impact: string; delay: number } | null
    busyWorkPercent: number
    revenueCompletionPercent: number
    deepWorkMinutes: number
    topInsight: string
}

export default function WeeklyAnalysis() {
    const [analysis, setAnalysis] = useState<Analysis | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/weekly-analysis')
            .then(r => r.json())
            .then(data => {
                setAnalysis(data.analysis)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="bg-[#12121a] border border-white/5 rounded-2xl p-6">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 w-32 bg-white/10 rounded" />
                    <div className="h-20 bg-white/5 rounded-xl" />
                </div>
            </div>
        )
    }

    if (!analysis) return null

    return (
        <div className="bg-[#12121a] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">
                    Weekly Intelligence
                </h3>
            </div>

            {/* Top Insight */}
            <div className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <p className="text-sm text-amber-300 font-medium">{analysis.topInsight}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-xs text-gray-500 mb-1">Execution</p>
                    <p className="text-lg font-bold text-white">{analysis.executionRatio}%</p>
                    <p className="text-xs text-gray-600">{analysis.tasksCompleted}/{analysis.tasksCreated}</p>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-xs text-gray-500 mb-1">Revenue Done</p>
                    <p className="text-lg font-bold text-cyan-400">{analysis.revenueCompletionPercent}%</p>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-xs text-gray-500 mb-1">Busy Work</p>
                    <p className={`text-lg font-bold ${analysis.busyWorkPercent > 30 ? 'text-red-400' : 'text-gray-300'}`}>
                        {analysis.busyWorkPercent}%
                    </p>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-xs text-gray-500 mb-1">Deep Work</p>
                    <p className="text-lg font-bold text-purple-400">{Math.round(analysis.deepWorkMinutes / 60)}h</p>
                    <p className="text-xs text-gray-600">{analysis.deepWorkMinutes}m this week</p>
                </div>
            </div>

            {/* Delayed subdomain + missed ROI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {analysis.mostDelayedSubdomain && (
                    <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                        <p className="text-xs text-gray-500 mb-1">Most Delayed Area</p>
                        <p className="text-sm font-semibold text-red-400">{analysis.mostDelayedSubdomain}</p>
                    </div>
                )}

                {analysis.highestROIMissed && (
                    <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                        <p className="text-xs text-gray-500 mb-1">Highest ROI Missed</p>
                        <p className="text-sm font-semibold text-orange-400">{analysis.highestROIMissed.title}</p>
                        <p className="text-xs text-gray-600">{analysis.highestROIMissed.impact} · delayed {analysis.highestROIMissed.delay}x</p>
                    </div>
                )}
            </div>
        </div>
    )
}
