# OpenSEO 🚀

> **Open-Source Next.js AI Agent Web SEO Analyzer & Audit Engine**

OpenSEO is a modern, open-source web application designed to perform automated technical SEO audits, generate AI executive summaries, and provide an interactive streaming AI assistant for resolving SEO issues and generating Schema.org code snippets.

Built with **Next.js 16 (App Router & Turbopack)**, **React 19**, **TypeScript**, **Tailwind CSS (Apple-style Liquid Glass Design)**, and **Vercel AI SDK**.

---

## ✨ Features

- 🍏 **Apple-Inspired Liquid Glass UI**: Clean, light-mode interface featuring frosted glass panels (`backdrop-blur-xl`), soft borders, responsive bento grids, and smooth animations.
- ⚡ **Full Technical SEO Scraper**:
  - **Metadata & Tags**: Page `<title>`, `<meta name="description">`, `<link rel="canonical">`, `<meta name="robots">`.
  - **Content Architecture**: Primary `<h1>` tag count, `<h2>`-`<h3>` hierarchy, missing image `alt` attributes, word count depth.
  - **Social Graph**: OpenGraph (`og:title`, `og:image`, `og:description`) and Twitter Card tags.
  - **Crawlability & Security**: `HTTPS` protocol check, `/robots.txt` detection, `/sitemap.xml` detection, and page load latency.
- 📊 **Categorized Scoring System**: Computes an overall health score (0–100) with categorized deductions and severity badges (Critical, Warning, Passed).
- 🤖 **Interactive AI Assistant**:
  - Bounded floating chat drawer to ask questions about your specific audit report.
  - One-click code generation for **Schema.org JSON-LD**, Next.js `<title>`/`<meta>` tags, and missing image alt fixes.
- 🔄 **Multi-Provider AI Engine (OpenRouter Free Models, Gemini, OpenAI)**:
  - **Free Built-in Engine**: Works out-of-the-box with **0 configuration** and **$0 API cost**.
  - **OpenRouter Free Models**: Connect `OPENROUTER_API_KEY` to stream 100% free models like `meta-llama/llama-3.1-8b-instruct:free` or `google/gemma-2-9b-it:free`.
  - **Google Gemini / OpenAI**: Support for `GEMINI_API_KEY` or `OPENAI_API_KEY`.
- 📁 **JSON Export**: One-click download of structured audit reports for client reporting.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **DOM Parser**: [Cheerio](https://cheerio.js.org/)
- **AI Engine**: [Vercel AI SDK](https://sdk.vercel.ai/docs) (`ai`, `@ai-sdk/openai`, `@ai-sdk/google`)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/OpenSEO.git
cd OpenSEO
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables (Optional)

OpenSEO runs 100% free out-of-the-box without an API key. 

If you wish to enable OpenRouter (including **free models**), Google Gemini, or OpenAI live streaming, create a `.env.local` file:

```env
# Option 1: OpenRouter (Supports free models like meta-llama/llama-3.1-8b-instruct:free)
OPENROUTER_API_KEY=your_openrouter_api_key_here
# Optional model override (Defaults to meta-llama/llama-3.1-8b-instruct:free)
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free

# Option 2: Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Option 3: OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here
```

---

## ☁️ Deployment on Vercel

1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com/new).
3. *(Optional)* Add `OPENROUTER_API_KEY`, `GEMINI_API_KEY`, or `OPENAI_API_KEY` in Environment Variables.
4. Click **Deploy**.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
