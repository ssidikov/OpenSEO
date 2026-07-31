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
      content: `Hello! I'm your **OpenSEO AI Agent**. Ask me anything about **${
        seoReport?.domain || "your website"
      }**, such as generating code snippets, writing optimized meta tags, or resolving audit warnings.`,
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
          let chunk = decoder.decode(value, { stream: true });

          // Defensive cleanup if chunk contains Vercel AI protocol prefixes (0:"...", e:{...})
          if (/^[0-9]+:"/m.test(chunk)) {
            chunk = chunk
              .split("\n")
              .map((line) => {
                const match = line.match(/^[0-9]+:"(.*)"$/);
                if (match) {
                  return match[1]
                    .replace(/\\n/g, "\n")
                    .replace(/\\"/g, '"')
                    .replace(/\\\\/g, "\\");
                }
                return "";
              })
              .join("");
          }

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

  // Helper to parse inline Markdown (**bold**, *italic*, `inline code`)
  const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    // Regex matching inline code, bold, or italic
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="bg-slate-200/80 text-blue-700 px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold border border-slate-300/60"
          >
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
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i} className="italic text-slate-700">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  // Main Markdown Block & Code Block Renderer
  const renderFormattedContent = (content: string, msgId: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      // Code Block Handling
      if (part.startsWith("```") && part.endsWith("```")) {
        const raw = part.slice(3, -3).trim();
        const lines = raw.split("\n");
        const language = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : "";
        const codeText = language ? lines.slice(1).join("\n") : lines.join("\n");
        const snippetId = `${msgId}-${index}`;

        return (
          <div key={snippetId} className="my-3 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/90 border-b border-slate-700/80 text-[10px] text-slate-400 font-mono">
              <span>{language || "code"}</span>
              <button
                onClick={() => handleCopyCode(codeText, snippetId)}
                className="flex items-center gap-1 hover:text-white transition-colors p-0.5"
              >
                {copiedId === snippetId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-sans">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span className="font-sans">Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 text-[11px] font-mono text-slate-100 overflow-x-auto max-h-48 leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      // Paragraph & Bullet List Handling
      const paragraphs = part.split(/\n\s*\n/);
      return (
        <div key={index} className="space-y-2 my-1">
          {paragraphs.map((p, pIdx) => {
            const lines = p.trim().split("\n");
            const isBulletList = lines.every((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "));

            if (isBulletList && lines.length > 0) {
              return (
                <ul key={pIdx} className="space-y-1.5 my-2 pl-1">
                  {lines.map((line, lIdx) => {
                    const cleanLine = line.trim().replace(/^[-*]\s+/, "");
                    return (
                      <li key={lIdx} className="flex items-start gap-2 text-slate-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span className="flex-1">{parseInlineMarkdown(cleanLine)}</span>
                      </li>
                    );
                  })}
                </ul>
              );
            }

            return (
              <p key={pIdx} className="leading-relaxed">
                {lines.map((line, lIdx) => (
                  <React.Fragment key={lIdx}>
                    {parseInlineMarkdown(line)}
                    {lIdx < lines.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            );
          })}
        </div>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end items-center sm:p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs transition-opacity duration-200 animate-fade-in" 
      />

      {/* Bounded Floating Drawer Container */}
      <div className="relative w-full sm:w-[460px] md:w-[500px] h-full sm:h-[min(630px,calc(100vh-3rem))] bg-white/95 backdrop-blur-2xl shadow-2xl flex flex-col border border-slate-200/90 sm:rounded-3xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center border border-blue-200/60 shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5 tracking-tight">
                AI SEO Specialist
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Domain: {seoReport?.domain || "Audit Context"}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold shadow-2xs ${
                  msg.role === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[88%] px-4 py-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-xs shadow-xs font-medium"
                    : "bg-slate-100/90 text-slate-800 rounded-tl-xs border border-slate-200/70"
                }`}
              >
                {renderFormattedContent(msg.content, msg.id)}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400 pl-9">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>AI Agent is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3.5 py-2 bg-slate-50/80 border-t border-slate-200/60 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar shrink-0">
          <span className="text-slate-400 shrink-0 font-medium">Quick Prompts:</span>
          {[
            "Generate Schema.org JSON-LD",
            "Suggest meta description",
            "Fix H1 tag error",
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendPrompt(prompt)}
              disabled={isSending}
              className="shrink-0 px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs font-medium transition-all text-[11px] disabled:opacity-50"
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
          className="p-3 border-t border-slate-200/80 bg-white flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI for code fixes or SEO suggestions..."
            className="flex-1 text-xs sm:text-sm bg-slate-100/80 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 border border-slate-200/80 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
