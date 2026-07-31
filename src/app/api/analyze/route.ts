import { NextRequest, NextResponse } from "next/server";
import { analyzeWebsite } from "@/lib/seo-analyzer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing or invalid URL parameter." }, { status: 400 });
    }

    const report = await analyzeWebsite(url);
    return NextResponse.json(report);
  } catch (error: any) {
    console.error("SEO Audit Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during website analysis." },
      { status: 500 }
    );
  }
}
