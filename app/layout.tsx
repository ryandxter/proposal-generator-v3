import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Proposal Generator - Streamline Your Business Proposals",
  description:
    "Generate professional business proposals with customizable templates, automated pricing, and PDF export. Simplify your proposal creation process.",
  generator: "v0.app",
  keywords: ["proposal generator", "business proposals", "quotation", "partnership", "PDF generator", "template"],
  authors: [{ name: "Proposal Generator Team" }],
  openGraph: {
    title: "Proposal Generator",
    description: "Streamline your business proposal creation process",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AuthProvider>
              <div className="min-h-screen bg-background">{children}</div>
            </AuthProvider>
            <Toaster />
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
