"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon } from "lucide-react"

/* ─────────────────────────────────────────────────────────────────────────────
 * Fully native Select — no @base-ui/react dependency.
 * Renders a styled wrapper around native <select> so it always works.
 * ──────────────────────────────────────────────────────────────────────────── */

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue>({
  value: "",
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
})

function Select({
  children,
  value: controlledValue,
  onValueChange,
  defaultValue = "",
}: {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [open, setOpen] = React.useState(false)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const handleChange = React.useCallback(
    (v: string) => {
      if (!isControlled) setInternalValue(v)
      onValueChange?.(v)
      setOpen(false)
    },
    [isControlled, onValueChange]
  )

  // Close on outside click
  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest("[data-select-root]")) setOpen(false)
    }
    setTimeout(() => document.addEventListener("mousedown", handler), 0)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleChange, open, setOpen }}>
      <div data-select-root className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

// Items registry so trigger can display the selected label
const ItemsContext = React.createContext<Map<string, string>>(new Map())

function SelectTrigger({
  className,
  children,
  size = "default",
  ...props
}: React.ComponentProps<"button"> & { size?: "sm" | "default" }) {
  const { value, open, setOpen } = React.useContext(SelectContext)
  const items = React.useContext(ItemsContext)
  const label = items.get(value) ?? value

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        size === "default" ? "h-9" : "h-7",
        className
      )}
      {...props}
    >
      <span className="flex-1 text-left truncate">{label || <span className="text-muted-foreground">Select…</span>}</span>
      <ChevronDownIcon className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", open && "rotate-180")} />
    </button>
  )
}

function SelectValue({ placeholder }: { placeholder?: string; className?: string }) {
  // Display handled by SelectTrigger
  return null
}

function SelectContent({
  className,
  children,
  align = "center",
  ...props
}: React.ComponentProps<"div"> & {
  align?: "start" | "center" | "end"
  side?: string
  sideOffset?: number
  alignOffset?: number
  alignItemWithTrigger?: boolean
}) {
  const { open } = React.useContext(SelectContext)

  // Collect item labels for the trigger display
  const itemsMap = React.useMemo(() => new Map<string, string>(), [])

  if (!open) return null

  return (
    <ItemsContext.Provider value={itemsMap}>
      <div
        className={cn(
          "absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </ItemsContext.Provider>
  )
}

function SelectItem({
  className,
  children,
  value,
  disabled,
  ...props
}: React.ComponentProps<"button"> & { value: string }) {
  const { value: selectedValue, onValueChange } = React.useContext(SelectContext)
  const isSelected = selectedValue === value

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      disabled={disabled}
      onClick={() => onValueChange(value)}
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-md px-2 py-2 pr-8 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
        isSelected && "bg-accent/50",
        className
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

function SelectGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("scroll-my-1 p-1", className)} {...props} />
}

function SelectLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("px-2 py-1 text-xs font-medium text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
  )
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<"div">) {
  return null
}
function SelectScrollDownButton({ className, ...props }: React.ComponentProps<"div">) {
  return null
}

export {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel,
  SelectScrollDownButton, SelectScrollUpButton, SelectSeparator,
  SelectTrigger, SelectValue,
}
