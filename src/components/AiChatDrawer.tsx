"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Send, Bot, User, Sparkles, Code, Terminal, Loader2 } from "lucide-react";
import { SeoReport } from "@/types/seo";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  seoReport: SeoReport | null;
  initialPrompt?: string | null;
}

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({
  isOpen,
  onClose,
  seoReport,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello! I'm your **OpenSEO AI Agent**. Ask me anything about ${
        seoReport?.domain || "your website"
      }, such as generating code snippets, writing optimized meta tags, or resolving audit warnings.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendPrompt(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || isSending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: promptText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          seoReport,
        }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMsgContent = "";

      const assistantMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: assistantMsgId, role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantMsgContent += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: assistantMsgContent } : msg
            )
          );
        }
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, I encountered an error answering your question. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs transition-opacity" 
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl h-full shadow-2xl flex flex-col border-l border-slate-200/80">
        {/* Header */}
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center border border-blue-200">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                AI SEO Specialist
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              </h3>
              <p className="text-[11px] text-slate-500">Context: {seoReport?.domain || "Audit Report"}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                  msg.role === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-blue-600 text-white shadow-xs"
                }`}
              >
                {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-10">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>AI Agent is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt chips */}
        <div className="px-4 py-2 bg-slate-50/60 border-t border-slate-200/60 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
          {[
            "Generate Schema.org JSON-LD",
            "Suggest meta description",
            "How to fix H1 tag error?",
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendPrompt(prompt)}
              disabled={isSending}
              className="shrink-0 px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs font-medium transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(input);
          }}
          className="p-3 border-t border-slate-200/80 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI for code fixes or SEO suggestions..."
            className="flex-1 text-xs bg-slate-100/80 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 border border-slate-200/70"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
