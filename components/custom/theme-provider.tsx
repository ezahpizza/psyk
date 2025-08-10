"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import * as React from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  // Avoid rendering until after mount so server/client theme class matches
  if (!mounted) return <div style={{ visibility: "hidden" }} />;
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
