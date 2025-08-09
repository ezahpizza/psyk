import { notFound } from "next/navigation";

import { Chat as PreviewChat } from "@/components/custom/chat";
import { getChatById } from "@/lib/models";

export default async function Page({ params }: { params: any }) {
  const { id } = params;
  const chatFromDb = await getChatById(id);

  if (!chatFromDb) {
    notFound();
  }

  return <PreviewChat id={chatFromDb.id} initialMessages={chatFromDb.messages as any} />;
}
