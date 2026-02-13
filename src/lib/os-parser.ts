import { addDays, nextMonday, set } from 'date-fns'

export interface ParsedTask {
    title: string
    priority?: number
    due_date?: Date
    tags: string[]
    domain?: string
}

export function parseTaskInput(input: string): ParsedTask {
    let title = input
    let priority: number | undefined
    let due_date: Date | undefined
    const tags: string[] = []
    let domain: string | undefined

    // 1. Extract Tags (#tag)
    const tagRegex = /#(\w+)/g
    const tagMatches = title.match(tagRegex)
    if (tagMatches) {
        tags.push(...tagMatches.map(t => t.slice(1))) // remove #
        title = title.replace(tagRegex, '').trim()
    }

    // 2. Extract Priority
    // "high priority", "urgent", "!high", "!3"
    if (title.match(/\b(high priority|urgent|important)\b/i) || title.includes('!high')) {
        priority = 5
        title = title.replace(/\b(high priority|urgent|important)\b/i, '').replace('!high', '').trim()
    } else if (title.match(/\b(medium priority)\b/i) || title.includes('!medium')) {
        priority = 3
        title = title.replace(/\b(medium priority)\b/i, '').replace('!medium', '').trim()
    } else if (title.match(/\b(low priority)\b/i) || title.includes('!low')) {
        priority = 1
        title = title.replace(/\b(low priority)\b/i, '').replace('!low', '').trim()
    }

    // 3. Extract Date
    // "tomorrow", "next week", "today", "tonight"
    const lowerTitle = title.toLowerCase()
    const today = new Date()

    if (lowerTitle.includes('tomorrow')) {
        due_date = addDays(today, 1)
        // Default to 9 AM for tomorrow tasks
        due_date = set(due_date, { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 })
        title = title.replace(/\btomorrow\b/i, '').trim()
    } else if (lowerTitle.includes('today')) {
        due_date = today
        // Default to end of day if "today" is unspecified, or maybe next hour? Let's keep it null time or EOD.
        // Let's set to 6 PM if it's currently before 6 PM, else +1 hour.
        // For simplicity, let's just mark the date.
        due_date = set(today, { hours: 18, minutes: 0, seconds: 0, milliseconds: 0 }) // 6 PM
        title = title.replace(/\btoday\b/i, '').trim()
    } else if (lowerTitle.includes('next week')) {
        due_date = nextMonday(today)
        due_date = set(due_date, { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 })
        title = title.replace(/\bnext week\b/i, '').trim()
    }

    // 4. Extract Domain (simple heuristic for now, e.g. @Work)
    const domainRegex = /@(\w+)/
    const domainMatch = title.match(domainRegex)
    if (domainMatch) {
        domain = domainMatch[1]
        title = title.replace(domainRegex, '').trim()
    }

    // Cleanup extra spaces
    title = title.replace(/\s+/g, ' ').trim()

    return {
        title,
        priority,
        due_date,
        tags,
        domain
    }
}
