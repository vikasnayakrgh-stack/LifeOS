'use client'

import React from 'react'
import { useTaskTimer } from '@/lib/hooks/use-task-timer'
import TaskTimer from '@/components/TaskTimer'

function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function TimerTest() {
    const { isRunning, elapsedTime, toggle, stop, reset } = useTaskTimer()

    return (
        <div className="p-8 text-white space-y-8 max-w-md mx-auto bg-[#0a0a12] rounded-2xl shadow-2xl mt-10 border border-white/10">
            <div className="space-y-2 text-center border-b border-white/10 pb-6">
                <h1 className="text-xl font-medium text-gray-200">Timer Component Verification</h1>
                <p className="text-xs text-gray-500">Testing UI states and interactions</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-8 py-4">
                {/* Embedded Component Test */}
                <div className="scale-150 p-4 border border-dashed border-gray-800 rounded-lg">
                    <TaskTimer
                        isRunning={isRunning}
                        elapsedTime={elapsedTime}
                        onStart={toggle}
                        onStop={() => { toggle(); /* Just pause for test */ }}
                    />
                </div>

                <div className="text-xs text-gray-600 font-mono">
                    Elapsed (Raw): {elapsedTime}s
                </div>
            </div>

            <div className="flex gap-4 justify-center border-t border-white/10 pt-6">
                <button
                    onClick={reset}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                >
                    Reset Check
                </button>
            </div>
        </div>
    )
}
