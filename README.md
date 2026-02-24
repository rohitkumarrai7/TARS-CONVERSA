# Tars-Conversa

A real-time LiveChat web app built for the **Tars Full Stack Engineer Internship Coding Challenge 2026**.

Built with Next.js 16, TypeScript, Convex, Clerk, and shadcn/ui.

> **Live Demo:** [tars-conversa.vercel.app](https://tars-conversa.vercel.app) &nbsp;|&nbsp; **App source:** [`tars-conversa/`](./tars-conversa)

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

```bash
git clone https://github.com/rohitkumarrai7/TARS-CONVERSA.git
cd TARS-CONVERSA/tars-conversa
npm install
```

Create `.env.local` in the `tars-conversa/` directory — see [`tars-conversa/README.md`](./tars-conversa/README.md) for full setup instructions.

---

## Built with Claude Code

This project was built using **Claude Code** by Anthropic as part of the internship challenge.
