import type { Metadata } from "next";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/study-os/service-worker";
import { I18nProvider } from "@/components/study-os/i18n";

export const metadata: Metadata = {
  title: "Study OS — Personal Study & Admission Dashboard",
  description: "A private, offline-first command center for study plans, exams, university applications, projects, and deadlines.",
  manifest: "/manifest.webmanifest",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased"><I18nProvider><ServiceWorkerRegistration />{children}</I18nProvider></body>
    </html>
  );
}
