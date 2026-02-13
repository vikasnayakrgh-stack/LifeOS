'use client'

interface MetricsProps {
    metrics: {
        executionRatio: number
        revenueCompletion: number
        vanityPercent: number
        overduePercent: number
        totalTasks: number
        completedTasks: number
        deepWorkMinutes: number
    }
}

export default function MetricsWidget({ metrics }: MetricsProps) {
    const cards = [
        {
            label: 'Execution Ratio',
            value: `${metrics.executionRatio}%`,
            sub: `${metrics.completedTasks}/${metrics.totalTasks} tasks`,
            color: metrics.executionRatio >= 70 ? 'from-green-500 to-emerald-500' : metrics.executionRatio >= 40 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-rose-500',
            bgColor: metrics.executionRatio >= 70 ? 'bg-green-500/5 border-green-500/10' : metrics.executionRatio >= 40 ? 'bg-yellow-500/5 border-yellow-500/10' : 'bg-red-500/5 border-red-500/10',
        },
        {
            label: 'Revenue Completion',
            value: `${metrics.revenueCompletion}%`,
            sub: 'of revenue tasks done',
            color: 'from-cyan-500 to-blue-500',
            bgColor: 'bg-cyan-500/5 border-cyan-500/10',
        },
        {
            label: 'Vanity / Busy Work',
            value: `${metrics.vanityPercent}%`,
            sub: metrics.vanityPercent > 30 ? '⚠️ Too high!' : 'Under control',
            color: metrics.vanityPercent > 30 ? 'from-orange-500 to-red-500' : 'from-gray-500 to-slate-500',
            bgColor: metrics.vanityPercent > 30 ? 'bg-orange-500/5 border-orange-500/10' : 'bg-gray-500/5 border-gray-500/10',
        },
        {
            label: 'Deep Work',
            value: `${Math.round(metrics.deepWorkMinutes / 60)}h`,
            sub: `${metrics.deepWorkMinutes} minutes total`,
            color: 'from-purple-500 to-violet-500',
            bgColor: 'bg-purple-500/5 border-purple-500/10',
        },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className={`relative overflow-hidden rounded-2xl border p-5 ${card.bgColor} transition-all hover:scale-[1.02]`}
                >
                    <div className="relative z-10">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">{card.label}</p>
                        <p className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                            {card.value}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
                    </div>
                    {/* Subtle glow */}
                    <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-r ${card.color} opacity-10 blur-2xl`} />
                </div>
            ))}
        </div>
    )
}
