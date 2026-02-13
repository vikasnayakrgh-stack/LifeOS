'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, EyeOff, CheckCircle2, X } from 'lucide-react'

interface Props {
    endTime: string
    onEndSession: () => void
}

export default function FocusShield({ endTime, onEndSession }: Props) {
    const [distractedCount, setDistractedCount] = useState(0)
    const [isDistracted, setIsDistracted] = useState(false)
    const [timeLeft, setTimeLeft] = useState('')

    // Visibility Listener
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setDistractedCount(prev => prev + 1)
                setIsDistracted(true)
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [])

    // Timer Countdown
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date()
            // Simplified for demo: assume endTime is HH:MM string for today
            // In real app, we'd pass full ISO date
            // Just showing the static endTime for now as per MVP
        }, 1000)
        return () => clearInterval(interval)
    }, [endTime])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0F0F16] flex flex-col items-center justify-center text-white"
        >
            <div className="absolute top-8 right-8">
                <button
                    onClick={onEndSession}
                    className="text-gray-500 hover:text-white transition-colors"
                >
                    <X className="w-8 h-8" />
                </button>
            </div>

            <div className="text-center space-y-8 max-w-2xl px-8">
                {isDistracted ? (
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="space-y-4"
                    >
                        <EyeOff className="w-24 h-24 text-red-500 mx-auto" />
                        <h1 className="text-4xl font-bold text-red-500">Distraction Detected!</h1>
                        <p className="text-xl text-gray-400">
                            You entered the void. This is distraction #{distractedCount}.
                        </p>
                        <button
                            onClick={() => setIsDistracted(false)}
                            className="bg-red-500/10 border border-red-500 text-red-500 px-8 py-3 rounded-full font-bold hover:bg-red-500 hover:text-white transition-all"
                        >
                            I'm Back. Resume Focus.
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        <div className="w-32 h-32 rounded-full bg-purple-500/10 border-2 border-purple-500 flex items-center justify-center mx-auto animate-pulse">
                            <span className="text-4xl">🧠</span>
                        </div>

                        <div>
                            <h2 className="text-sm text-purple-400 uppercase tracking-widest font-bold mb-2">Deep Work Session</h2>
                            <h1 className="text-6xl font-bold font-mono tracking-tighter">
                                {endTime}
                            </h1>
                            <p className="text-gray-500 mt-4">Target End Time</p>
                        </div>

                        <div className="pt-12 grid grid-cols-2 gap-8 text-left">
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                <p className="text-gray-400 text-sm mb-1">Focus Score</p>
                                <p className="text-2xl font-bold text-green-400">
                                    {Math.max(100 - (distractedCount * 10), 0)}%
                                </p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                <p className="text-gray-400 text-sm mb-1">Distractions</p>
                                <p className={`text-2xl font-bold ${distractedCount > 0 ? 'text-red-400' : 'text-gray-200'}`}>
                                    {distractedCount}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
