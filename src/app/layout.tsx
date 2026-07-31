import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenSEO | AI Agent Web SEO Analyzer & Audit Engine",
  description:
    "Open-source Next.js application for automated website technical SEO analysis, AI executive summaries, and interactive SEO chat assistant.",
  openGraph: {
    title: "OpenSEO | AI Agent Web SEO Analyzer",
    description: "Automated SEO audits, AI executive summaries, and Q&A chat for your website.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
