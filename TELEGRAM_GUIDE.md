# Telegram Testing Guide

## 1. Local Setup (Ngrok)
Since your API is running localhost:3000, Telegram needs a public URL to reach it.

1.  **Start Ngrok**:
    Run in a new terminal:
    ```bash
    ngrok http 3000
    ```
2.  **Copy URL**:
    Look for the `Forwarding` line. Example: `https://abcd-1234.ngrok-free.app`

## 2. Set Webhook
You need to tell Telegram where to send messages.

1.  **Construct URL**:
    `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_NGROK_URL>/api/telegram/webhook`
    
    *Replace `<YOUR_BOT_TOKEN>` with your actual token.*
    *Replace `<YOUR_NGROK_URL>` with the ngrok URL you just copied.*

2.  **Run in Browser**:
    Paste that link into Chrome/Edge.
    You should see: `{"ok":true,"result":true,"description":"Webhook was set"}`

## 3. Link Account
1.  Go to `http://localhost:3000/settings`.
2.  Click "Connect Telegram".
3.  It will open your bot. Click **Start**.
4.  You should receive a "Connected!" message on Telegram.

## 4. Test Commands
- `/task Buy milk` -> Should create a task.
- `/focus` -> Should show your current task.
