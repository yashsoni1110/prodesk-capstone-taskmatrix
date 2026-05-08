import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

// Single font → single CSS fetch → one fewer render-blocking request
// display:swap means text stays visible while the font loads (no FOIT)
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  // Only the weights we actually use in the app
  weight: ["400", "500", "600", "700"],
  // Tell next/font to preload the font files on the page
  preload: true,
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
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        {/* Preconnect to Google Fonts origin & CDN — opens the TCP+TLS
            handshake before the font CSS is even discovered, shaving ~100-200ms
            off the render-blocking request on cold loads. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Inline critical CSS — all color tokens used on the login page are
            inlined so text renders immediately without waiting for the external
            stylesheet (~2s on slow connections). This is the primary LCP fix. */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --background:oklch(0.985 0.002 264);
            --foreground:oklch(0.145 0.022 264);
            --primary:oklch(0.52 0.24 268);
            --muted:oklch(0.958 0.006 264);
            --muted-foreground:oklch(0.48 0.04 264);
            --card:oklch(1 0 0);
            --border:oklch(0.882 0.008 264);
            --accent:oklch(0.938 0.012 264);
          }
          .dark {
            --background:oklch(0.095 0.012 264);
            --foreground:oklch(0.945 0.008 264);
            --primary:oklch(0.635 0.22 268);
            --muted:oklch(0.175 0.016 264);
            --muted-foreground:oklch(0.60 0.04 264);
            --card:oklch(0.135 0.016 264);
            --border:oklch(1 0 0 / 7%);
            --accent:oklch(0.205 0.022 264);
          }
          body{background-color:var(--background);color:var(--foreground);margin:0}
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

