"use client";
import { useEffect, useState } from "react";

import { Button } from "../ui/button";

export function AnonymousToggle() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    setEnabled(localStorage.getItem("anonymousMode") === "true");
  }, []);
  function toggle() {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem("anonymousMode", String(next));
    if (next && !localStorage.getItem("anonId")) {
      localStorage.setItem("anonId", crypto.randomUUID());
    }
    // Notify other components (History, Chat etc.) that mode changed
    window.dispatchEvent(new Event("anonymous-mode-changed"));
  }
  return (
    <Button
      variant={enabled ? "secondary" : "outline"}
      className="py-1 h-fit text-xs md:text-sm"
      onClick={toggle}
      title="Toggle anonymous mode"
    >
      <span className="hidden md:inline">{enabled ? "Anonymous: On" : "Anonymous: Off"}</span>
      <span className="md:hidden">{enabled ? "Anon On" : "Anon Off"}</span>
    </Button>
  );
}
