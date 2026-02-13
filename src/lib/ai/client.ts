import OpenAI from 'openai'

// Use OpenAI SDK but point to OpenRouter
export const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': 'https://life-os.local', // Required by OpenRouter
        'X-Title': 'Life OS',
    },
})

export const AI_MODEL = process.env.OPENROUTER_MODEL || 'qwen/qwen3-coder-next'
