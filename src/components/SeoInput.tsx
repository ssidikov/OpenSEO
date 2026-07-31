"use client";

import React, { useState } from "react";
import { Search, Globe, ArrowRight, Loader2, Sparkles } from "lucide-react";

interface SeoInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export const SeoInput: React.FC<SeoInputProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a website URL");
      return;
    }
    setError("");
    onAnalyze(url.trim());
  };

  const handlePreset = (presetUrl: string) => {
    setUrl(presetUrl);
    setError("");
    onAnalyze(presetUrl);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <form onSubmit={handleSubmit} className="w-full relative group">
        <div className="relative flex items-center liquid-glass-input rounded-2xl p-2 pl-4 border border-slate-200/90 shadow-glass">
          <Globe className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL (e.g. vercel.com or stripe.com)"
            disabled={isLoading}
            className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-base focus:outline-none py-2 pr-2"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-medium text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Analyze Site</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="absolute -bottom-6 left-4 text-xs font-medium text-red-500">
            {error}
          </p>
        )}
      </form>

      <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
        <span className="text-xs text-slate-400 font-medium">Try instant demo:</span>
        {[
          { name: "vercel.com", url: "https://vercel.com" },
          { name: "nextjs.org", url: "https://nextjs.org" },
          { name: "stripe.com", url: "https://stripe.com" },
        ].map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => handlePreset(preset.url)}
            disabled={isLoading}
            className="px-3 py-1 rounded-full text-xs font-medium text-slate-600 bg-white/80 hover:bg-slate-100 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all disabled:opacity-50"
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
};
