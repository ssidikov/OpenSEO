"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Send, Bot, User, Sparkles, Loader2, Copy, Check } from "lucide-react";
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Simple Markdown Code block renderer for clean presentation
  const renderFormattedContent = (content: string, msgId: string) => {
    if (!content.includes("```")) {
      return <div className="whitespace-pre-wrap leading-relaxed">{content}</div>;
    }

    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.slice(3, -3).trim().split("\n");
        const language = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : "";
        const codeText = language ? lines.slice(1).join("\n") : lines.join("\n");
        const snippetId = `${msgId}-${index}`;

        return (
          <div key={snippetId} className="my-3 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 border-b border-slate-700 text-[11px] text-slate-400 font-mono">
              <span>{language || "code"}</span>
              <button
                onClick={() => handleCopyCode(codeText, snippetId)}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                {copiedId === snippetId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 text-xs font-mono text-slate-100 overflow-x-auto leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }
      return (
        <div key={index} className="whitespace-pre-wrap leading-relaxed">
          {part}
        </div>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-950/25 backdrop-blur-xs transition-opacity duration-300 animate-fade-in" 
      />

      {/* Drawer Container: Responsive Sizing */}
      <div className="relative w-full sm:w-[540px] md:w-[620px] lg:w-[680px] bg-white/95 backdrop-blur-2xl h-full shadow-2xl flex flex-col border-l border-slate-200/80 animate-fade-in">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center border border-blue-200/60 shadow-2xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base flex items-center gap-1.5 tracking-tight">
                AI SEO Specialist
                <Sparkles className="w-4 h-4 text-blue-600" />
              </h3>
              <p className="text-xs text-slate-500 font-medium">Domain: {seoReport?.domain || "Audit Context"}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold shadow-2xs ${
                  msg.role === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 text-[13px] sm:text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none shadow-sm"
                    : "bg-slate-100/90 text-slate-800 rounded-tl-none border border-slate-200/70"
                }`}
              >
                {renderFormattedContent(msg.content, msg.id)}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-400 pl-11">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>AI Agent is analyzing report...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-5 py-2.5 bg-slate-50/80 border-t border-slate-200/60 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-slate-400 shrink-0 text-[11px] font-medium">Quick Prompts:</span>
          {[
            "Generate Schema.org JSON-LD",
            "Suggest meta description",
            "How to fix H1 heading error?",
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendPrompt(prompt)}
              disabled={isSending}
              className="shrink-0 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs font-medium transition-all text-xs disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(input);
          }}
          className="p-4 border-t border-slate-200/80 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI for code fixes or SEO recommendations..."
            className="flex-1 text-xs sm:text-sm bg-slate-100/80 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 border border-slate-200/80 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all shadow-sm shadow-blue-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
