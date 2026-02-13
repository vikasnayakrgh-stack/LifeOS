'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Trash2, ArrowRight, Calendar, Sparkles, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, subDays } from 'date-fns'

export default function WeeklyPlanPage() {
    const [step, setStep] = useState(1)
    const [completedTasks, setCompletedTasks] = useState<any[]>([])
    const [stagnantTasks, setStagnantTasks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [goals, setGoals] = useState(['', '', ''])
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const weekAgo = subDays(new Date(), 7).toISOString()

            // Fetch Completed
            const { data: completed } = await supabase
                .from('tasks')
                .select('*')
                .eq('status', 'done')
                .gte('updated_at', weekAgo) // Assuming we had updated_at, if not just show recent done

            // Fetch Stagnant (Pending > 7 days)
            const { data: stagnant } = await supabase
                .from('tasks')
                .select('*')
                .neq('status', 'done')
                .lt('created_at', weekAgo)

            if (completed) setCompletedTasks(completed)
            if (stagnant) setStagnantTasks(stagnant)
            setLoading(false)
        }
        fetchData()
    }, [])

    const handleDelete = async (id: string) => {
        await supabase.from('tasks').delete().eq('id', id)
        setStagnantTasks(prev => prev.filter(t => t.id !== id))
    }

    const handleReschedule = async (id: string) => {
        // Just move to top of backlog for now, or update date
        await supabase.from('tasks').update({ created_at: new Date().toISOString() }).eq('id', id)
        setStagnantTasks(prev => prev.filter(t => t.id !== id))
    }

    const handleFinish = async () => {
        // Create Goals
        for (const goal of goals) {
            if (goal.trim()) {
                await supabase.from('tasks').insert({
                    title: goal,
                    priority: 5, // High Priority
                    status: 'todo',
                    domain: 'goal',
                    estimated_time: 60
                })
            }
        }
        router.push('/')
    }

    return (
        <div className="min-h-screen bg-[#0F0F16] text-white flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="text-purple-500" /> Weekly Ritual
                    </h1>
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1 w-8 rounded-full transition-colors ${step >= i ? 'bg-purple-500' : 'bg-white/10'}`} />
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                                <h2 className="text-3xl font-bold">You Crushed It!</h2>
                                <p className="text-gray-400">You completed <span className="text-white font-bold">{completedTasks.length} tasks</span> this week.</p>
                            </div>

                            <div className="bg-[#181822] rounded-xl p-6 border border-white/5 space-y-2 max-h-[300px] overflow-y-auto">
                                {completedTasks.map(task => (
                                    <div key={task.id} className="flex items-center gap-3 text-gray-300">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span className="line-through opacity-50">{task.title}</span>
                                    </div>
                                ))}
                                {completedTasks.length === 0 && <div className="text-center text-gray-600 italic">No tasks completed yet. Let's change that next week!</div>}
                            </div>

                            <button onClick={() => setStep(2)} className="w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                Next: Clear the Clutter <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <h2 className="text-3xl font-bold">Stagnant Tasks</h2>
                                <p className="text-gray-400">These tasks are gathering dust (>7 days). Delete or Commit?</p>
                            </div>

                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                {stagnantTasks.map(task => (
                                    <div key={task.id} className="bg-[#181822] rounded-xl p-4 border border-white/5 flex items-center justify-between group">
                                        <div>
                                            <p className="font-medium">{task.title}</p>
                                            <p className="text-xs text-gray-500">{format(new Date(task.created_at), 'MMM d')} • {task.priority} Priority</p>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleDelete(task.id)}
                                                className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleReschedule(task.id)}
                                                className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                                                title="Keep (Reset timer)"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {stagnantTasks.length === 0 && <div className="text-center text-gray-600 italic py-8">Clean slate! No stagnant tasks found.</div>}
                            </div>

                            <button onClick={() => setStep(3)} className="w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                Next: Set Goals <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <Calendar className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                                <h2 className="text-3xl font-bold">Next Week's Focus</h2>
                                <p className="text-gray-400">Identify 3 absolute must-wins for the upcoming week.</p>
                            </div>

                            <div className="space-y-4">
                                {goals.map((goal, i) => (
                                    <div key={i} className="relative">
                                        <span className="absolute left-4 top-3.5 text-gray-500 font-mono">0{i + 1}</span>
                                        <input
                                            value={goal}
                                            onChange={(e) => {
                                                const newGoals = [...goals]
                                                newGoals[i] = e.target.value
                                                setGoals(newGoals)
                                            }}
                                            placeholder={`Goal #${i + 1}`}
                                            className="w-full bg-[#181822] border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-purple-500 transition-colors"
                                            autoFocus={i === 0}
                                        />
                                    </div>
                                ))}
                            </div>

                            <button onClick={handleFinish} className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                                Start My Week <Sparkles className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
