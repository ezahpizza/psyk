import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import {geminiFlashModel} from '@/ai';
import { auth } from "@clerk/nextjs/server";
import { saveChat, getChatById, deleteChatById } from "@/lib/models";
import { searchTavily } from "@/lib/tavily";

interface ChatRequestBody { id: string; messages: Array<Message>; anonymous?: boolean; anonId?: string }

export async function POST(request: Request) {
  const { id, messages, anonymous, anonId } = (await request.json()) as ChatRequestBody;
  const session = await auth();
  const isAuthed = !!session?.userId;
  if (!anonymous && !isAuthed) return new Response("Unauthorized", { status: 401 });

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  const result = await streamText({
    model: geminiFlashModel,
    tools: {
      tavilySearch: {
        description: "Search the web (via Tavily) for up-to-date, factual mental health information, reputable resources, or recent research.",
        parameters: z.object({
          query: z.string().describe("Concise focused search query")
        }),
        execute: async ({ query }) => {
          const results = await searchTavily(query);
            return { results };
        }
      }
    },
    system: `You are Psyk, an empathetic mental health companion.

Core aims: active listening, emotional validation, gentle coping strategies, healthy routine suggestions, accessible psychoeducation.
Critical limitations: not a therapist; do not diagnose, do not give medical directives, no crisis handling beyond encouraging professional or emergency help if user indicates self‑harm, harm to others, or severe distress.

TOOL USE GUIDELINES:
Call the tavilySearch tool WHEN (a) user requests facts, statistics, definitions, emerging research, prevalence rates, evidence-based technique descriptions, resource lists, or anything likely to change over time; (b) you are unsure about accuracy of an educational claim; (c) user asks for external mental health resources, hotlines (region-specific), or reputable organizations.
Do NOT call tavilySearch for purely emotional support, reflective listening, journaling help, or subjective feelings processing.

After receiving tavilySearch results: weave 2-4 of the most relevant sources naturally into your answer (no raw URLs dump). Cite briefly inline like (Source: WHO) or (Source: NIMH). If a resource appears reputable but you cannot confirm region, suggest verifying local applicability. Avoid overwhelming the user; summarize then optionally offer “let me know if you’d like more sources”.

EXAMPLES:
User: "What are current evidence-based treatments for panic disorder?" -> Call tavilySearch with query: "evidence based treatments panic disorder CBT exposure SSRIs".
User: "Give me recent stats on adolescent depression in the US" -> Call tavilySearch with query: "2025 adolescent depression prevalence United States".
User: "I'm feeling anxious about a presentation" -> No search; respond with validation + coping strategies.

Always include a short disclaimer when giving strategy or informational guidance: "This isn’t medical advice" or similar.

Date: ${new Date().toLocaleDateString()}.`,
    messages: coreMessages,
    onFinish: async ({ responseMessages }) => {
      try {
        // Persist raw core + response messages; casting to Message[] for storage
        await saveChat({
          id,
          // Casting to any because AI SDK messages are heterogeneous; persist as-is.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          messages: [...coreMessages, ...responseMessages] as any,
          userId: !anonymous ? (session?.userId ?? undefined) : undefined,
          anonId: anonymous ? anonId : undefined,
        });
      } catch (e) {
        console.error("Failed to save chat", e);
      }
    },
    experimental_telemetry: { isEnabled: true, functionId: "stream-text" },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const anonId = searchParams.get("anonId");
  if (!id) return new Response("Not Found", { status: 404 });
  const session = await auth();
  try {
    const chat = await getChatById(id);
    if (!chat) return new Response("Not Found", { status: 404 });
  const isOwner = !!session?.userId && 'userId' in chat && chat.userId === session.userId;
    const isAnon = !!anonId && 'anonId' in chat && chat.anonId === anonId;
    if (!isOwner && !isAnon) return new Response("Unauthorized", { status: 401 });
  await deleteChatById(id, { userId: isOwner ? session?.userId : undefined, anonId: isAnon ? anonId ?? undefined : undefined });
    return new Response("Chat deleted", { status: 200 });
  } catch (e) {
    console.error("Failed to delete chat", e);
    return new Response("Server error", { status: 500 });
  }
}
