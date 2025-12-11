import type { Metadata } from "next";
import "./globals.css";
import NavigationShell from "../components/NavigationShell";
import { ChatWidget } from "../components/ChatWidget";

export const metadata: Metadata = {
  title: "Nexus OS",
  description: "Palantir Ecosystem Replica",
};

import NexusConnect from "@/components/collaboration/NexusConnect";
import ThinkingIndicator from "@/components/ui/ThinkingIndicator";
import { ThinkingProvider } from "@/components/ui/ThinkingContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThinkingProvider>
          <NavigationShell>
            {children}
          </NavigationShell>
          <NexusConnect />
          <ThinkingIndicator />
          <ChatWidget />
        </ThinkingProvider>
      </body>
    </html>
  );
}
