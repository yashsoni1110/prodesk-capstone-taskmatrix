import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TaskMatrix – Modern Project Management",
  description:
    "A powerful Kanban-based project management tool for high-performing software teams. Manage tasks, track progress, and collaborate seamlessly.",
  metadataBase: new URL("https://prodesk-capstone-taskmatrix.vercel.app"),
  openGraph: {
    title: "TaskMatrix – Modern Project Management",
    description: "A powerful Kanban-based project management tool for high-performing software teams.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskMatrix – Modern Project Management",
    description: "A powerful Kanban-based project management tool for high-performing software teams.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Preconnect + DNS prefetch to Supabase — shaves ~150ms off auth RTT.
            Do NOT add a hardcoded font preload here — Next.js hashes the font
            filename on every build, making any manual link instantly stale. */}
        <link rel="preconnect" href="https://eyovndzmjqzzujpuzvwa.supabase.co" />
        <link rel="dns-prefetch" href="https://eyovndzmjqzzujpuzvwa.supabase.co" />

        {/* Inline critical CSS — prevents FOUC and reduces LCP by ensuring
            background/text colours are available before any stylesheet loads. */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root { --background: oklch(0.985 0.002 264); --foreground: oklch(0.145 0.022 264); --primary: oklch(0.52 0.24 268); }
          .dark { --background: oklch(0.095 0.012 264); --foreground: oklch(0.945 0.008 264); --primary: oklch(0.635 0.22 268); }
          body { background-color: var(--background); color: var(--foreground); margin: 0; }
        `}} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
          {/* ── Sonner toast notifications ── */}
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
              duration: 3500,
              style: { fontSize: "13px" },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

