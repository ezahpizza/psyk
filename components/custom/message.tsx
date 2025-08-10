"use client";

import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode } from "react";

import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";

export const Message = ({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
}) => {
  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[24px] border rounded-sm p-1 flex flex-col justify-center items-center shrink-0 text-zinc-500">
        {role === "assistant" ? <BotIcon /> : <UserIcon />}
      </div>

      <div className="flex flex-col gap-2 w-full">
        {content && typeof content === "string" && (
          <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
            <Markdown>{content}</Markdown>
          </div>
        )}

        {toolInvocations && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map((toolInvocation) => {
              const { toolName, toolCallId, state } = toolInvocation;
              if (state !== "result") {
                return (
                  <div key={toolCallId} className="text-xs text-zinc-500 italic">
                    {toolName === "tavilySearch" ? "Searching sources..." : `Running ${toolName}...`}
                  </div>
                );
              }
              const { result } = toolInvocation as any;
              if (toolName === "tavilySearch") {
                const results = result?.results || [];
                return (
                  <div key={toolCallId} className="flex flex-col gap-2 rounded-md border p-3 bg-muted/50">
                    <div className="text-xs uppercase tracking-wide text-zinc-500">Sources</div>
                    <ul className="list-disc list-inside flex flex-col gap-1 text-sm">
                      {results.slice(0,4).map((r: any, idx: number) => (
                        <li key={idx} className="truncate">
                          <a href={r.url} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted">
                            {r.title || r.url}
                          </a>
                          {r.snippet && <span className="text-zinc-500"> – {r.snippet}</span>}
                        </li>
                      ))}
                      {results.length === 0 && <li className="text-zinc-500">No results found</li>}
                    </ul>
                  </div>
                );
              }
              return (
                <div key={toolCallId} className="text-xs text-zinc-500">
                  {JSON.stringify(result)}
                </div>
              );
            })}
          </div>
        )}

        {attachments && (
          <div className="flex flex-row gap-2">
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
