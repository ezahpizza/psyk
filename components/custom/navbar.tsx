import Image from "next/image";
import Link from "next/link";

import { auth, signOut } from "@/app/(auth)/auth";

import { AnonymousToggle } from "./anonymous-toggle";
import { History } from "./history";
import { SlashIcon } from "./icons";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const Navbar = async () => {
  let session = await auth();

  return (
    <>
      <div className="bg-background fixed top-0 left-0 w-full py-2 px-3 flex flex-row items-center justify-between z-30 gap-2 md:gap-4">
        <div className="flex flex-row gap-2 md:gap-3 items-center min-w-0">
          <History user={session?.user} />
          <AnonymousToggle />
        </div>
        <div className="flex flex-row gap-2 items-center min-w-0 flex-1 justify-center md:justify-start">
          <Image
            src="/images/gemini-logo.png"
            height={20}
            width={20}
            alt="gemini logo"
            className="shrink-0"
          />
          <div className="text-zinc-500 shrink-0">
            <SlashIcon size={16} />
          </div>
          <div className="text-xs md:text-sm dark:text-zinc-300 truncate w-32 md:w-auto">
            Psyk Mental Health Companion
          </div>
        </div>

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="py-1.5 px-2 h-fit font-normal"
                variant="secondary"
              >
                {session.user?.email}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <ThemeToggle />
              </DropdownMenuItem>
              <DropdownMenuItem className="p-1 z-50">
                <form
                  className="w-full"
                  action={async () => {
                    "use server";

                    await signOut({
                      redirectTo: "/",
                    });
                  }}
                >
                  <button
                    type="submit"
                    className="w-full text-left px-1 py-0.5 text-red-500"
                  >
                    Sign out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex flex-row gap-2 items-center">
            <ThemeToggle />
            <Button className="py-1.5 px-2 h-fit font-normal text-white" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
