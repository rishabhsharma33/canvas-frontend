"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/lib/auth/auth-store";
import { useBuilderStore } from "@/lib/builder/store";
import { AuthForm } from "./AuthForm";

/** Gates its children behind a session: tries a silent refresh, then shows a login/register form if none. */
export function AuthGate({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    // Covers both the very first (never-logged-in) render and an explicit
    // logout — either way, any previously loaded document must not leak into
    // whichever account signs in next.
    if (status === "unauthenticated") {
      useBuilderStore.getState().resetHydration();
    }
  }, [status]);

  if (status === "idle" || status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <AuthForm />;
  }

  return <>{children}</>;
}
