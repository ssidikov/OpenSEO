"use client";

import React, { useState } from "react";
import { Sparkles, Bot } from "lucide-react";
import { AiChatDrawer } from "./AiChatDrawer";
import { SeoReport } from "@/types/seo";

interface StickyChatWidgetProps {
  seoReport?: SeoReport | null;
}

export const StickyChatWidget: React.FC<StickyChatWidgetProps> = ({ seoReport = null }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Sticky Liquid Glass Floating Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-xl shadow-slate-950/5 hover:shadow-2xl hover:border-blue-300 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          {/* Glowing pulse dot indicator */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
          </span>

          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-2xs group-hover:rotate-12 transition-transform">
            <Bot className="w-4 h-4" />
          </div>

          <div className="flex flex-col items-start pr-1">
            <span className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1">
              Chat with AI Agent
              <Sparkles className="w-3 h-3 text-blue-600" />
            </span>
          </div>
        </button>
      </div>

      {/* AI Chat Drawer */}
      <AiChatDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        seoReport={seoReport}
      />
    </>
  );
};
