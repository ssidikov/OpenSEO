"use client";

import React, { useState } from "react";
import { Bot, Copy, Check, Sparkles, RefreshCw, MessageSquare } from "lucide-react";

interface AiSummaryCardProps {
  summary: string | null;
  isLoading: boolean;
  onRefreshSummary: () => void;
  onOpenChat: () => void;
}

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

  return (
    <div className="w-full liquid-glass-card rounded-2xl p-6 relative overflow-hidden border border-slate-200/80 shadow-glass">
      {/* Decorative gradient glow background */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-blue-400/10 via-sky-300/10 to-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center border border-blue-200/50">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-lg tracking-tight">AI Executive Summary</h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                Live Agent
              </span>
            </div>
            <p className="text-xs text-slate-500">Automated strategic analysis & prioritized action plan</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {summary && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white/80 hover:bg-slate-100 border border-slate-200/80 transition-colors"
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white/80 hover:bg-slate-100 border border-slate-200/80 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Re-Generate</span>
          </button>

          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask AI Agent</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
          </div>
          <p className="text-xs text-slate-500 font-medium">Synthesizing SEO report with AI Agent...</p>
        </div>
      ) : summary ? (
        <div className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed font-sans">
          <div className="whitespace-pre-line text-sm">{summary}</div>
        </div>
      ) : (
        <div className="py-6 text-center text-slate-400 text-xs">
          Click "Re-Generate" to create an AI Executive Summary.
        </div>
      )}
    </div>
  );
};
