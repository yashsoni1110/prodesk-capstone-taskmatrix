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
        {/* Preload fonts for better LCP */}
        <link
          rel="preload"
          href="/_next/static/media/c9a5bc6a7c948935-s.p.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Preconnect to Supabase for faster auth */}
        <link rel="preconnect" href="https://eyovndzmjqzzujpuzvwa.supabase.co" />
        
        {/* Inline critical CSS variables to eliminate render-blocking delay for initial paint */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root { --background: oklch(0.095 0.012 264); --foreground: oklch(0.945 0.008 264); --primary: oklch(0.635 0.22 268); }
          body { background-color: oklch(0.095 0.012 264); color: oklch(0.945 0.008 264); }
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

