"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import type { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

function MissingConfiguration() {
  const missing = [
    !clerkKey && "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    !convexUrl && "NEXT_PUBLIC_CONVEX_URL",
  ].filter((name): name is string => Boolean(name));

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md rounded-xl border border-line bg-surface p-8 shadow-panel">
        <h1 className="font-display text-2xl font-semibold text-ink">Effi needs configuration</h1>
        <p className="mt-3 text-sm leading-relaxed text-graphite">
          Copy <code className="rounded bg-fog px-1.5 py-0.5 font-mono text-xs">apps/officer-dashboard/.env.example</code> to{" "}
          <code className="rounded bg-fog px-1.5 py-0.5 font-mono text-xs">.env.local</code> and set:
        </p>
        <ul className="mt-3 list-inside list-disc space-y-1 font-mono text-xs text-ink">
          {missing.map((key) => (
            <li key={key}>{key}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}

function ConvexProvider({ children }: { children: ReactNode }) {
  if (!convex) return children;
  return <ConvexProviderWithClerk client={convex} useAuth={useAuth}>{children}</ConvexProviderWithClerk>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  if (!clerkKey || !convex) return <MissingConfiguration />;
  return <ClerkProvider><ConvexProvider>{children}</ConvexProvider></ClerkProvider>;
}

