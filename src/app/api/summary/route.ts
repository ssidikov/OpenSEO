import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { SeoReport } from "@/types/seo";

export async function POST(req: NextRequest) {
  try {
    const { report }: { report: SeoReport } = await req.json();

    if (!report) {
      return NextResponse.json({ error: "Missing SEO report." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Local AI template summary generator when no API key is configured
      const criticalCount = report.allIssues.filter((i) => i.severity === "critical").length;
      const warningCount = report.allIssues.filter((i) => i.severity === "warning").length;

      const summaryText = `### Executive Summary for ${report.domain}\n\n` +
        `OpenSEO completed an automated technical and content audit for **${report.domain}**, resulting in an overall SEO health score of **${report.overallScore}/100**.\n\n` +
        `**Key Audit Findings:**\n` +
        `- 🚨 **${criticalCount} Critical Issues** requiring immediate attention.\n` +
        `- ⚠️ **${warningCount} Warnings** that could boost search rankings when resolved.\n` +
        `- ⚡ **Page Load Latency:** ${report.metrics.loadTimeMs}ms.\n\n` +
        `**High Impact Recommendations:**\n` +
        `1. **Fix Missing Metadata**: Ensure both primary title and meta description tags are present with targeted keywords.\n` +
        `2. **Heading Architecture**: Verify that exactly one H1 tag is used for the primary page topic.\n` +
        `3. **Accessibility & Media**: Add descriptive alt text to missing image attributes.\n` +
        `4. **Crawlability**: Ensure both robots.txt and sitemap.xml are accessible at domain root.`;

      return NextResponse.json({ summary: summaryText });
    }

    // Call AI provider if API key present
    const prompt = `You are a world-class Senior SEO Consultant and AI Specialist. Analyze the following structured web SEO report and provide a concise, high-impact Executive Summary in Markdown:
    
Domain: ${report.domain}
Overall Score: ${report.overallScore}/100
Load Time: ${report.metrics.loadTimeMs}ms
Word Count: ${report.metrics.wordCount}
Issues: ${JSON.stringify(report.allIssues, null, 2)}

Provide:
1. Executive Overview (2-3 sentences)
2. Top 3 Highest Impact Action Items (bulleted with bold titles and exact code fix instructions)
3. Strategic Growth Opportunity (1 sentence)`;

    const model = process.env.GEMINI_API_KEY
      ? google("gemini-1.5-flash")
      : openai("gpt-4o-mini");

    const { text } = await generateText({
      model,
      prompt,
    });

    return NextResponse.json({ summary: text });
  } catch (err: any) {
    console.error("AI Summary Error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate AI summary" }, { status: 500 });
  }
}
