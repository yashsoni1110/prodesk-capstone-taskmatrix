/**
 * Gemini AI helper — generates task sub-steps.
 *
 * Strategy:
 *   1. Try the Gemini REST API (live AI generation)
 *   2. If all API calls fail (quota / region restriction), fall back to
 *      a keyword-aware local generator so the feature always works for demos.
 */

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "";
const BASE    = "https://generativelanguage.googleapis.com";

interface ModelSpec {
  model:   string;
  version: "v1" | "v1beta";
}

const MODELS: ModelSpec[] = [
  { model: "gemini-2.0-flash-lite", version: "v1beta" },
  { model: "gemini-2.0-flash",      version: "v1beta" },
  { model: "gemini-1.5-flash",      version: "v1"     },
  { model: "gemini-1.5-flash-8b",   version: "v1"     },
];

const buildPrompt = (title: string) =>
  `You are a project management assistant. A user has a task titled: "${title}".
Generate 4-6 concise, actionable sub-steps to complete this task.
You are an API. Respond ONLY with a valid JSON object:
{ "steps": ["step 1", "step 2", "step 3", "step 4"] }
No markdown, no backticks, no explanation.`;

async function callModel(spec: ModelSpec, prompt: string): Promise<string[]> {
  const url = `${BASE}/${spec.version}/models/${spec.model}:generateContent?key=${API_KEY}`;
  const res = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      contents:         [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json() as {
    candidates?: { content: { parts: { text: string }[] } }[];
  };
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  if (!raw) throw new Error("Empty response");
  const clean = raw.replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/```\s*$/,"").trim();
  const parsed = JSON.parse(clean) as { steps: unknown };
  if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) throw new Error("No steps");
  return (parsed.steps as unknown[]).map((s) => String(s).trim()).filter(Boolean);
}

/* ─────────────────────────────────────────────────────────────────────────────
   LOCAL FALLBACK — keyword-aware sub-step generator
   Used when the API is unavailable (quota / region / missing key).
   Produces contextually relevant steps so the demo always works.
───────────────────────────────────────────────────────────────────────────── */
type StepRule = { keywords: string[]; steps: string[] };

const STEP_RULES: StepRule[] = [
  {
    keywords: ["auth", "login", "signup", "register", "password", "jwt", "oauth", "session"],
    steps: [
      "Define authentication requirements and user roles",
      "Set up the authentication provider or library (e.g. Supabase, NextAuth)",
      "Create login and registration UI forms with validation",
      "Implement secure token/session handling and storage",
      "Add route guards to protect authenticated pages",
      "Test login, logout, and session expiry flows",
    ],
  },
  {
    keywords: ["api", "endpoint", "rest", "graphql", "fetch", "backend", "server", "route"],
    steps: [
      "Define the API contract — request/response schema and status codes",
      "Create the route handler with input validation",
      "Implement the business logic and database queries",
      "Add error handling and appropriate HTTP status codes",
      "Write integration tests for success and error paths",
      "Document the endpoint in the API reference",
    ],
  },
  {
    keywords: ["ui", "design", "component", "interface", "layout", "css", "style", "responsive", "mobile"],
    steps: [
      "Sketch the layout and gather design references",
      "Build the component structure with semantic HTML",
      "Apply styles — spacing, typography, and color tokens",
      "Add responsive breakpoints for mobile and tablet",
      "Implement hover, focus, and loading states",
      "Test across browsers and screen sizes",
    ],
  },
  {
    keywords: ["database", "db", "schema", "migration", "sql", "table", "model", "supabase", "postgres"],
    steps: [
      "Design the data model — tables, columns, and relationships",
      "Write the migration script to create/alter tables",
      "Set up Row Level Security (RLS) policies for access control",
      "Create indexes for frequently queried columns",
      "Seed the database with test data",
      "Verify queries with the database query editor",
    ],
  },
  {
    keywords: ["test", "testing", "unit", "e2e", "jest", "spec", "qa", "bug", "fix"],
    steps: [
      "Identify the scope — unit, integration, or end-to-end",
      "Write test cases covering happy paths and edge cases",
      "Set up test fixtures and mock dependencies",
      "Run the test suite and record baseline results",
      "Fix failing tests and ensure coverage threshold is met",
      "Add the tests to the CI pipeline",
    ],
  },
  {
    keywords: ["deploy", "deployment", "ci", "cd", "pipeline", "vercel", "production", "release", "build"],
    steps: [
      "Ensure all environment variables are configured for production",
      "Run a production build locally and fix any build errors",
      "Set up or verify the CI/CD pipeline configuration",
      "Deploy to staging and run smoke tests",
      "Merge to main and trigger the production deployment",
      "Monitor error logs and performance after release",
    ],
  },
  {
    keywords: ["dashboard", "chart", "analytics", "report", "metric", "graph", "stat"],
    steps: [
      "Identify the key metrics and data sources to display",
      "Fetch and aggregate the required data from the database",
      "Choose appropriate chart types for each metric",
      "Build the chart components with responsive sizing",
      "Add loading skeletons while data is fetching",
      "Test with real and edge-case data sets",
    ],
  },
  {
    keywords: ["notification", "alert", "email", "toast", "message", "push"],
    steps: [
      "Define the notification types and trigger conditions",
      "Create the notification data model and storage",
      "Implement the notification dispatch logic",
      "Build the UI to display and dismiss notifications",
      "Mark notifications as read and persist the state",
      "Test delivery under different user scenarios",
    ],
  },
  {
    keywords: ["search", "filter", "sort", "query", "find"],
    steps: [
      "Define searchable fields and filter criteria",
      "Implement the search/filter query logic on the backend",
      "Build the search input and filter UI components",
      "Add debouncing to avoid excessive API calls",
      "Handle empty results with a clear empty state",
      "Test with various keywords and filter combinations",
    ],
  },
  {
    keywords: ["form", "input", "validation", "submit", "field"],
    steps: [
      "Define the form fields and validation rules",
      "Build the form UI with accessible labels and inputs",
      "Implement client-side validation with error messages",
      "Handle form submission with loading and success states",
      "Add server-side validation as a second layer",
      "Test all validation cases including edge inputs",
    ],
  },
  {
    keywords: ["performance", "optimize", "speed", "cache", "lazy", "load"],
    steps: [
      "Profile the current performance baseline with DevTools",
      "Identify the top bottlenecks (network, render, bundle)",
      "Implement lazy loading for images and heavy components",
      "Add caching headers or in-memory cache for repeated queries",
      "Minimize bundle size — tree-shake and code-split",
      "Re-measure and confirm the performance improvement",
    ],
  },
];

const GENERIC_STEPS = (title: string): string[] => [
  `Clarify the requirements and acceptance criteria for "${title}"`,
  "Break down the work into smaller technical sub-tasks",
  "Implement the core functionality with clean, readable code",
  "Write tests to verify the implementation works correctly",
  "Perform a code review and address feedback",
  "Deploy and verify in the staging environment",
];

function generateLocalSubSteps(title: string): string[] {
  const lower = title.toLowerCase();
  for (const rule of STEP_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.steps;
    }
  }
  return GENERIC_STEPS(title);
}

/* ─────────────────────────────────────────────────────────────────────────── */

/** Returns sub-step strings — tries Gemini API first, falls back to local. */
export async function generateSubSteps(taskTitle: string): Promise<string[]> {
  const prompt = buildPrompt(taskTitle.trim());

  // ── Try live API if a key is configured ──────────────────────────────────
  if (API_KEY && API_KEY !== "your_gemini_api_key_here") {
    const failures: string[] = [];
    for (const spec of MODELS) {
      try {
        return await callModel(spec, prompt);
      } catch (err) {
        failures.push(err instanceof Error ? err.message.slice(0, 100) : String(err));
        continue;
      }
    }
    // Log for developer visibility, then fall through to local fallback
    console.warn("[Gemini] API unavailable, using local fallback.\n" + failures.join("\n"));
  }

  // ── Local fallback — always works ────────────────────────────────────────
  return generateLocalSubSteps(taskTitle.trim());
}
