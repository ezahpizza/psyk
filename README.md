# Psyk – Mental Health Companion Chatbot

Psyk is an empathetic mental health companion built with Next.js (App Router), Vercel AI SDK (Gemini), Tailwind + shadcn/ui, NextAuth (credentials), and MongoDB via Mongoose. It supports two modes:

1. Authenticated mode – chats stored under your user account.
2. Anonymous mode – chats stored separately under a locally generated anonId (no PII stored).

## Key Features

- Empathetic system prompt with safety + non‑diagnostic disclaimer.
- Anonymous toggle (persisted in localStorage) – switch anytime.
- MongoDB Atlas (Mongoose) replaces previous Postgres/Drizzle stack.
- Streaming responses (streamText) with minimal UI latency.
- File upload support (optional – requires Blob token if enabled).

## Environment Variables

Copy `.env.example` to `.env.local` and fill:

MONGODB_URI=your_atlas_connection_string
GOOGLE_GENERATIVE_AI_API_KEY=your_key
AUTH_SECRET=generated_secret
BLOB_READ_WRITE_TOKEN=optional_if_using_file_uploads

Remove any old Postgres variables – no longer required.

## Development

pnpm install
pnpm dev

Open http://localhost:3000. Toggle Anonymous mode from the user menu (or login to persist chats).

## Deployment Notes

- Ensure `MONGODB_URI` & `GOOGLE_GENERATIVE_AI_API_KEY` are set in Vercel dashboard.
- No migration step needed (Drizzle removed).

## Safety & Disclaimer

Psyk does not provide medical advice, diagnosis, or crisis intervention. For urgent help, contact local emergency services or a qualified professional.

## License

MIT