"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { SeoInput } from "@/components/SeoInput";
import { Dashboard } from "@/components/Dashboard";
import { SeoReport } from "@/types/seo";
import { 
  Sparkles, 
  Bot, 
  Search, 
  BarChart3, 
  ShieldCheck, 
  Code2, 
  Zap,
  CheckCircle2,
  ArrowRight,
  Globe
} from "lucide-react";

export default function Home() {
  const [report, setReport] = useState<SeoReport | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAiSummary = async (auditReport: SeoReport) => {
    setIsSummaryLoading(true);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report: auditReport }),
      });
      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (e) {
      console.error("Failed to fetch summary:", e);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setReport(null);
    setSummary(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze website.");
      }

      setReport(data);
      fetchAiSummary(data);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-slate-900 font-sans flex flex-col antialiased">
      <Navbar onNewSearch={report ? () => setReport(null) : undefined} />

      <main className="flex-1">
        {!report ? (
          <div className="space-y-16 pb-20">
            {/* Hero Section */}
            <section className="relative pt-16 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
              {/* Subtle Ambient Light Gradient */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-300/20 via-sky-200/20 to-emerald-300/15 blur-3xl rounded-full pointer-events-none -z-10" />

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill border border-slate-200/80 shadow-2xs mb-8">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-semibold text-slate-700">Open Source Next.js AI SEO Agent</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
                Automated Technical SEO. <br />
                <span className="bg-gradient-to-r from-blue-600 via-sky-600 to-emerald-600 bg-clip-text text-transparent">
                  Powered by Autonomous AI.
                </span>
              </h1>

              <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-10">
                Audit meta tags, canonicals, H1 structure, OpenGraph cards, and robots.txt in seconds. Interact live with an AI Agent to rewrite code and rank higher.
              </p>

              {/* URL Input */}
              <SeoInput onAnalyze={handleAnalyze} isLoading={isLoading} />

              {errorMessage && (
                <div className="max-w-lg mx-auto mt-6 p-4 rounded-2xl bg-red-50/80 border border-red-200/80 text-xs font-medium text-red-600 text-center shadow-xs">
                  {errorMessage}
                </div>
              )}
            </section>

            {/* Feature Bento Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h2 className="text-xs uppercase tracking-widest font-bold text-blue-600 mb-2">Engine Features</h2>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">Everything needed for top-tier search performance</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Bento Card 1 */}
                <div className="liquid-glass-card rounded-3xl p-6 border border-slate-200/80 shadow-glass space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center border border-blue-200/50">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg">Interactive AI Chat</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ask the AI agent directly about your report to get custom Next.js metadata scripts, Schema.org JSON-LD, or keyword recommendations.
                  </p>
                </div>

                {/* Bento Card 2 */}
                <div className="liquid-glass-card rounded-3xl p-6 border border-slate-200/80 shadow-glass space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center border border-emerald-200/50">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg">Technical Crawlability</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Detect missing `robots.txt`, `sitemap.xml`, broken HTTPS configurations, and canonical tag mismatches instantly.
                  </p>
                </div>

                {/* Bento Card 3 */}
                <div className="liquid-glass-card rounded-3xl p-6 border border-slate-200/80 shadow-glass space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-600/10 text-amber-600 flex items-center justify-center border border-amber-200/50">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg">Executive Summaries</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Generates automated executive digests prioritizing high-impact action items with exact deduction metrics.
                  </p>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <Dashboard
            report={report}
            summary={summary}
            isSummaryLoading={isSummaryLoading}
            onRefreshSummary={() => fetchAiSummary(report)}
            onNewSearch={() => setReport(null)}
          />
        )}
      </main>

      <footer className="w-full liquid-glass border-t border-slate-200/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} OpenSEO. Open-source AI Agent Auditor.</p>
          <div className="flex items-center gap-4 text-slate-600">
            <span>Built with Next.js & Vercel AI SDK</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
