import * as cheerio from "cheerio";
import { SeoIssue, SeoReport, SeoMetrics, SeoCategoryResult } from "@/types/seo";

export async function analyzeWebsite(targetUrl: string): Promise<SeoReport> {
  // Normalize URL
  let parsedUrl: URL;
  try {
    const formatted = targetUrl.startsWith("http://") || targetUrl.startsWith("https://")
      ? targetUrl
      : `https://${targetUrl}`;
    parsedUrl = new URL(formatted);
  } catch {
    throw new Error("Invalid URL provided. Please enter a valid web address.");
  }

  const startTime = Date.now();
  
  // Fetch HTML content with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  let response: Response;
  let html = "";
  try {
    response = await fetch(parsedUrl.href, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OpenSEO/1.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    html = await response.text();
  } catch (err: any) {
    clearTimeout(timeoutId);
    const msg = err.name === "AbortError" ? "Request timed out after 12 seconds" : (err.message || "Network request failed");
    throw new Error(`Failed to fetch website (${msg}). Make sure the URL is valid and publicly reachable.`);
  }
  clearTimeout(timeoutId);
  const loadTimeMs = Date.now() - startTime;

  const $ = cheerio.load(html);

  // Extract core HTML elements
  const title = $("title").first().text().trim();
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim();
  const canonicalUrl = $('link[rel="canonical"]').attr("href")?.trim();
  const robotsMeta = $('meta[name="robots"]').attr("content")?.trim();

  // Headings
  const h1Tags: string[] = [];
  $("h1").each((_, el) => {
    const txt = $(el).text().trim();
    if (txt) h1Tags.push(txt);
  });
  const h2Count = $("h2").length;
  const h3Count = $("h3").length;

  // Images
  const totalImagesCount = $("img").length;
  const imagesWithoutAlt: string[] = [];
  $("img").each((_, el) => {
    const alt = $(el).attr("alt");
    const src = $(el).attr("src") || "unnamed image";
    if (alt === undefined || alt === null || alt.trim() === "") {
      if (imagesWithoutAlt.length < 10) {
        imagesWithoutAlt.push(src);
      }
    }
  });
  const missingAltImagesCount = $("img:not([alt]), img[alt='']").length;

  // Social / OpenGraph
  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim();
  const ogDescription = $('meta[property="og:description"]').attr("content")?.trim();
  const ogImage = $('meta[property="og:image"]').attr("content")?.trim();
  const twitterCard = $('meta[name="twitter:card"]').attr("content")?.trim() ||
    $('meta[name="twitter:title"]').attr("content")?.trim();

  // Links
  let internalLinksCount = 0;
  let externalLinksCount = 0;
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    if (href.startsWith("#") || href.startsWith("javascript:")) return;
    if (href.startsWith("/") || href.includes(parsedUrl.hostname)) {
      internalLinksCount++;
    } else if (href.startsWith("http://") || href.startsWith("https://")) {
      externalLinksCount++;
    }
  });

  // Word count estimation
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText ? bodyText.split(" ").length : 0;

  // Check robots.txt & sitemap.xml safely with manual timeout
  let hasRobotsTxt = false;
  let hasSitemap = false;

  try {
    const robotsUrl = new URL("/robots.txt", parsedUrl.origin).href;
    const rCtrl = new AbortController();
    const rTid = setTimeout(() => rCtrl.abort(), 3000);
    const robotsRes = await fetch(robotsUrl, { method: "GET", signal: rCtrl.signal, redirect: "follow" });
    clearTimeout(rTid);
    hasRobotsTxt = robotsRes.ok;
  } catch {}

  try {
    const sitemapUrl = new URL("/sitemap.xml", parsedUrl.origin).href;
    const sCtrl = new AbortController();
    const sTid = setTimeout(() => sCtrl.abort(), 3000);
    const sitemapRes = await fetch(sitemapUrl, { method: "GET", signal: sCtrl.signal, redirect: "follow" });
    clearTimeout(sTid);
    hasSitemap = sitemapRes.ok;
  } catch {}

  const isHttps = parsedUrl.protocol === "https:";

  const metrics: SeoMetrics = {
    title,
    metaDescription,
    canonicalUrl,
    robotsMeta,
    h1Tags,
    h2Count,
    h3Count,
    totalImagesCount,
    missingAltImagesCount,
    imagesWithoutAlt,
    ogTitle,
    ogDescription,
    ogImage,
    twitterCard,
    hasRobotsTxt,
    hasSitemap,
    isHttps,
    wordCount,
    internalLinksCount,
    externalLinksCount,
    loadTimeMs,
  };

  // Run Rule Checks
  const issues: SeoIssue[] = [];

  // --- 1. Metadata Checks ---
  if (!title) {
    issues.push({
      id: "meta-title-missing",
      title: "Missing Page Title",
      description: "The page does not have a `<title>` tag in its HTML header.",
      category: "metadata",
      severity: "critical",
      scoreDeduction: 15,
      howToFix: "Add a descriptive `<title>` tag inside your `<head>` element (30-60 characters).",
    });
  } else if (title.length < 20 || title.length > 70) {
    issues.push({
      id: "meta-title-length",
      title: "Title Length Not Optimal",
      description: `Current title length is ${title.length} characters. Ideal length is 30–60 characters for optimal search result display.`,
      category: "metadata",
      severity: "warning",
      scoreDeduction: 5,
      currentValue: `${title} (${title.length} chars)`,
      howToFix: "Adjust title length to be between 30 and 60 characters with targeted primary keywords.",
    });
  } else {
    issues.push({
      id: "meta-title-pass",
      title: "Meta Title Tag Configured",
      description: `Title tag is present and optimal length (${title.length} characters).`,
      category: "metadata",
      severity: "pass",
      scoreDeduction: 0,
      currentValue: title,
      howToFix: "No action required.",
    });
  }

  if (!metaDescription) {
    issues.push({
      id: "meta-desc-missing",
      title: "Missing Meta Description",
      description: "Search engines use meta descriptions as snippets in search results.",
      category: "metadata",
      severity: "critical",
      scoreDeduction: 12,
      howToFix: "Add `<meta name=\"description\" content=\"...\" />` with a compelling summary (120-160 characters).",
    });
  } else if (metaDescription.length < 70 || metaDescription.length > 170) {
    issues.push({
      id: "meta-desc-length",
      title: "Meta Description Length Suboptimal",
      description: `Current description length is ${metaDescription.length} characters. Recommended range is 120–160 characters.`,
      category: "metadata",
      severity: "warning",
      scoreDeduction: 4,
      currentValue: `${metaDescription.slice(0, 80)}... (${metaDescription.length} chars)`,
      howToFix: "Expand or condense meta description to 120-160 characters including call-to-action.",
    });
  } else {
    issues.push({
      id: "meta-desc-pass",
      title: "Meta Description Present",
      description: "Meta description is set with ideal character length.",
      category: "metadata",
      severity: "pass",
      scoreDeduction: 0,
      currentValue: metaDescription,
      howToFix: "No action required.",
    });
  }

  if (!canonicalUrl) {
    issues.push({
      id: "canonical-missing",
      title: "Missing Canonical Tag",
      description: "Canonical tags prevent duplicate content issues across URL parameters and HTTP/HTTPS variations.",
      category: "metadata",
      severity: "warning",
      scoreDeduction: 6,
      howToFix: "Add `<link rel=\"canonical\" href=\"https://yourdomain.com/path\" />` to the `<head>`.",
    });
  } else {
    issues.push({
      id: "canonical-pass",
      title: "Canonical URL Configured",
      description: `Canonical tag specifies master URL version: ${canonicalUrl}`,
      category: "metadata",
      severity: "pass",
      scoreDeduction: 0,
      currentValue: canonicalUrl,
      howToFix: "No action required.",
    });
  }

  // --- 2. Content & Headings ---
  if (h1Tags.length === 0) {
    issues.push({
      id: "h1-missing",
      title: "Missing H1 Heading",
      description: "No `<h1>` tag was found on the page. H1 headings signal the primary topic of the page.",
      category: "content",
      severity: "critical",
      scoreDeduction: 15,
      howToFix: "Add exactly one primary `<h1>` heading near the top of your main content area.",
    });
  } else if (h1Tags.length > 1) {
    issues.push({
      id: "h1-multiple",
      title: "Multiple H1 Headings Found",
      description: `Found ${h1Tags.length} H1 tags. Best practice is to have 1 main H1 heading per page.`,
      category: "content",
      severity: "warning",
      scoreDeduction: 5,
      currentValue: h1Tags.join(" | "),
      howToFix: "Keep only one primary `<h1>` tag and convert secondary top headings to `<h2>`.",
    });
  } else {
    issues.push({
      id: "h1-pass",
      title: "H1 Tag Correctly Structured",
      description: `Single primary H1 heading detected: "${h1Tags[0]}".`,
      category: "content",
      severity: "pass",
      scoreDeduction: 0,
      currentValue: h1Tags[0],
      howToFix: "No action required.",
    });
  }

  if (missingAltImagesCount > 0) {
    issues.push({
      id: "images-missing-alt",
      title: "Images Missing Alt Attributes",
      description: `${missingAltImagesCount} of ${totalImagesCount} images do not have accessibility alt text.`,
      category: "content",
      severity: missingAltImagesCount > 3 ? "critical" : "warning",
      scoreDeduction: Math.min(12, missingAltImagesCount * 3),
      currentValue: `${missingAltImagesCount} missing alt tags`,
      howToFix: "Add descriptive `alt=\"...\"` text to all image tags for screen readers and Google Image search.",
    });
  } else if (totalImagesCount > 0) {
    issues.push({
      id: "images-alt-pass",
      title: "Image Alt Attributes Valid",
      description: `All ${totalImagesCount} images have alt tags defined.`,
      category: "content",
      severity: "pass",
      scoreDeduction: 0,
      howToFix: "No action required.",
    });
  }

  if (wordCount < 300) {
    issues.push({
      id: "thin-content",
      title: "Thin Content Detected",
      description: `Total text count is ~${wordCount} words. Pages under 300 words may struggle to rank well in search.`,
      category: "content",
      severity: "warning",
      scoreDeduction: 8,
      currentValue: `~${wordCount} words`,
      howToFix: "Expand page content with relevant topic information, FAQs, or detailed features.",
    });
  } else {
    issues.push({
      id: "content-depth-pass",
      title: "Good Content Length",
      description: `Page contains ~${wordCount} words of readable text.`,
      category: "content",
      severity: "pass",
      scoreDeduction: 0,
      howToFix: "No action required.",
    });
  }

  // --- 3. Social Graph ---
  if (!ogTitle || !ogImage) {
    issues.push({
      id: "og-meta-missing",
      title: "Incomplete OpenGraph Social Tags",
      description: "Missing OpenGraph social meta tags (`og:title` or `og:image`) for preview cards on Twitter/X, LinkedIn, and Facebook.",
      category: "social",
      severity: "warning",
      scoreDeduction: 8,
      howToFix: "Add `<meta property=\"og:title\" ... />` and `<meta property=\"og:image\" ... />` with a high quality preview banner image.",
    });
  } else {
    issues.push({
      id: "og-meta-pass",
      title: "OpenGraph Social Cards Configured",
      description: "Social share title and image preview tags are present.",
      category: "social",
      severity: "pass",
      scoreDeduction: 0,
      howToFix: "No action required.",
    });
  }

  if (!twitterCard) {
    issues.push({
      id: "twitter-card-missing",
      title: "Missing Twitter Card Meta",
      description: "No `twitter:card` meta tag detected for rich Twitter card rendering.",
      category: "social",
      severity: "warning",
      scoreDeduction: 4,
      howToFix: "Add `<meta name=\"twitter:card\" content=\"summary_large_image\" />` to your head tag.",
    });
  } else {
    issues.push({
      id: "twitter-card-pass",
      title: "Twitter Card Tag Present",
      description: `Twitter meta card type configured: ${twitterCard}`,
      category: "social",
      severity: "pass",
      scoreDeduction: 0,
      howToFix: "No action required.",
    });
  }

  // --- 4. Technical SEO ---
  if (!isHttps) {
    issues.push({
      id: "https-missing",
      title: "Website Not Serving Over HTTPS",
      description: "HTTPS is a confirmed Google ranking factor and essential for web security.",
      category: "technical",
      severity: "critical",
      scoreDeduction: 20,
      howToFix: "Install an SSL certificate and redirect all HTTP traffic to HTTPS.",
    });
  } else {
    issues.push({
      id: "https-pass",
      title: "Secure HTTPS Connection",
      description: "Page is served securely via HTTPS protocol.",
      category: "technical",
      severity: "pass",
      scoreDeduction: 0,
      howToFix: "No action required.",
    });
  }

  if (!hasRobotsTxt) {
    issues.push({
      id: "robots-missing",
      title: "Missing robots.txt File",
      description: "No `/robots.txt` file detected at domain root. Crawlers use this to navigate accessible routes.",
      category: "technical",
      severity: "warning",
      scoreDeduction: 6,
      howToFix: "Create a `robots.txt` file at your domain root detailing User-agent crawl permissions.",
    });
  } else {
    issues.push({
      id: "robots-pass",
      title: "robots.txt File Found",
      description: "Robots.txt file is publicly accessible at domain root.",
      category: "technical",
      severity: "pass",
      scoreDeduction: 0,
      howToFix: "No action required.",
    });
  }

  if (!hasSitemap) {
    issues.push({
      id: "sitemap-missing",
      title: "Missing XML Sitemap",
      description: "No `/sitemap.xml` file detected at standard path. Sitemaps help search engines index new pages faster.",
      category: "technical",
      severity: "warning",
      scoreDeduction: 6,
      howToFix: "Generate an XML sitemap (`/sitemap.xml`) and submit it to Google Search Console.",
    });
  } else {
    issues.push({
      id: "sitemap-pass",
      title: "XML Sitemap Found",
      description: "Sitemap file detected at domain root.",
      category: "technical",
      severity: "pass",
      scoreDeduction: 0,
      howToFix: "No action required.",
    });
  }

  // Calculate scores per category and overall
  const buildCategoryResult = (name: string, categoryIssues: SeoIssue[]): SeoCategoryResult => {
    const criticalCount = categoryIssues.filter((i) => i.severity === "critical").length;
    const warningCount = categoryIssues.filter((i) => i.severity === "warning").length;
    const passedCount = categoryIssues.filter((i) => i.severity === "pass").length;

    const totalDeduction = categoryIssues.reduce((acc, curr) => acc + curr.scoreDeduction, 0);
    const score = Math.max(0, 100 - totalDeduction);

    return {
      name,
      score,
      issues: categoryIssues,
      passedCount,
      warningCount,
      criticalCount,
    };
  };

  const metadataCat = buildCategoryResult("Metadata & Tags", issues.filter((i) => i.category === "metadata"));
  const contentCat = buildCategoryResult("Content & Headings", issues.filter((i) => i.category === "content"));
  const socialCat = buildCategoryResult("Social & OpenGraph", issues.filter((i) => i.category === "social"));
  const technicalCat = buildCategoryResult("Technical SEO", issues.filter((i) => i.category === "technical"));

  const totalDeductions = issues.reduce((sum, issue) => sum + issue.scoreDeduction, 0);
  const overallScore = Math.max(10, Math.min(100, 100 - totalDeductions));

  return {
    url: parsedUrl.href,
    domain: parsedUrl.hostname,
    timestamp: new Date().toISOString(),
    overallScore,
    metrics,
    categories: {
      metadata: metadataCat,
      content: contentCat,
      social: socialCat,
      technical: technicalCat,
    },
    allIssues: issues,
  };
}
