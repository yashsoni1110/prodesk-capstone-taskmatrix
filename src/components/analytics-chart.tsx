"use client";

import dynamic from "next/dynamic";
import { useTasks } from "@/store/task-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ── Lazy-load the heavy Recharts bundle off the critical path ────────────────
const AreaChart       = dynamic(() => import("recharts").then((m) => m.AreaChart),       { ssr: false });
const Area            = dynamic(() => import("recharts").then((m) => m.Area),            { ssr: false });
const XAxis           = dynamic(() => import("recharts").then((m) => m.XAxis),           { ssr: false });
const YAxis           = dynamic(() => import("recharts").then((m) => m.YAxis),           { ssr: false });
const CartesianGrid   = dynamic(() => import("recharts").then((m) => m.CartesianGrid),   { ssr: false });
const Tooltip         = dynamic(() => import("recharts").then((m) => m.Tooltip),         { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getDayIndex(dateStr: string): number {
  const d = new Date(dateStr);
  return (d.getDay() + 6) % 7;
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  done:         { label: "Done",        color: "#10b981" },
  "in-progress":{ label: "In Progress", color: "#8b5cf6" },
  review:       { label: "Review",      color: "#f59e0b" },
  todo:         { label: "To Do",       color: "#3b82f6" },
  backlog:      { label: "Backlog",     color: "#64748b" },
};

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  critical: { label: "Critical", color: "#ef4444" },
  high:     { label: "High",     color: "#f97316" },
  medium:   { label: "Medium",   color: "#3b82f6" },
  low:      { label: "Low",      color: "#64748b" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card/95 backdrop-blur px-3 py-2 shadow-xl text-[12px]">
      <p className="font-semibold mb-1.5 text-foreground">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} aria-hidden="true" />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground tabular-nums">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsChart() {
  const tasks = useTasks();

  /* ── Weekly buckets ── */
  const buckets = DAYS.map((day) => ({ day, total: 0, done: 0, active: 0 }));
  tasks.forEach((t) => {
    const idx = getDayIndex(t.createdAt);
    if (idx >= 0 && idx < 7) {
      buckets[idx].total  += 1;
      if (t.status === "done")         buckets[idx].done   += 1;
      if (t.status === "in-progress")  buckets[idx].active += 1;
    }
  });

  /* ── Status distribution ── */
  const statusCounts: Record<string, number> = {};
  tasks.forEach((t) => { statusCounts[t.status] = (statusCounts[t.status] ?? 0) + 1; });
  const statusEntries = Object.entries(statusCounts).sort((a, b) => b[1] - a[1]);

  /* ── Priority distribution ── */
  const priCounts: Record<string, number> = {};
  tasks.forEach((t) => { priCounts[t.priority] = (priCounts[t.priority] ?? 0) + 1; });

  const done      = tasks.filter((t) => t.status === "done").length;
  const active    = tasks.filter((t) => t.status === "in-progress").length;
  const completion = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <Card className="border-border/60 overflow-hidden">
      <CardHeader className="px-5 pt-5 pb-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-[14px] font-semibold">Task Analytics</CardTitle>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              Weekly activity · status &amp; priority breakdown
            </p>
          </div>

          {/* KPI strip */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center">
              <p className="text-lg font-bold tabular-nums text-emerald-500">{completion}%</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Complete</p>
            </div>
            <div className="w-px h-8 bg-border/60" aria-hidden="true" />
            <div className="text-center">
              <p className="text-lg font-bold tabular-nums text-violet-500">{active}</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Active</p>
            </div>
            <div className="w-px h-8 bg-border/60" aria-hidden="true" />
            <div className="text-center">
              <p className="text-lg font-bold tabular-nums text-foreground">{tasks.length}</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Total</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-4 space-y-5">

        {/* ── Area Chart ── */}
        <div role="img" aria-label="Weekly task activity area chart showing total, in-progress, and done tasks per day">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={buckets} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gradDone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gradActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={20}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="total"
                name="Total" stroke="#8b5cf6" strokeWidth={2}
                fill="url(#gradTotal)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }}
                isAnimationActive={false}
              />
              <Area
                type="monotone" dataKey="active"
                name="In Progress" stroke="#3b82f6" strokeWidth={2}
                fill="url(#gradActive)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }}
                isAnimationActive={false}
              />
              <Area
                type="monotone" dataKey="done"
                name="Done" stroke="#10b981" strokeWidth={2}
                fill="url(#gradDone)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Chart legend */}
          <div className="flex items-center gap-5 mt-2 text-[11px]">
            {[
              { label: "Total",       color: "#8b5cf6" },
              { label: "In Progress", color: "#3b82f6" },
              { label: "Done",        color: "#10b981" },
            ].map(({ label, color }) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="w-4 h-[2px] rounded-full inline-block" style={{ backgroundColor: color }} aria-hidden="true" />
                <span className="text-muted-foreground">{label}</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-border/50" aria-hidden="true" />

        {/* ── Status + Priority row ── */}
        <div className="grid grid-cols-2 gap-5">

          {/* Status Distribution */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              By Status
            </p>
            {tasks.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/50">No tasks yet</p>
            ) : (
              <div className="space-y-2">
                {/* Stacked bar */}
                <div className="flex h-2 rounded-full overflow-hidden gap-px" role="img" aria-label="Status distribution bar chart">
                  {statusEntries.map(([key, val]) => (
                    <div
                      key={key}
                      className="h-full transition-all"
                      style={{
                        width: `${(val / tasks.length) * 100}%`,
                        backgroundColor: STATUS_META[key]?.color ?? "#94a3b8",
                      }}
                      title={`${STATUS_META[key]?.label ?? key}: ${val}`}
                    />
                  ))}
                </div>
                {/* Labels */}
                <div className="flex flex-col gap-1.5">
                  {statusEntries.map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: STATUS_META[key]?.color ?? "#94a3b8" }}
                          aria-hidden="true"
                        />
                        <span className="text-muted-foreground capitalize">
                          {STATUS_META[key]?.label ?? key}
                        </span>
                      </span>
                      <span className="font-semibold tabular-nums text-foreground">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Priority Distribution */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              By Priority
            </p>
            {tasks.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/50">No tasks yet</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {(["critical", "high", "medium", "low"] as const).map((p) => {
                  const count = priCounts[p] ?? 0;
                  const meta  = PRIORITY_META[p];
                  return (
                    <div
                      key={p}
                      className="flex flex-col gap-1 px-2.5 py-2 rounded-lg border border-border/50"
                      style={{ backgroundColor: meta.color + "10" }}
                    >
                      <span
                        className="text-base font-bold tabular-nums leading-none"
                        style={{ color: meta.color }}
                      >
                        {count}
                      </span>
                      <span className="text-[10px] text-muted-foreground capitalize leading-none">
                        {meta.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
