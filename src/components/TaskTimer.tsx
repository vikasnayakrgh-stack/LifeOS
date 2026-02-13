'use client'

import { Play, Pause, Square } from 'lucide-react'
import { cn } from '@/lib/utils' // Assuming we have valid utils, otherwise will need clsx/tailwind-merge directly or create it.

// Fallback for cn if not available imports
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cnLocal(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface Props {
    isRunning: boolean
    elapsedTime: number
    onStart: () => void
    onStop: () => void
    className?: string
}

function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function TaskTimer({ isRunning, elapsedTime, onStart, onStop, className }: Props) {
    return (
        <div
            className={cnLocal(
                "flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 transition-all duration-300 group hover:border-white/20 hover:bg-white/10",
                isRunning && "border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-400/50",
                className
            )}
            role="timer"
            aria-live="off"
        >
            <div className={cnLocal(
                "font-mono text-xs font-medium tabular-nums transition-colors duration-300",
                isRunning ? "text-cyan-400" : "text-gray-400 group-hover:text-gray-200"
            )}>
                {formatTime(elapsedTime)}
            </div>

            <div className="h-3 w-px bg-white/10 mx-0.5" />

            <button
                onClick={(e) => {
                    e.stopPropagation()
                    isRunning ? onStop() : onStart()
                }}
                className={cnLocal(
                    "flex items-center justify-center w-5 h-5 rounded-full transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-cyan-500/50",
                    isRunning
                        ? "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                )}
                aria-label={isRunning ? "Pause timer" : "Start timer"}
            >
                {isRunning ? (
                    <Pause className="w-3 h-3 fill-current" />
                ) : (
                    <Play className="w-3 h-3 fill-current pl-0.5" />
                )}
            </button>
        </div>
    )
}
