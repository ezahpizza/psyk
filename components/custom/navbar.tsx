"use client";
import React from "react";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";

import { AnonymousToggle } from "./anonymous-toggle";
import { History } from "./history";
import { SlashIcon } from "./icons";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

export const Navbar = () => {
  const { user } = useUser();
  return (
    <>
      <div className="bg-background fixed top-0 left-0 w-full py-2 px-3 flex flex-row items-center justify-between z-30 gap-2 md:gap-4">
        <div className="flex flex-row gap-2 md:gap-3 items-center min-w-0">
          <History user={user ? { id: user.id, email: user.primaryEmailAddress?.emailAddress } : undefined} />
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

        <SignedIn>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="py-1.5 px-2 h-fit font-normal"
                variant="secondary"
              >
                <UserButton afterSignOutUrl="/" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <ThemeToggle />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SignedIn>
        <SignedOut>
          <div className="flex flex-row gap-2 items-center">
            <ThemeToggle />
            <SignInButton mode="modal">
              <Button className="py-1.5 px-2 h-fit font-normal text-white">Login</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="py-1.5 px-2 h-fit font-normal" variant="outline">Sign Up</Button>
            </SignUpButton>
          </div>
        </SignedOut>
      </div>
    </>
  );
};
