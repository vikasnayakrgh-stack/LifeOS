'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function NotificationListener() {
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const channel = supabase
            .channel('realtime-tasks')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'tasks',
                },
                (payload) => {
                    const newTask = payload.new as any
                    // Don't notify if it's a subtask creation (optional logic)

                    toast('New Task Created', {
                        description: newTask.title,
                        icon: <Sparkles className="w-4 h-4 text-purple-400" />,
                        action: {
                            label: 'View',
                            onClick: () => router.push('/dashboard')
                        }
                    })
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'tasks',
                    filter: 'status=eq.done'
                },
                (payload) => {
                    const task = payload.new as any
                    toast('Task Completed! 🎉', {
                        description: task.title,
                        icon: <CheckCircle2 className="w-4 h-4 text-green-400" />,
                        duration: 3000
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, router])

    return null
}
