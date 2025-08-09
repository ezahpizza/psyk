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
  }
  return (
    <Button variant={enabled ? "secondary" : "outline"} className="py-1 h-fit" onClick={toggle}>
      {enabled ? "Anonymous: On" : "Anonymous: Off"}
    </Button>
  );
}
