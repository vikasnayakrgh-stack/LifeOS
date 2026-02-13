import { addDays, nextMonday, nextSaturday, isPast, isToday } from 'date-fns'

interface Suggestion {
    label: string
    date: Date
}

export function useSmartReschedule() {
    const getSuggestions = (): Suggestion[] => {
        const now = new Date()
        const suggestions: Suggestion[] = [
            { label: 'Tomorrow', date: addDays(now, 1) },
        ]

        if (!isToday(nextSaturday(now))) {
            suggestions.push({ label: 'This Weekend', date: nextSaturday(now) })
        }

        suggestions.push({ label: 'Next Week', date: nextMonday(now) })

        return suggestions
    }

    const isOverdue = (date?: string | null) => {
        if (!date) return false
        return isPast(new Date(date)) && !isToday(new Date(date))
    }

    return { getSuggestions, isOverdue }
}
