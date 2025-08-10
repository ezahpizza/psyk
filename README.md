# Psyk

Psyk is an empathetic mental health assistance platform built with Next.js, Vercel AI SDK, Tailwind + shadcn/ui, Clerk auth, and MongoDB via Mongoose. It supports two modes:

1. Authenticated mode – chats stored under your user account.
2. Anonymous mode – chats stored separately under a locally generated anonId (no PII stored).

## Key Features

- Anonymous toggle – switch anytime.
- Streaming responses with minimal UI latency.
- File upload support .

## Environment Variables

Copy `.env.example` to `.env.local` and fill:

```env

MONGODB_URI=your_atlas_connection_string
GOOGLE_GENERATIVE_AI_API_KEY=your_key
AUTH_SECRET=generated_secret
BLOB_READ_WRITE_TOKEN=optional_if_using_file_uploads
TAVILY_API_KEY=your_tavily_api_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

Refer to Clerk dashboard for the correct keys.

## Development

pnpm install
pnpm dev

Open http://localhost:3000. Toggle Anonymous mode from the user menu (or login to persist chats).

## Deployment Notes

- Ensure `MONGODB_URI` & `GOOGLE_GENERATIVE_AI_API_KEY` are set in Vercel dashboard.

## Safety & Disclaimer

Psyk does not provide medical advice, diagnosis, or crisis intervention. For urgent help, contact local emergency services or a qualified professional.

## License

MIT