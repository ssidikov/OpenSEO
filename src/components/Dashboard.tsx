"use client";

import React, { useState } from "react";
import { SeoReport } from "@/types/seo";
import { CategoryCard } from "./CategoryCard";
import { IssueItem } from "./IssueItem";
import { AiSummaryCard } from "./AiSummaryCard";
import { AiChatDrawer } from "./AiChatDrawer";
import { 
  FileText, 
  Heading, 
  Share2, 
  ShieldCheck, 
  Globe, 
  Clock, 
  Download, 
  MessageSquare,
  Sparkles,
  Search
} from "lucide-react";

interface DashboardProps {
  report: SeoReport;
  summary: string | null;
  isSummaryLoading: boolean;
  onRefreshSummary: () => void;
  onNewSearch: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  report,
  summary,
  isSummaryLoading,
  onRefreshSummary,
  onNewSearch,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState<string | null>(null);

  const categories = [
    { key: "metadata", data: report.categories.metadata, icon: <FileText className="w-4 h-4" /> },
    { key: "content", data: report.categories.content, icon: <Heading className="w-4 h-4" /> },
    { key: "social", data: report.categories.social, icon: <Share2 className="w-4 h-4" /> },
    { key: "technical", data: report.categories.technical, icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  const filteredIssues = report.allIssues.filter((issue) => {
    const categoryMatch = selectedCategory === "all" || issue.category === selectedCategory;
    const severityMatch = severityFilter === "all" || issue.severity === severityFilter;
    return categoryMatch && severityMatch;
  });

  const getScoreColor = (score: number) => {
    if (score >= 85) return "from-emerald-500 to-teal-600 text-emerald-600";
    if (score >= 60) return "from-amber-500 to-orange-600 text-amber-600";
    return "from-red-500 to-rose-600 text-red-600";
  };

  const handleAskAiFix = (issueTitle: string, howToFix: string) => {
    setChatPrompt(`How do I fix this issue for ${report.domain}?: "${issueTitle}". Recommendation: ${howToFix}`);
    setIsChatOpen(true);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `openseo-report-${report.domain}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Header Card */}
      <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-glass flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 w-full md:w-auto">
          {/* Score Circle */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center bg-white border border-slate-200/80 shadow-inner shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={getScoreColor(report.overallScore).split(" ")[2]}
                strokeWidth="3.2"
                strokeDasharray={`${report.overallScore}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-slate-900">
                {report.overallScore}
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Score</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Audited Domain
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-600 shrink-0" />
              <span className="truncate max-w-md">{report.domain}</span>
            </h1>

            <p className="text-xs text-slate-500 flex items-center gap-4">
              <span>Load: <strong className="text-slate-800 font-mono">{report.metrics.loadTimeMs}ms</strong></span>
              <span>Words: <strong className="text-slate-800 font-mono">{report.metrics.wordCount}</strong></span>
              <span>Images: <strong className="text-slate-800 font-mono">{report.metrics.totalImagesCount}</strong></span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={onNewSearch}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>New Search</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI Agent</span>
          </button>
        </div>
      </div>

      {/* AI Summary Card */}
      <AiSummaryCard
        summary={summary}
        isLoading={isSummaryLoading}
        onRefreshSummary={onRefreshSummary}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Category Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.key}
            category={cat.data}
            icon={cat.icon}
            isSelected={selectedCategory === cat.key}
            onClick={() => setSelectedCategory(selectedCategory === cat.key ? "all" : cat.key)}
          />
        ))}
      </div>

      {/* Issues Filter & List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/70">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 text-lg">Detailed Audit Checks</h3>
            <span className="text-xs text-slate-500 font-medium">({filteredIssues.length} items)</span>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Filter:</span>
            {["all", "critical", "warning", "pass"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-full font-medium capitalize transition-all ${
                  severityFilter === sev
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Issue Cards */}
        <div className="space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm liquid-glass-card rounded-2xl">
              No audit checks found matching selected filter.
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <IssueItem 
                key={issue.id} 
                issue={issue} 
                onAskAiToFix={handleAskAiFix} 
              />
            ))
          )}
        </div>
      </div>

      {/* AI Chat Drawer */}
      <AiChatDrawer
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setChatPrompt(null);
        }}
        seoReport={report}
        initialPrompt={chatPrompt}
      />
    </div>
  );
};
