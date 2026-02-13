'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface Props {
    data: any[]
}

export default function HealthCorrelation({ data }: Props) {
    if (!data || data.length === 0) {
        return <div className="text-gray-500 text-center py-8">No data yet. Log your health for a few days!</div>
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sleep vs Focus */}
            <div className="bg-[#181822] border border-white/5 p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    😴 Sleep vs 🧠 Focus
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" stroke="#666" fontSize={12} tickFormatter={(val) => val.slice(5)} />
                            <YAxis yAxisId="left" stroke="#8884d8" />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                            <Tooltip contentStyle={{ backgroundColor: '#0F0F16', borderColor: '#333' }} />
                            <Line yAxisId="left" type="monotone" dataKey="sleep_hours" stroke="#8884d8" name="Sleep (h)" />
                            <Line yAxisId="right" type="monotone" dataKey="focus_minutes" stroke="#82ca9d" name="Focus (m)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">Does more sleep = more focus?</p>
            </div>

            {/* Mood vs Productivity */}
            <div className="bg-[#181822] border border-white/5 p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    😊 Mood vs ✅ Tasks
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" stroke="#666" fontSize={12} tickFormatter={(val) => val.slice(5)} />
                            <YAxis stroke="#8884d8" />
                            <Tooltip contentStyle={{ backgroundColor: '#0F0F16', borderColor: '#333' }} />
                            <Bar dataKey="mood" fill="#8884d8" name="Mood (1-10)" />
                            <Bar dataKey="tasks_completed" fill="#ffc658" name="Tasks" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">Happy people get more done?</p>
            </div>
        </div>
    )
}
