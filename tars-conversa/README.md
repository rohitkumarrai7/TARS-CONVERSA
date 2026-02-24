# Tars-Conversa

A real-time LiveChat web app built for the **Tars Full Stack Engineer Internship Coding Challenge 2026**.

Built with Next.js 16, TypeScript, Convex, Clerk, and shadcn/ui.

---

## Features

### Core (1–10)
- **Authentication** — Sign up/in via email or Google (Clerk)
- **User Search** — Find any registered user and start a DM
- **Real-time Messaging** — Instant delivery via Convex subscriptions
- **Message Timestamps** — Smart formatting (time / date+time / date+time+year)
- **Empty States** — Helpful messages on every blank screen
- **Responsive Layout** — Sidebar+chat on desktop; full-screen chat on mobile with back button
- **Online/Offline Status** — Live green dot, updates in real time
- **Typing Indicator** — "Alex is typing…" with animated dots, clears after 2s
- **Unread Badge** — Per-conversation unread count, clears on open
- **Smart Auto-Scroll** — Follows new messages; shows "↓ New messages" when scrolled up

### Optional (11–14)
- **Delete Messages** — Soft-delete with "This message was deleted" shown to all
- **Message Reactions** — 6 emoji reactions with toggle and live counts
- **Loading & Error States** — Skeleton loaders throughout; toast errors on failures
- **Group Chat** — Create groups with a name, pick members, real-time for everyone

### Bonus
- **Reply Threading** — Quote any message with full context
- **Pin Messages** — Pin/unpin any message, shown in the header bar
- **Message Search** — Search within a conversation, click to jump and highlight
- **Read Receipts** — ✓ sent / ✓✓ indigo = read by the other person
- **TARS AI** — Built-in AI assistant powered by OpenRouter, accessible from the sidebar

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Backend / Database / Realtime | Convex |
| Authentication | Clerk |
| Styling | Tailwind CSS v4 + shadcn/ui |
| AI Integration | OpenRouter (arcee-ai/trinity-large-preview) |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/rohitkumarrai7/TARS-CONVERSA.git
cd TARS-CONVERSA/tars-conversa
npm install
```

### 2. Set up environment variables

Create `.env.local` in the `tars-conversa` directory:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CONVEX_SITE_URL=your_convex_site_url
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Convex dev server (separate terminal)

```bash
npx convex dev
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
tars-conversa/
├── app/
│   ├── api/
│   │   ├── ai/chat/          # TARS AI endpoint (OpenRouter)
│   │   └── webhooks/clerk/   # Clerk user sync webhook
│   ├── chat/
│   │   ├── [conversationId]/ # Chat conversation page
│   │   ├── ai/               # TARS AI chat page
│   │   └── layout.tsx        # Sidebar + chat responsive layout
│   ├── sign-in/  sign-up/
│   └── page.tsx              # Root redirect
├── components/
│   ├── ai/                   # TARS AI interface
│   ├── chat/                 # ChatHeader, MessageList, MessageBubble, MessageInput…
│   ├── layout/               # AppSidebar
│   ├── shared/               # UserAvatar, EmptyState, Skeletons, ThemeToggle
│   ├── sidebar/              # ConversationList, UserSearchModal, NewGroupModal
│   └── ui/                   # shadcn/ui components
├── convex/
│   ├── schema.ts             # 5 tables: users, conversations, messages, typing, receipts
│   ├── users.ts
│   ├── conversations.ts
│   ├── messages.ts
│   └── typing.ts
├── hooks/
│   ├── useAutoScroll.ts
│   ├── useSyncUser.ts
│   └── useTypingIndicator.ts
└── lib/
    └── formatTimestamp.ts
```

---

## Deployment

Deployed on **Vercel** — Convex handles the real-time backend automatically.

---

## AI Tool Used

Built with **Claude Code** by Anthropic.
