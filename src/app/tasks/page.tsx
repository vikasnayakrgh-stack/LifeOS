import { createClient } from '@/lib/supabase/server'
import TasksView from '@/components/TasksView'

export default async function TasksPage() {
    const supabase = await createClient()
    const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_deleted', false)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

    return (
        <div className="container mx-auto py-8">
            <TasksView tasks={tasks || []} />
        </div>
    )
}
