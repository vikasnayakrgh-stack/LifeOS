import { useState, useEffect, useCallback, useRef } from 'react'

interface UseTaskTimerReturn {
    isRunning: boolean
    elapsedTime: number // in seconds
    start: () => void
    stop: () => void
    toggle: () => void
    reset: () => void
}

export function useTaskTimer(initialTime: number = 0): UseTaskTimerReturn {
    const [isRunning, setIsRunning] = useState(false)
    const [elapsedTime, setElapsedTime] = useState(initialTime)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    const start = useCallback(() => {
        if (!isRunning) {
            setIsRunning(true)
        }
    }, [isRunning])

    const stop = useCallback(() => {
        if (isRunning) {
            setIsRunning(false)
        }
    }, [isRunning])

    const toggle = useCallback(() => {
        setIsRunning(prev => !prev)
    }, [])

    const reset = useCallback(() => {
        setIsRunning(false)
        setElapsedTime(0)
    }, [])

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1)
            }, 1000)
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isRunning])

    return {
        isRunning,
        elapsedTime,
        start,
        stop,
        toggle,
        reset
    }
}
