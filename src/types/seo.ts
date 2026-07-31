export type IssueSeverity = "critical" | "warning" | "pass";

export interface SeoIssue {
  id: string;
  title: string;
  description: string;
  category: "metadata" | "content" | "social" | "technical" | "performance";
  severity: IssueSeverity;
  scoreDeduction: number;
  currentValue?: string;
  recommendedValue?: string;
  howToFix: string;
}

export interface SeoCategoryResult {
  name: string;
  score: number;
  issues: SeoIssue[];
  passedCount: number;
  warningCount: number;
  criticalCount: number;
}

export interface SeoMetrics {
  title?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  robotsMeta?: string;
  h1Tags: string[];
  h2Count: number;
  h3Count: number;
  totalImagesCount: number;
  missingAltImagesCount: number;
  imagesWithoutAlt: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  isHttps: boolean;
  wordCount: number;
  internalLinksCount: number;
  externalLinksCount: number;
  loadTimeMs: number;
}

export interface SeoReport {
  url: string;
  domain: string;
  timestamp: string;
  overallScore: number;
  metrics: SeoMetrics;
  categories: {
    metadata: SeoCategoryResult;
    content: SeoCategoryResult;
    social: SeoCategoryResult;
    technical: SeoCategoryResult;
  };
  allIssues: SeoIssue[];
}
