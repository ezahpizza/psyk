import { google } from '@ai-sdk/google';
import { convertToCoreMessages, Message, streamText } from "ai";

import { auth } from "@/app/(auth)/auth";
import { saveChat, getChatById, deleteChatById } from "@/lib/models";

interface ChatRequestBody { id: string; messages: Array<Message>; anonymous?: boolean; anonId?: string }

export async function POST(request: Request) {
  const { id, messages, anonymous, anonId } = (await request.json()) as ChatRequestBody;
  const session = await auth();
  const isAuthed = !!session?.user?.id;
  if (!anonymous && !isAuthed) return new Response("Unauthorized", { status: 401 });

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  const result = await streamText({
    model: google('gemini-2.5-flash'),
    system: `You are Psyk, an empathetic mental health companion. Goals: listen actively, validate feelings, reflect mood, offer gentle coping strategies, suggest healthy routines, and explain mental health concepts accessibly. Limitations: you are not a therapist and cannot diagnose, prescribe, or replace professional care. Always include a brief disclaimer when giving advice that sounds medical or urgent (e.g. "I'm not a professional, but..."). Encourage seeking professional or emergency help if user expresses self-harm, harm to others, or severe distress. Keep tone warm, concise, and stigma-free. Date: ${new Date().toLocaleDateString()}.`,
    messages: coreMessages,
  onFinish: async ({ responseMessages }) => {
      try {
        // Persist raw core + response messages; casting to Message[] for storage
        await saveChat({
          id,
          messages: [...coreMessages, ...responseMessages] as any,
          userId: !anonymous ? session?.user?.id : undefined,
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
    const isOwner = !!session?.user?.id && 'userId' in chat && chat.userId === session.user.id;
    const isAnon = !!anonId && 'anonId' in chat && chat.anonId === anonId;
    if (!isOwner && !isAnon) return new Response("Unauthorized", { status: 401 });
    await deleteChatById(id, { userId: isOwner ? session?.user?.id : undefined, anonId: isAnon ? anonId ?? undefined : undefined });
    return new Response("Chat deleted", { status: 200 });
  } catch (e) {
    console.error("Failed to delete chat", e);
    return new Response("Server error", { status: 500 });
  }
}
