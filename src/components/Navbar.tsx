"use client";

import React from "react";
import { Sparkles, Github, Search, ExternalLink } from "lucide-react";

interface NavbarProps {
  onNewSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNewSearch }) => {
  return (
    <header className="sticky top-0 z-40 w-full liquid-glass border-b border-slate-200/60 bg-white/75 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div 
          onClick={onNewSearch} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-emerald-400 p-[1px] shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-lg tracking-tight text-slate-900 font-sans">OpenSEO</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60">
                AI Agent
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onNewSearch && (
            <button
              onClick={onNewSearch}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 transition-colors border border-slate-200/70"
            >
              <Search className="w-3.5 h-3.5" />
              New Audit
            </button>
          )}

          <a
            href="https://github.com/ssidikov/OpenSEO"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-700 bg-white/80 hover:bg-slate-50 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all"
          >
            <Github className="w-4 h-4 text-slate-800" />
            <span>Open Source</span>
            <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
          </a>
        </div>
      </div>
    </header>
  );
};
