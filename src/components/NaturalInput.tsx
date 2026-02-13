'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { parseTaskInput, ParsedTask } from '@/lib/os-parser'
import { Calendar, Tag, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function NaturalInput() {
    const router = useRouter()
    const [input, setInput] = useState('')
    const [parsed, setParsed] = useState<ParsedTask | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (input.trim()) {
            setParsed(parseTaskInput(input))
        } else {
            setParsed(null)
        }
    }, [input])

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!input.trim() || loading || !parsed) return

        setLoading(true)
        try {
            // Map parsed data to API expectation
            const body = {
                title: parsed.title,
                domain: parsed.domain || null,
                priority: parsed.priority || 3, // Default to Medium
                due_date: parsed.due_date ? parsed.due_date.toISOString() : null,
                // Default values for other fields
                impact_type: 'maintenance',
                energy_type: 'shallow',
                estimated_time: 30
            }

            await fetch('/api/tasks/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            toast.success(`Task created: ${parsed.title}`)
            setInput('')
            router.refresh()
        } catch (err) {
            console.error('Failed to create task:', err)
            toast.error('Failed to create task')
        } finally {
            setLoading(false)
        }
    }

    const priorityColor = (p?: number) => {
        if (p === 5) return 'text-red-400'
        if (p === 1) return 'text-blue-400'
        return 'text-yellow-400'
    }

    return (
        <div className="w-full max-w-3xl mx-auto mb-8">
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                <form onSubmit={handleSubmit} className="relative bg-[#12121a] rounded-xl border border-white/10 shadow-xl overflow-hidden">
                    <input
                        autoFocus
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a task... e.g. 'Call Ravi tomorrow 4pm high priority #sales'"
                        className="w-full px-6 py-4 bg-transparent text-lg text-white placeholder-gray-500 focus:outline-none"
                    />

                    {/* Live Preview / Metadata */}
                    {(parsed || loading) && (
                        <div className="px-6 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-sm animate-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center gap-4 text-gray-400">
                                {parsed?.due_date && (
                                    <span className="flex items-center gap-1.5 text-cyan-400">
                                        <Calendar className="w-4 h-4" />
                                        {format(parsed.due_date, 'MMM d, h:mm a')}
                                    </span>
                                )}
                                {parsed?.priority && (
                                    <span className={`flex items-center gap-1.5 ${priorityColor(parsed.priority)}`}>
                                        <AlertCircle className="w-4 h-4" />
                                        {parsed.priority === 5 ? 'High' : parsed.priority === 1 ? 'Low' : 'Medium'}
                                    </span>
                                )}
                                {parsed?.tags && parsed.tags.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        {parsed.tags.map(tag => (
                                            <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-gray-300">
                                                <Tag className="w-3 h-3" />
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {parsed?.domain && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                        @{parsed.domain}
                                    </span>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 text-xs font-medium text-gray-500 group-focus-within:text-white transition-colors"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <span>Press Enter</span>
                                        <div className="w-5 h-5 rounded border border-gray-600 flex items-center justify-center">↵</div>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
