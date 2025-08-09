import { auth } from "@/app/(auth)/auth";
import { getChatsByUserId, getChatsByAnonId } from "@/lib/models";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const anonId = searchParams.get("anonId");
  if (anonId) {
    const chats = await getChatsByAnonId(anonId);
    return Response.json(chats);
  }
  const session = await auth();
  if (!session?.user?.id) return Response.json("Unauthorized!", { status: 401 });
  const chats = await getChatsByUserId(session.user.id);
  return Response.json(chats);
}
