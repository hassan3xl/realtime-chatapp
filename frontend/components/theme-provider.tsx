"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes"; // Use type import for safety if strictly typed, but next-themes exports types usually.
// next-themes v0.4+ exports ThemeProviderProps?
// Actually, let's just use React.ComponentProps<typeof NextThemesProvider> if needed, or any.
// Standard shadcn implementation:

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
