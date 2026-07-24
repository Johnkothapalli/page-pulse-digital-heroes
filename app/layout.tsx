import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Page Pulse — Read the page behind the page",
  description:
    "Audit a public URL for status, response time, page metadata, headings, image alt text, and readable word count.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f2eee5",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
