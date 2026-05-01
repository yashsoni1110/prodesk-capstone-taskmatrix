"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon } from "lucide-react"

/* ── Context ─────────────────────────────────────────────────────────────── */
interface Ctx {
  value: string
  onValueChange: (v: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  triggerRef: React.RefObject<HTMLButtonElement | null>
  registerItem: (value: string, label: string) => void
  getLabel: (value: string) => string | undefined
}

const SelectCtx = React.createContext<Ctx>({
  value: "", onValueChange: () => {}, open: false,
  setOpen: () => {}, triggerRef: { current: null },
  registerItem: () => {}, getLabel: () => undefined,
})

/* ── Select ──────────────────────────────────────────────────────────────── */
function Select({
  children, value: controlledValue, onValueChange, defaultValue = "",
}: {
  children: React.ReactNode
  value?: string
  onValueChange?: (v: string) => void
  defaultValue?: string
}) {
  const [internal, setInternal] = React.useState(defaultValue)
  const [open, setOpen]         = React.useState(false)
  const isControlled            = controlledValue !== undefined
  const value                   = isControlled ? controlledValue! : internal
  const triggerRef              = React.useRef<HTMLButtonElement | null>(null)
  const map                     = React.useRef<Map<string, string>>(new Map())

  const registerItem = React.useCallback((v: string, label: string) => {
    map.current.set(v, label)
  }, [])

  const getLabel = React.useCallback((v: string) => map.current.get(v), [])

  const handleChange = React.useCallback((v: string) => {
    if (!isControlled) setInternal(v)
    onValueChange?.(v)
    setOpen(false)
  }, [isControlled, onValueChange])

  // Close on outside click
  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest("[data-sel-root]") && !t.closest("[data-sel-content]")) setOpen(false)
    }
    const id = setTimeout(() => document.addEventListener("mousedown", handler), 0)
    return () => { clearTimeout(id); document.removeEventListener("mousedown", handler) }
  }, [open])

  return (
    <SelectCtx.Provider value={{ value, onValueChange: handleChange, open, setOpen, triggerRef, registerItem, getLabel }}>
      <div data-sel-root className="relative w-full">{children}</div>
    </SelectCtx.Provider>
  )
}

/* ── SelectTrigger ───────────────────────────────────────────────────────── */
function SelectTrigger({
  className, children, size = "default", ...props
}: React.ComponentProps<"button"> & { size?: "sm" | "default" }) {
  const { open, setOpen, triggerRef } = React.useContext(SelectCtx)
  return (
    <button
      type="button"
      ref={triggerRef}
      onClick={() => setOpen(o => !o)}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        size === "default" ? "h-9" : "h-7", className
      )}
      {...props}
    >
      <span className="flex-1 text-left truncate">{children}</span>
      <ChevronDownIcon className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", open && "rotate-180")} />
    </button>
  )
}

/* ── SelectValue ─────────────────────────────────────────────────────────── */
function SelectValue({ children, placeholder }: { children?: React.ReactNode; placeholder?: string; className?: string }) {
  const { value, getLabel } = React.useContext(SelectCtx)
  // Explicit children override (custom display with color dots, etc.)
  if (children != null && children !== false) return <>{children}</>
  const label = getLabel(value) ?? value
  return label
    ? <>{label}</>
    : <span className="text-muted-foreground">{placeholder ?? "Select…"}</span>
}

/* ── SelectContent ───────────────────────────────────────────────────────── */
function SelectContent({
  className, children,
  // Accept but ignore these props so they don't leak to DOM
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  position: _pos, align: _align, side: _side, sideOffset: _so, alignOffset: _ao, alignItemWithTrigger: _awt,
  ...props
}: React.ComponentProps<"div"> & {
  position?: string; align?: string; side?: string
  sideOffset?: number; alignOffset?: number; alignItemWithTrigger?: boolean
}) {
  const { open, triggerRef } = React.useContext(SelectCtx)
  const [rect, setRect] = React.useState<DOMRect | null>(null)

  React.useLayoutEffect(() => {
    if (open && triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect())
    }
  }, [open, triggerRef])

  if (!open || !rect) return null
  if (typeof document === "undefined") return null

  // Flip upward if not enough space below
  const spaceBelow = window.innerHeight - rect.bottom
  const top = spaceBelow < 200 && rect.top > 200
    ? rect.top - 4 - Math.min(240, rect.top - 8) // above trigger
    : rect.bottom + 4

  return createPortal(
    <div
      data-sel-content
      style={{ position: "fixed", top, left: rect.left, width: rect.width, zIndex: 9999 }}
      className={cn(
        "max-h-60 overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-xl ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      {children}
    </div>,
    document.body
  )
}

/* ── SelectItem ──────────────────────────────────────────────────────────── */
function SelectItem({
  className, children, value, disabled, ...props
}: React.ComponentProps<"button"> & { value: string }) {
  const { value: selected, onValueChange, registerItem } = React.useContext(SelectCtx)
  const isSelected = selected === value

  // Register plain-text label so SelectTrigger can display it
  React.useLayoutEffect(() => {
    const text = typeof children === "string" ? children : ""
    if (text) registerItem(value, text)
  }, [value, children, registerItem])

  return (
    <button
      type="button" role="option" aria-selected={isSelected} disabled={disabled}
      onClick={() => onValueChange(value)}
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-md px-2 py-2 pr-8 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
        isSelected && "bg-accent/50", className
      )}
      {...props}
    >
      {children}
      {isSelected && (
        <span className="absolute right-2 flex items-center justify-center">
          <CheckIcon className="h-3.5 w-3.5" />
        </span>
      )}
    </button>
  )
}

/* ── Minor helpers ───────────────────────────────────────────────────────── */
function SelectGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("scroll-my-1 p-1", className)} {...props} />
}
function SelectLabel({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-2 py-1 text-xs font-medium text-muted-foreground", className)} {...props} />
}
function SelectSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
}
function SelectScrollUpButton(_: React.ComponentProps<"div">) { return null }
function SelectScrollDownButton(_: React.ComponentProps<"div">) { return null }

export {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel,
  SelectScrollDownButton, SelectScrollUpButton, SelectSeparator,
  SelectTrigger, SelectValue,
}
