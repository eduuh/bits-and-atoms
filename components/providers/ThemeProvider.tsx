"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";
import { QuickReadListProvider, QuickReadListPanel, QuickReadListIndicator } from "@/components/search/QuickReadList";
import { KeyboardShortcutsProvider, KeyboardShortcutsHelp } from "@/components/keyboard/KeyboardShortcuts";
import { PostHogProvider } from "./PostHogProvider";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

interface AppProvidersProps {
  children: React.ReactNode;
  themeProps?: Omit<ThemeProviderProps, "children">;
}

export function AppProviders({ children, themeProps }: AppProvidersProps) {
  return (
    <PostHogProvider>
      <NextThemesProvider {...themeProps}>
        <KeyboardShortcutsProvider>
          <QuickReadListProvider>
            {children}
            <QuickReadListPanel />
            <QuickReadListIndicator />
            <KeyboardShortcutsHelp />
          </QuickReadListProvider>
        </KeyboardShortcutsProvider>
      </NextThemesProvider>
    </PostHogProvider>
  );
}
