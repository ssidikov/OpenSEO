"use client";

import React, { useState } from "react";
import { AlertTriangle, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Code2, Sparkles } from "lucide-react";
import { SeoIssue } from "@/types/seo";

interface IssueItemProps {
  issue: SeoIssue;
  onAskAiToFix?: (issueTitle: string, howToFix: string) => void;
}

export const IssueItem: React.FC<IssueItemProps> = ({ issue, onAskAiToFix }) => {
  const [isOpen, setIsOpen] = useState(issue.severity !== "pass");

  const getSeverityIcon = () => {
    switch (issue.severity) {
      case "critical":
        return <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />;
      case "pass":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />;
    }
  };

  const getSeverityBadge = () => {
    switch (issue.severity) {
      case "critical":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200/60 uppercase tracking-wider">
            Critical
          </span>
        );
      case "warning":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200/60 uppercase tracking-wider">
            Warning
          </span>
        );
      case "pass":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60 uppercase tracking-wider">
            Passed
          </span>
        );
    }
  };

  return (
    <div className={`w-full rounded-xl border transition-all ${
      issue.severity === "critical"
        ? "bg-red-50/20 border-red-200/60 hover:border-red-300"
        : issue.severity === "warning"
        ? "bg-amber-50/20 border-amber-200/60 hover:border-amber-300"
        : "bg-white/70 border-slate-200/70 hover:border-slate-300"
    }`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 flex items-start justify-between cursor-pointer gap-3"
      >
        <div className="flex items-start gap-3">
          {getSeverityIcon()}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-slate-900 text-sm">{issue.title}</h4>
              {getSeverityBadge()}
              {issue.scoreDeduction > 0 && (
                <span className="text-[11px] font-medium text-slate-400">
                  -{issue.scoreDeduction} pts
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{issue.description}</p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-slate-600 p-1 shrink-0">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-200/50 space-y-3">
          {issue.currentValue && (
            <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-700 font-mono border border-slate-200/60 overflow-x-auto">
              <span className="text-slate-400 font-sans font-medium text-[11px] block mb-1">Detected Output:</span>
              {issue.currentValue}
            </div>
          )}

          <div className="bg-blue-50/40 rounded-lg p-3 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <Code2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-xs text-slate-700">
                <span className="font-semibold text-blue-950 block mb-0.5">How to resolve:</span>
                {issue.howToFix}
              </div>
            </div>

            {onAskAiToFix && issue.severity !== "pass" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAskAiToFix(issue.title, issue.howToFix);
                }}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 shadow-2xs transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Ask AI Fix</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
