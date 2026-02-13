
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Use OpenAI SDK but point to OpenRouter
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', // Required by OpenRouter
        'X-Title': 'Life OS',
    },
})

export const AI_MODEL = process.env.OPENROUTER_MODEL || 'qwen/qwen3-coder-next'

export async function POST(req: NextRequest) {
    try {
        const { title, domain } = await req.json()

        if (!title) {
            return NextResponse.json({ error: 'Task title is required' }, { status: 400 })
        }

        const systemPrompt = `You are a productivity expert. Break down the following task into 3-5 actionable, bite-sized subtasks. 
        Context: Domain is ${domain || 'General'}.
        
        Return ONLY a raw JSON array of strings. No markdown, no explanations. 
        Example: ["Draft outline", "Research competitors", "Write introduction"]`

        const response = await openai.chat.completions.create({
            model: AI_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Task: ${title}` }
            ],
        })

        const content = response.choices[0]?.message?.content
        if (!content) throw new Error('No response from AI')

        console.log('AI Response:', content)

        // Clean up markdown code blocks if any (OpenRouter models sometimes add them)
        let cleanContent = content.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim()

        // Remove any non-json text before or after
        const firstBracket = cleanContent.indexOf('[')
        const lastBracket = cleanContent.lastIndexOf(']')
        if (firstBracket !== -1 && lastBracket !== -1) {
            cleanContent = cleanContent.substring(firstBracket, lastBracket + 1)
        }

        let steps: string[]
        try {
            steps = JSON.parse(cleanContent)
        } catch (e) {
            console.error('JSON Parse Error:', e)
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
        }

        // Transform into object structure
        const subtasks = steps.map(step => ({
            id: crypto.randomUUID(),
            title: step,
            isCompleted: false
        }))

        return NextResponse.json({ subtasks })
    } catch (error) {
        console.error('AI Breakdown Error:', error)
        return NextResponse.json({ error: 'Failed to generate subtasks' }, { status: 500 })
    }
}
