import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

const DEMO_MODE =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_test_placeholder") ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_live_placeholder") ||
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function AuthProvider({ children }: { children: ReactNode }) {
  if (DEMO_MODE) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#18181b",
          colorBackground: "#ffffff",
          colorText: "#18181b",
        },
        layout: {
          logoPlacement: "inside",
          socialButtonsVariant: "iconButton",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
