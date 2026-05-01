/**
 * Gemini AI helpers
 *
 * Strategy:
 *   1. Try the Gemini REST API (live AI generation)
 *   2. If all API calls fail (quota / region restriction), fall back to
 *      keyword-aware local generators so features always work for demos.
 *
 * Exports:
 *   - generateSubSteps(taskTitle)  → string[]
 *   - generateProjectPlan(name)    → { description: string; milestones: string[] }
 */

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? "";
const BASE    = "https://generativelanguage.googleapis.com";

interface ModelSpec { model: string; version: "v1" | "v1beta"; }

const MODELS: ModelSpec[] = [
  { model: "gemini-2.0-flash-lite", version: "v1beta" },
  { model: "gemini-2.0-flash",      version: "v1beta" },
  { model: "gemini-1.5-flash",      version: "v1"     },
  { model: "gemini-1.5-flash-8b",   version: "v1"     },
];

/* ── Shared REST caller ─────────────────────────────────────────────────────── */
async function callGemini(prompt: string): Promise<string> {
  for (const spec of MODELS) {
    try {
      const url = `${BASE}/${spec.version}/models/${spec.model}:generateContent?key=${API_KEY}`;
      const res = await fetch(url, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          contents:         [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 700 },
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as {
        candidates?: { content: { parts: { text: string }[] } }[];
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
      if (!text) throw new Error("Empty response");
      return text;
    } catch {
      continue;
    }
  }
  throw new Error("ALL_FAILED");
}

function stripFences(raw: string): string {
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i,     "")
    .replace(/```\s*$/,      "")
    .trim();
}

/* ════════════════════════════════════════════════════════════════════════════
   TASK SUB-STEPS
════════════════════════════════════════════════════════════════════════════ */
const buildSubStepPrompt = (title: string) =>
  `You are a project management assistant. Task title: "${title}".
Generate 4-6 concise, actionable sub-steps.
Respond ONLY with valid JSON: { "steps": ["step 1", "step 2", "step 3", "step 4"] }
No markdown, no backticks, no explanation.`;

type StepRule = { keywords: string[]; steps: string[] };
const STEP_RULES: StepRule[] = [
  {
    keywords: ["auth", "login", "signup", "register", "password", "jwt", "oauth", "session"],
    steps: ["Define authentication requirements and user roles", "Set up the authentication provider (e.g. Supabase, NextAuth)", "Create login and registration UI forms with validation", "Implement secure token/session handling and storage", "Add route guards to protect authenticated pages", "Test login, logout, and session expiry flows"],
  },
  {
    keywords: ["api", "endpoint", "rest", "graphql", "fetch", "backend", "server", "route"],
    steps: ["Define the API contract — request/response schema and status codes", "Create the route handler with input validation", "Implement the business logic and database queries", "Add error handling and appropriate HTTP status codes", "Write integration tests for success and error paths", "Document the endpoint in the API reference"],
  },
  {
    keywords: ["ui", "design", "component", "interface", "layout", "css", "style", "responsive", "mobile"],
    steps: ["Sketch the layout and gather design references", "Build the component structure with semantic HTML", "Apply styles — spacing, typography, and color tokens", "Add responsive breakpoints for mobile and tablet", "Implement hover, focus, and loading states", "Test across browsers and screen sizes"],
  },
  {
    keywords: ["database", "db", "schema", "migration", "sql", "table", "model", "supabase", "postgres"],
    steps: ["Design the data model — tables, columns, and relationships", "Write the migration script to create/alter tables", "Set up Row Level Security (RLS) policies for access control", "Create indexes for frequently queried columns", "Seed the database with test data", "Verify queries with the database query editor"],
  },
  {
    keywords: ["test", "testing", "unit", "e2e", "jest", "spec", "qa", "bug", "fix"],
    steps: ["Identify the scope — unit, integration, or end-to-end", "Write test cases covering happy paths and edge cases", "Set up test fixtures and mock dependencies", "Run the test suite and record baseline results", "Fix failing tests and ensure coverage threshold is met", "Add the tests to the CI pipeline"],
  },
  {
    keywords: ["deploy", "deployment", "ci", "cd", "pipeline", "vercel", "production", "release", "build"],
    steps: ["Ensure all environment variables are configured for production", "Run a production build locally and fix any build errors", "Set up or verify the CI/CD pipeline configuration", "Deploy to staging and run smoke tests", "Merge to main and trigger the production deployment", "Monitor error logs and performance after release"],
  },
  {
    keywords: ["dashboard", "chart", "analytics", "report", "metric", "graph", "stat"],
    steps: ["Identify the key metrics and data sources to display", "Fetch and aggregate the required data from the database", "Choose appropriate chart types for each metric", "Build the chart components with responsive sizing", "Add loading skeletons while data is fetching", "Test with real and edge-case data sets"],
  },
  {
    keywords: ["form", "input", "validation", "submit", "field"],
    steps: ["Define the form fields and validation rules", "Build the form UI with accessible labels and inputs", "Implement client-side validation with error messages", "Handle form submission with loading and success states", "Add server-side validation as a second layer", "Test all validation cases including edge inputs"],
  },
  {
    keywords: ["performance", "optimize", "speed", "cache", "lazy", "load"],
    steps: ["Profile the current performance baseline with DevTools", "Identify the top bottlenecks (network, render, bundle)", "Implement lazy loading for images and heavy components", "Add caching headers or in-memory cache for repeated queries", "Minimize bundle size — tree-shake and code-split", "Re-measure and confirm the performance improvement"],
  },
];

function localSubSteps(title: string): string[] {
  const lower = title.toLowerCase();
  for (const rule of STEP_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.steps;
  }
  return [
    `Clarify the requirements and acceptance criteria for "${title}"`,
    "Break down the work into smaller technical sub-tasks",
    "Implement the core functionality with clean, readable code",
    "Write tests to verify the implementation works correctly",
    "Perform a code review and address feedback",
    "Deploy and verify in the staging environment",
  ];
}

export async function generateSubSteps(taskTitle: string): Promise<string[]> {
  if (API_KEY && API_KEY !== "your_gemini_api_key_here") {
    try {
      const raw    = await callGemini(buildSubStepPrompt(taskTitle.trim()));
      const parsed = JSON.parse(stripFences(raw)) as { steps: string[] };
      if (Array.isArray(parsed.steps) && parsed.steps.length > 0) {
        return parsed.steps.map((s) => String(s).trim()).filter(Boolean);
      }
    } catch {
      console.warn("[Gemini] Sub-steps API failed — using local fallback.");
    }
  }
  return localSubSteps(taskTitle.trim());
}

/* ════════════════════════════════════════════════════════════════════════════
   PROJECT PLAN  (description + milestones)
════════════════════════════════════════════════════════════════════════════ */
export interface ProjectPlan {
  description: string;
  milestones:  string[];
}

const buildProjectPrompt = (name: string) =>
  `You are a senior project manager. Project name: "${name}".
Generate:
  1. A concise, professional 1-2 sentence project description.
  2. 5-6 high-level project milestones/phases in order.
Respond ONLY with valid JSON (no markdown, no backticks):
{ "description": "...", "milestones": ["Phase 1: ...", "Phase 2: ...", "Phase 3: ...", "Phase 4: ...", "Phase 5: ..."] }`;

type ProjectRule = { keywords: string[]; description: string; milestones: string[] };
const PROJECT_RULES: ProjectRule[] = [
  {
    keywords: ["website", "web", "landing", "redesign", "frontend", "portal", "site"],
    description: "A web development project focused on delivering a modern, responsive interface that enhances user experience and drives business goals.",
    milestones: ["Phase 1: Requirements & stakeholder alignment", "Phase 2: UX wireframes & design approval", "Phase 3: Frontend development & component library", "Phase 4: Backend API integration & testing", "Phase 5: QA, accessibility audit & cross-browser validation", "Phase 6: Production deployment & post-launch monitoring"],
  },
  {
    keywords: ["app", "mobile", "ios", "android", "react native", "flutter"],
    description: "A mobile application project aimed at delivering a seamless, native-quality experience across iOS and Android platforms.",
    milestones: ["Phase 1: Product requirements & user story mapping", "Phase 2: UI/UX design & prototype approval", "Phase 3: Core feature development", "Phase 4: Third-party integrations & API connections", "Phase 5: Device testing, performance optimization & beta release", "Phase 6: App store submission & production launch"],
  },
  {
    keywords: ["api", "backend", "server", "microservice", "service", "infrastructure"],
    description: "A backend engineering project to build scalable, secure, and well-documented APIs that power business-critical operations.",
    milestones: ["Phase 1: Architecture design & technology stack decision", "Phase 2: Database schema design & environment setup", "Phase 3: Core API endpoint development", "Phase 4: Authentication, authorization & security hardening", "Phase 5: Integration testing, load testing & documentation", "Phase 6: Staging deployment & production release"],
  },
  {
    keywords: ["dashboard", "analytics", "report", "bi", "data", "insight", "metric"],
    description: "A data analytics project to build real-time dashboards and reporting tools that surface actionable business insights.",
    milestones: ["Phase 1: Data source identification & access setup", "Phase 2: Data pipeline & ETL design", "Phase 3: Dashboard layout & chart component development", "Phase 4: Real-time data integration & performance tuning", "Phase 5: User acceptance testing & stakeholder review", "Phase 6: Production rollout & user training"],
  },
  {
    keywords: ["ecommerce", "shop", "store", "payment", "cart", "checkout", "marketplace"],
    description: "An e-commerce platform project to deliver a secure, conversion-optimized shopping experience with seamless payment processing.",
    milestones: ["Phase 1: Product catalogue & inventory architecture", "Phase 2: UX design — browse, search & product detail pages", "Phase 3: Shopping cart & checkout flow development", "Phase 4: Payment gateway & order management integration", "Phase 5: Security audit, PCI compliance & performance testing", "Phase 6: Launch, marketing integration & analytics setup"],
  },
  {
    keywords: ["design", "brand", "ui", "ux", "figma", "prototype", "visual"],
    description: "A design project to create a cohesive visual identity and user experience that aligns with brand values and user needs.",
    milestones: ["Phase 1: Discovery, research & competitive analysis", "Phase 2: Brand guidelines & design token definition", "Phase 3: Wireframes & information architecture", "Phase 4: High-fidelity mockups & interactive prototype", "Phase 5: Stakeholder review, iteration & final approval", "Phase 6: Design handoff & developer documentation"],
  },
  {
    keywords: ["migration", "refactor", "upgrade", "legacy", "modernize", "rewrite"],
    description: "A system modernization project to migrate legacy code to a maintainable, scalable architecture with zero data loss.",
    milestones: ["Phase 1: Audit current system & define migration scope", "Phase 2: New architecture design & tech stack selection", "Phase 3: Parallel development of modernized components", "Phase 4: Data migration scripts & validation testing", "Phase 5: Cutover planning, rollback strategy & dry run", "Phase 6: Production migration & legacy system decommission"],
  },
];

function localProjectPlan(name: string): ProjectPlan {
  const lower = name.toLowerCase();
  for (const rule of PROJECT_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return { description: rule.description, milestones: rule.milestones };
    }
  }
  // Generic fallback
  return {
    description: `${name} is a strategic initiative to deliver measurable value through careful planning, iterative development, and rigorous quality assurance.`,
    milestones: [
      "Phase 1: Discovery & requirements gathering",
      "Phase 2: Architecture design & environment setup",
      "Phase 3: Core feature development",
      "Phase 4: Integration, testing & QA",
      "Phase 5: Stakeholder review & refinement",
      "Phase 6: Production launch & post-launch support",
    ],
  };
}

export async function generateProjectPlan(projectName: string): Promise<ProjectPlan> {
  if (API_KEY && API_KEY !== "your_gemini_api_key_here") {
    try {
      const raw    = await callGemini(buildProjectPrompt(projectName.trim()));
      const parsed = JSON.parse(stripFences(raw)) as ProjectPlan;
      if (parsed.description && Array.isArray(parsed.milestones) && parsed.milestones.length > 0) {
        return {
          description: parsed.description.trim(),
          milestones:  parsed.milestones.map((m) => String(m).trim()).filter(Boolean),
        };
      }
    } catch {
      console.warn("[Gemini] Project plan API failed — using local fallback.");
    }
  }
  return localProjectPlan(projectName.trim());
}
