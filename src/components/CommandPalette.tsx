'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
    LayoutDashboard,
    Plus,
    Search,
    Calendar,
    Zap,
    Settings,
    ListTodo
} from 'lucide-react'

export function CommandPalette() {
    const router = useRouter()
    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#12121a] border border-white/10 rounded-xl shadow-2xl z-[9999] overflow-hidden p-0"
        >
            <div className="flex items-center border-b border-white/5 px-3">
                <Search className="w-5 h-5 text-gray-500 mr-2" />
                <Command.Input
                    placeholder="Type a command or search..."
                    className="w-full bg-transparent border-none py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
                />
            </div>

            <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-hide">
                <Command.Empty className="py-6 text-center text-sm text-gray-500">
                    No results found.
                </Command.Empty>

                <Command.Group heading="Actions" className="text-xs font-medium text-gray-500 mb-2 px-2">
                    <Command.Item
                        onSelect={() => runCommand(() => {
                            // Trigger task creation modal? Or focus natural input
                            const input = document.querySelector('input[type="text"]') as HTMLInputElement
                            if (input) input.focus()
                        })}
                        className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create New Task</span>
                        <span className="ml-auto text-xs opacity-50">C</span>
                    </Command.Item>
                    <Command.Item
                        onSelect={() => runCommand(() => router.push('/dashboard?focus=true'))}
                        className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                    >
                        <Zap className="w-4 h-4" />
                        <span>Enter Focus Mode</span>
                    </Command.Item>
                </Command.Group>

                <Command.Group heading="Navigation" className="text-xs font-medium text-gray-500 mb-2 px-2 pt-2">
                    <Command.Item
                        onSelect={() => runCommand(() => router.push('/dashboard'))}
                        className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                    </Command.Item>
                    <Command.Item
                        onSelect={() => runCommand(() => router.push('/tasks'))}
                        className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                    >
                        <ListTodo className="w-4 h-4" />
                        <span>All Tasks</span>
                    </Command.Item>
                    <Command.Item
                        onSelect={() => runCommand(() => router.push('/calendar'))}
                        className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Calendar</span>
                    </Command.Item>
                    <Command.Item
                        onSelect={() => runCommand(() => router.push('/settings'))}
                        className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                    </Command.Item>
                </Command.Group>
            </Command.List>

            <div className="border-t border-white/5 px-4 py-2 flex items-center justify-between text-[10px] text-gray-600">
                <div className="flex gap-2">
                    <span>↑↓ navigate</span>
                    <span>↵ select</span>
                </div>
                <span>esc to close</span>
            </div>
        </Command.Dialog>
    )
}
