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

