import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import { ChatWidget } from "../components/ChatWidget";

export const metadata: Metadata = {
  title: "Nexus OS",
  description: "Palantir Ecosystem Replica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Sidebar />
        <main style={{ marginLeft: '60px', minHeight: '100vh', background: '#10161a' }}>
          {children}
        </main>
        <ChatWidget />
      </body>
    </html>
  );
}
