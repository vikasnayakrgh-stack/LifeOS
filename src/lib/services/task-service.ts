import { createClient } from '@/lib/supabase/server'

// ---- Types ----
export interface Task {
    id: string
    user_id: string
    domain: string | null
    subdomain: string | null
    title: string
    priority: number
    impact_type: 'revenue' | 'growth' | 'maintenance' | 'vanity'
    energy_type: 'deep' | 'shallow'
    estimated_time: number
    due_date: string | null
    status: 'pending' | 'completed' | 'overdue'
    recurrence_type: 'daily' | 'weekly' | 'monthly' | null
    recurrence_rule: Record<string, unknown> | null
    reminder_level: number
    delay_count: number
    money_impact: boolean
    focus_today: boolean
    is_deleted: boolean
    archived_at: string | null
    version: number
    created_at: string
    updated_at: string
}

export interface CreateTaskInput {
    title: string
    domain?: string
    subdomain?: string
    priority?: number
    impact_type?: Task['impact_type']
    energy_type?: Task['energy_type']
    estimated_time?: number
    due_date?: string
    recurrence_type?: Task['recurrence_type']
    recurrence_rule?: Record<string, unknown>
    money_impact?: boolean
}

export interface UpdateTaskInput {
    id: string
    version: number // optimistic locking
    title?: string
    domain?: string
    subdomain?: string
    priority?: number
    impact_type?: Task['impact_type']
    energy_type?: Task['energy_type']
    estimated_time?: number
    due_date?: string
    status?: Task['status']
    recurrence_type?: Task['recurrence_type']
    recurrence_rule?: Record<string, unknown>
    money_impact?: boolean
    focus_today?: boolean
    reminder_level?: number
    delay_count?: number
}

export interface TaskFilters {
    status?: Task['status']
    impact_type?: Task['impact_type']
    energy_type?: Task['energy_type']
    focus_today?: boolean
    include_archived?: boolean
}

// ---- Service Functions ----

export async function getTasks(filters: TaskFilters = {}) {
    const supabase = await createClient()

    let query = supabase
        .from('tasks')
        .select('*')
        .eq('is_deleted', false)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

    if (!filters.include_archived) {
        query = query.is('archived_at', null)
    }

    if (filters.status) {
        query = query.eq('status', filters.status)
    }
    if (filters.impact_type) {
        query = query.eq('impact_type', filters.impact_type)
    }
    if (filters.energy_type) {
        query = query.eq('energy_type', filters.energy_type)
    }
    if (filters.focus_today !== undefined) {
        query = query.eq('focus_today', filters.focus_today)
    }

    const { data, error } = await query
    if (error) throw error
    return data as Task[]
}

export async function createTask(input: CreateTaskInput) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('tasks')
        .insert({ ...input, user_id: user.id })
        .select()
        .single()

    if (error) throw error
    return data as Task
}

export async function updateTask(input: UpdateTaskInput) {
    const supabase = await createClient()
    const { id, version, ...updates } = input

    // Optimistic locking: only update if version matches
    const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, version: version + 1 })
        .eq('id', id)
        .eq('version', version)
        .eq('is_deleted', false)
        .select()
        .single()

    if (error) throw error
    if (!data) throw new Error('Task was modified by another process. Please refresh.')
    return data as Task
}

export async function softDeleteTask(id: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('tasks')
        .update({ is_deleted: true })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data as Task
}

export async function getOverdueTasks() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'pending')
        .eq('is_deleted', false)
        .is('archived_at', null)
        .lt('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })

    if (error) throw error
    return data as Task[]
}

export async function getFocusTasks() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('focus_today', true)
        .eq('is_deleted', false)
        .is('archived_at', null)
        .order('priority', { ascending: false })
        .limit(3)

    if (error) throw error
    return data as Task[]
}
