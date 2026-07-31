"use client";

import React, { useState, useEffect } from "react";
import { Bot, Copy, Check, Sparkles, RefreshCw, MessageSquare, AlertCircle, AlertTriangle, Zap, CheckCircle2, Terminal } from "lucide-react";

interface AiSummaryCardProps {
  summary: string | null;
  isLoading: boolean;
  onRefreshSummary: () => void;
  onOpenChat: () => void;
}

// Claude Code Style AI Agent Loading Component
const ClaudeThinkingLoader: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const [seconds, setSeconds] = useState(0.0);

  const thinkingSteps = [
    { label: "Inspecting metadata & OpenGraph tags...", tool: "parse_meta" },
    { label: "Auditing heading hierarchy & content depth...", tool: "audit_structure" },
    { label: "Evaluating crawlability & robots.txt rules...", tool: "check_technical" },
    { label: "Synthesizing high-impact recommendations...", tool: "ai_synthesis" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => parseFloat((prev + 0.1).toFixed(1)));
    }, 100);

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % thinkingSteps.length);
    }, 1200);

    return () => {
      clearInterval(timer);
      clearInterval(stepInterval);
    };
  }, []);

  const currentStep = thinkingSteps[stepIndex];

  return (
    <div className="my-2 rounded-2xl bg-slate-950 text-slate-100 font-mono border border-slate-800 shadow-xl overflow-hidden relative p-4 sm:p-5 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-slate-400 text-[11px] font-sans font-semibold ml-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            Claude Agent Executing
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400 font-bold">
            {seconds.toFixed(1)}s
          </span>
        </div>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="flex items-center gap-2.5 text-amber-400">
          <span className="animate-spin text-amber-400 text-sm">✽</span>
          <span className="font-semibold text-slate-200">Thinking...</span>
          <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-mono">
            {currentStep.tool}
          </span>
        </div>

        <div className="pl-6 flex items-center gap-2 text-slate-300 text-[12px]">
          <span className="text-amber-400 font-bold">❯</span>
          <span className="animate-pulse">{currentStep.label}</span>
        </div>
      </div>
    </div>
  );
};

export const AiSummaryCard: React.FC<AiSummaryCardProps> = ({
  summary,
  isLoading,
  onRefreshSummary,
  onOpenChat,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to parse inline Markdown (**bold**, `code`)
  const parseInline = (text: string): React.ReactNode[] => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="bg-slate-200/80 text-blue-700 font-mono text-[11px] px-1.5 py-0.5 rounded font-semibold border border-slate-300/50">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-slate-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Structured Markdown Renderer for Executive Summary
  const renderSummaryContent = (rawText: string) => {
    const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);

    const elements: React.ReactNode[] = [];
    let currentParagraphs: string[] = [];
    let keyFindings: { icon: string; text: string }[] = [];
    let recommendations: { step: number; title: string; desc: string }[] = [];

    lines.forEach((line) => {
      // H3 or Main Section Header
      if (line.startsWith("###") || line.startsWith("##")) {
        const headerText = line.replace(/^#+\s*/, "");
        elements.push(
          <div key={`head-${headerText}`} className="pb-2 mb-3 border-b border-slate-200/80">
            <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              {parseInline(headerText)}
            </h4>
          </div>
        );
        return;
      }

      if (line.startsWith("**Key Audit Findings") || line.startsWith("Key Audit Findings")) {
        return;
      }

      if (line.startsWith("**High Impact Recommendations") || line.startsWith("High Impact Recommendations")) {
        return;
      }

      // Bullet findings (- 🚨 0 Critical Issues, - ⚠️ 2 Warnings, etc.)
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const itemText = line.replace(/^[-*]\s+/, "");
        let icon = "info";
        if (itemText.includes("🚨") || itemText.toLowerCase().includes("critical")) icon = "critical";
        else if (itemText.includes("⚠️") || itemText.toLowerCase().includes("warning")) icon = "warning";
        else if (itemText.includes("⚡") || itemText.toLowerCase().includes("load") || itemText.toLowerCase().includes("latency")) icon = "latency";

        keyFindings.push({ icon, text: itemText.replace(/[🚨⚠️⚡]\s*/, "") });
        return;
      }

      // Numbered Recommendations (1. **Fix Missing Metadata**: Description...)
      const numMatch = line.match(/^(\d+)\.\s*(.*)/);
      if (numMatch) {
        const step = parseInt(numMatch[1], 10);
        const rest = numMatch[2];
        const titleMatch = rest.match(/\*\*(.*?)\*\*:\s*(.*)/);

        if (titleMatch) {
          recommendations.push({
            step,
            title: titleMatch[1],
            desc: titleMatch[2],
          });
        } else {
          recommendations.push({
            step,
            title: `Action Item ${step}`,
            desc: rest,
          });
        }
        return;
      }

      currentParagraphs.push(line);
    });

    return (
      <div className="space-y-6">
        {/* Overview Paragraphs */}
        {currentParagraphs.length > 0 && (
          <div className="space-y-2 text-slate-700 text-xs sm:text-sm leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
            {currentParagraphs.map((p, idx) => (
              <p key={idx}>{parseInline(p)}</p>
            ))}
          </div>
        )}

        {/* Key Findings Bento Badges */}
        {keyFindings.length > 0 && (
          <div className="space-y-2.5">
            <h5 className="text-xs uppercase tracking-wider font-bold text-slate-400">Key Audit Findings</h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {keyFindings.map((finding, fIdx) => {
                const isCritical = finding.icon === "critical";
                const isWarning = finding.icon === "warning";
                const isLatency = finding.icon === "latency";

                return (
                  <div
                    key={fIdx}
                    className={`flex items-center gap-3 p-3 rounded-xl border backdrop-blur-md transition-all ${
                      isCritical
                        ? finding.text.includes("0 Critical")
                          ? "bg-emerald-50/60 border-emerald-200/80 text-emerald-900"
                          : "bg-red-50/60 border-red-200/80 text-red-900"
                        : isWarning
                        ? "bg-amber-50/60 border-amber-200/80 text-amber-900"
                        : "bg-blue-50/60 border-blue-200/80 text-blue-900"
                    }`}
                  >
                    <div className="shrink-0">
                      {isCritical ? (
                        finding.text.includes("0 Critical") ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )
                      ) : isWarning ? (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      ) : (
                        <Zap className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="text-xs leading-snug font-medium">
                      {parseInline(finding.text)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Numbered Recommendations Cards */}
        {recommendations.length > 0 && (
          <div className="space-y-3 pt-1">
            <h5 className="text-xs uppercase tracking-wider font-bold text-slate-400">Priority Roadmap</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.step}
                  className="liquid-glass-card rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between gap-2.5 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-blue-600/10 text-blue-600 font-mono font-bold text-xs flex items-center justify-center border border-blue-200/60 shrink-0">
                      0{rec.step}
                    </span>
                    <div>
                      <h6 className="font-semibold text-slate-900 text-xs sm:text-sm tracking-tight mb-1">
                        {rec.title}
                      </h6>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {parseInline(rec.desc)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full liquid-glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-200/80 shadow-glass">
      {/* Decorative ambient gradient glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-blue-400/10 via-sky-300/10 to-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center border border-blue-200/60 shadow-2xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-lg tracking-tight">AI Executive Summary</h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                Live Agent
              </span>
            </div>
            <p className="text-xs text-slate-500">Automated strategic analysis & prioritized action plan</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {summary && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 bg-white/80 hover:bg-slate-100 border border-slate-200/80 transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onRefreshSummary}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 bg-white/80 hover:bg-slate-100 border border-slate-200/80 transition-colors disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Re-Generate</span>
          </button>

          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask AI Agent</span>
          </button>
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <ClaudeThinkingLoader />
      ) : summary ? (
        renderSummaryContent(summary)
      ) : (
        <div className="py-8 text-center text-slate-400 text-xs">
          Click "Re-Generate" to synthesize an AI Executive Summary.
        </div>
      )}
    </div>
  );
};
