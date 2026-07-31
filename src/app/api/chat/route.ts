import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { openai, createOpenAI } from "@ai-sdk/openai";

export async function POST(req: NextRequest) {
  try {
    const { messages, seoReport } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const apiKey =
      process.env.OPENROUTER_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback AI simulation stream when environment variable API key is not set
      const lastMessage = messages[messages.length - 1]?.content || "";
      const domain = seoReport?.domain || "website";
      const score = seoReport?.overallScore || 85;

      let reply = `Based on the OpenSEO report for **${domain}** (Current Score: ${score}/100):\n\n`;

      if (lastMessage.toLowerCase().includes("title") || lastMessage.toLowerCase().includes("meta")) {
        reply += `Here is an optimized title and description snippet tailored for **${domain}**:\n\n` +
          `\`\`\`html\n<title>${domain} | Leading Solutions & Digital Excellence</title>\n<meta name="description" content="Discover ${domain}'s premier platform built for speed, performance, and user satisfaction. Explore features today." />\n\`\`\`\n\n` +
          `*Tip: Ensure your primary target keyword appears within the first 30 characters of the title tag.*`;
      } else if (lastMessage.toLowerCase().includes("schema") || lastMessage.toLowerCase().includes("json")) {
        reply += `Here is a complete **Organization Schema.org** JSON-LD snippet for **${domain}**:\n\n` +
          `\`\`\`html\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "${domain}",\n  "url": "https://${domain}",\n  "logo": "https://${domain}/logo.png"\n}\n</script>\n\`\`\``;
      } else if (lastMessage.toLowerCase().includes("fix") || lastMessage.toLowerCase().includes("critical") || lastMessage.toLowerCase().includes("issue")) {
        reply += `To fix your top critical issues on **${domain}**:\n\n` +
          `- **H1 Tag Alignment**: Add a single primary \`<h1>\` tag in your hero section.\n` +
          `- **Image Alt Text**: Ensure all \`<img>\` elements contain non-empty \`alt="..."\` strings.\n` +
          `- **Robots & Sitemap**: Serve a \`/sitemap.xml\` file at your root directory.\n\n` +
          `Would you like me to write a custom Next.js metadata script or HTML code block for any of these?`;
      } else {
        reply += `I analyzed the audit data for **${domain}**. ` +
          `You currently have **${seoReport?.allIssues?.filter((i: any) => i.severity === 'critical')?.length || 0} critical issues** and **${seoReport?.allIssues?.filter((i: any) => i.severity === 'warning')?.length || 0} warnings**.\n\n` +
          `Ask me anything! For instance:\n` +
          `- Generate a Schema.org JSON-LD snippet for my page\n` +
          `- Write an optimized meta title and description\n` +
          `- How do I fix missing H1 tags in Next.js?`;
      }

      // Stream text response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const chunks = reply.split(" ");
          for (const chunk of chunks) {
            controller.enqueue(encoder.encode(chunk + " "));
            await new Promise((resolve) => setTimeout(resolve, 25));
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const systemPrompt = `You are OpenSEO AI Agent, an expert SEO engineer and web architect. You have full context of the user's website SEO report: ${JSON.stringify(seoReport)}.
Answer user queries concisely, provide actionable code snippets in Markdown (HTML, Next.js metadata, Schema.org), and explain SEO concepts clearly.`;

    let model;
    if (process.env.OPENROUTER_API_KEY) {
      // OpenRouter Provider with free model support
      const openrouter = createOpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
        headers: {
          "HTTP-Referer": "https://openseo.dev",
          "X-Title": "OpenSEO AI Agent",
        },
      });
      // Default to high-performing free model meta-llama/llama-3.1-8b-instruct:free
      const selectedModel = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free";
      model = openrouter(selectedModel);
    } else if (process.env.GEMINI_API_KEY) {
      model = google("gemini-1.5-flash");
    } else {
      model = openai("gpt-4o-mini");
    }

    const result = await streamText({
      model,
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (err: any) {
    console.error("AI Chat Error:", err);
    return NextResponse.json({ error: err.message || "Failed to process chat" }, { status: 500 });
  }
}
