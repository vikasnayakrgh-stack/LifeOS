# Life OS: The Anti-Gravity Execution System 🚀

**Version:** 1.0 (MVP)
**Stack:** Next.js 15, Supabase, Tailwind, Framer Motion, Recharts.

## 🌟 Features Built

### 🟢 Layer 1: Core Utility
- **Kanban Board**: Drag-and-drop task management.
- **Deep Work Timer**: Integrated focus timer with actual vs estimated tracking.
- **Smart Rescheduling**: One-click rescheduling for overdue tasks.

### 🟡 Layer 2: Intelligence & Integration
- **Telegram Command Center**:
    - Add tasks: `/task Finish report #work`
    - Start focus: `/focus 45`
    - Get briefed: `/morning`
- **AI Task Breakdown**: Click the "Magic Wand" to split large tasks into subtasks.
- **Resistance Heatmap**: Visual flames on cards showing how much you're avoiding them.
- **Sunday Ritual**: Dedicated `/plan` page for weekly reviews and goal setting.

### 🔴 Layer 3: Bio-OS & Focus
- **Distraction Shield**: Full-screen "Lockdown" mode that detects tab switching.
- **Bio-Dashboard**: `/health` page to correlate Sleep/Steps with Focus/Revenue.
- **Morning Briefing Service**: Daily digest delivered to your phone.

---

## 🛠️ Setup Instructions

### 1. Database (Supabase)
Run the following SQL migrations in your Supabase SQL Editor:
1.  `src/lib/supabase/schema.sql` (Core)
2.  `src/lib/supabase/schema_subtasks.sql` (Subtasks)
3.  `src/lib/supabase/schema_resistance.sql` (Heatmap)
4.  `src/lib/supabase/schema_health.sql` (Health Logs)

### 2. Environment Variables
Ensure `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENROUTER_API_KEY=...
TELEGRAM_BOT_TOKEN=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Telegram Bot
1.  Start ngrok: `ngrok http 3000`
2.  Set Webhook:
    `https://api.telegram.org/bot<TOKEN>/setWebhook?url=<NGROK_URL>/api/telegram/webhook`

### 4. Run
```bash
npm run dev
```

## 🧪 Verification
Refer to `brain/walkthrough.md` for a step-by-step testing guide for every feature.
