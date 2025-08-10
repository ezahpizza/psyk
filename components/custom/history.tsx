"use client";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import cx from "classnames";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { User } from "next-auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

import { fetcher, getTitleFromChat } from "@/lib/utils";

import { InfoIcon, MenuIcon, MoreHorizontalIcon, PencilEditIcon, TrashIcon } from "./icons";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";

interface Chat { id: string; userId?: string; anonId?: string; messages: any[] }

export const History = ({ user }: { user: User | undefined }) => {
  const { id } = useParams();
  const pathname = usePathname();
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [anonymousMode, setAnonymousMode] = useState(false);
  const [anonId, setAnonId] = useState<string | null>(null);
  useEffect(() => {
    function updateFromStorage() {
      const mode = localStorage.getItem("anonymousMode") === "true";
      setAnonymousMode(mode);
      let stored = localStorage.getItem("anonId");
      if (mode && !stored) {
        stored = crypto.randomUUID();
        localStorage.setItem("anonId", stored);
      }
      setAnonId(stored);
    }
    updateFromStorage();
    window.addEventListener("anonymous-mode-changed", updateFromStorage);
    window.addEventListener("storage", updateFromStorage);
    return () => {
      window.removeEventListener("anonymous-mode-changed", updateFromStorage);
      window.removeEventListener("storage", updateFromStorage);
    };
  }, []);
  const { data: history, isLoading, mutate } = useSWR<Array<Chat>>(
    anonymousMode ? (anonId ? `/api/history?anonId=${anonId}` : null) : user ? "/api/history" : null,
    fetcher,
    { fallbackData: [] },
  );
  useEffect(() => { mutate(); }, [pathname, mutate]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const handleDelete = async () => {
    const endpoint = anonymousMode && anonId ? `/api/chat?id=${deleteId}&anonId=${anonId}` : `/api/chat?id=${deleteId}`;
    const deletePromise = fetch(endpoint, { method: "DELETE" });
    toast.promise(deletePromise, {
      loading: "Deleting chat...",
      success: () => { mutate((h) => h?.filter((c) => c.id !== deleteId)); return "Chat deleted"; },
      error: "Failed to delete chat",
    });
    setShowDeleteDialog(false);
  };
  return (
    <>
      <Button variant="outline" className="p-1.5 h-fit" onClick={() => setIsHistoryVisible(true)}>
        <MenuIcon />
      </Button>
      <Sheet open={isHistoryVisible} onOpenChange={setIsHistoryVisible}>
        <SheetContent side="left" className="p-3 w-80 bg-muted">
          <SheetHeader>
            <VisuallyHidden.Root>
              <SheetTitle className="text-left">History</SheetTitle>
              <SheetDescription className="text-left">{history === undefined ? "loading" : history.length} chats</SheetDescription>
            </VisuallyHidden.Root>
          </SheetHeader>
          <div className="text-sm flex flex-row items-center justify-between">
            <div className="flex flex-row gap-2">
              <div className="dark:text-zinc-300">History</div>
              <div className="dark:text-zinc-400 text-zinc-500">{history === undefined ? "loading" : history.length} chats</div>
            </div>
          </div>
          <div className="mt-10 flex flex-col">
            {(user || anonymousMode) && (
              <Button className="font-normal text-sm flex flex-row justify-between text-white" asChild>
                <Link href="/">
                  <div>Start a new chat</div>
                  <PencilEditIcon size={14} />
                </Link>
              </Button>
            )}
            <div className="flex flex-col overflow-y-scroll p-1 h-[calc(100dvh-124px)]">
              {!user && !anonymousMode && (
                <div className="text-zinc-500 h-dvh w-full flex flex-row justify-center items-center text-sm gap-2">
                  <InfoIcon />
                  <div>Login to save and revisit previous chats!</div>
                </div>
              )}
              {!isLoading && history?.length === 0 && (user || anonymousMode) && (
                <div className="text-zinc-500 h-dvh w-full flex flex-row justify-center items-center text-sm gap-2">
                  <InfoIcon />
                  <div>No chats found</div>
                </div>
              )}
              {isLoading && (user || anonymousMode) && (
                <div className="flex flex-col">
                  {[44, 32, 28, 52].map((item) => (
                    <div key={item} className="p-2 my-[2px]">
                      <div className="w-full h-[20px] rounded-md bg-zinc-200 dark:bg-zinc-600 animate-pulse" />
                    </div>
                  ))}
                </div>
              )}
              {history?.map((chat) => (
                <div key={chat.id} className={cx("flex flex-row items-center gap-6 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md pr-2", { "bg-zinc-200 dark:bg-zinc-700": chat.id === id })}>
                  <Button variant="ghost" className="hover:bg-zinc-200 dark:hover:bg-zinc-700 justify-between p-0 text-sm font-normal flex flex-row items-center gap-2 pr-2 w-full transition-none" asChild>
                    <Link href={`/chat/${chat.id}`} className="text-ellipsis overflow-hidden text-left py-2 pl-2 rounded-lg outline-zinc-900">
                      {getTitleFromChat(chat as any)}
                    </Link>
                  </Button>
                  <DropdownMenu modal>
                    <DropdownMenuTrigger asChild>
                      <Button className="p-0 h-fit font-normal text-zinc-500 transition-none hover:bg-zinc-200 dark:hover:bg-zinc-700" variant="ghost">
                        <MoreHorizontalIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="left" className="z-[60]">
                      <DropdownMenuItem asChild>
                        <Button className="flex flex-row gap-2 items-center justify-start w-full h-fit font-normal p-1.5 rounded-sm" variant="ghost" onClick={() => { setDeleteId(chat.id); setShowDeleteDialog(true); }}>
                          <TrashIcon />
                          <div>Delete</div>
                        </Button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete your chat and remove it from our servers.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
