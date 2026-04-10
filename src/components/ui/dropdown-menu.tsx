"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/* ─────────────────────────────────────────────────────────────────────────────
 * Fully native DropdownMenu — no @base-ui/react dependency.
 * Uses React state + a portal div so all menu items fire correctly.
 * ──────────────────────────────────────────────────────────────────────────── */

interface DropdownMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue>({
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
  contentRef: { current: null },
})

function DropdownMenu({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  // Close on outside click — but NOT if clicking inside the menu content
  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (contentRef.current?.contains(target)) return
      setOpen(false)
    }
    // slight delay so trigger click doesn't immediately close
    const t = setTimeout(() => document.addEventListener("mousedown", handler), 0)
    return () => {
      clearTimeout(t)
      document.removeEventListener("mousedown", handler)
    }
  }, [open, setOpen])

  // Close on Escape
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, setOpen])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
      <div className="relative inline-flex">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

function DropdownMenuTrigger({
  children,
  className,
  asChild,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { setOpen, open, triggerRef } = React.useContext(DropdownMenuContext)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(!open)
  }

  if (asChild && React.isValidElement(children)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: (el: HTMLElement | null) => { triggerRef.current = el },
      onClick: handleClick,
    })
  }

  return (
    <button
      ref={(el) => { triggerRef.current = el }}
      type="button"
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}

function DropdownMenuContent({
  className,
  align = "start",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  align?: "start" | "end" | "center"
  sideOffset?: number
}) {
  const { open, contentRef } = React.useContext(DropdownMenuContext)
  if (!open) return null

  const alignClass =
    align === "end" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0"

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute top-full mt-1 z-50 min-w-32 w-max rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95",
        alignClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  onSelect,
  onClick,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  inset?: boolean
  variant?: "default" | "destructive"
  onSelect?: () => void
}) {
  const { setOpen } = React.useContext(DropdownMenuContext)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onClick?.(e)
    // Close menu first, then run the action
    setOpen(false)
    if (onSelect) {
      const cb = onSelect
      // Use setTimeout to ensure React state update is flushed before side-effects
      setTimeout(cb, 0)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
        variant === "destructive" && "text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive",
        inset && "pl-7",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<"div"> & { inset?: boolean }) {
  return (
    <div
      className={cn(
        "px-2 py-1 text-xs font-medium text-muted-foreground",
        inset && "pl-7",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuGroup({ ...props }: React.ComponentProps<"div">) {
  return <div {...props} />
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      {...props}
    />
  )
}

// Stubs for API compatibility
function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
function DropdownMenuSub({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
function DropdownMenuSubTrigger({ children, className, ...props }: React.ComponentProps<"button"> & { inset?: boolean }) {
  return (
    <button type="button" className={cn("flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent", className)} {...props}>
      {children}
    </button>
  )
}
function DropdownMenuSubContent({ children, className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("absolute left-full top-0 ml-1 min-w-32 rounded-lg bg-popover p-1 shadow-lg ring-1 ring-foreground/10", className)} {...props}>{children}</div>
}
function DropdownMenuCheckboxItem({ children, className, checked, ...props }: React.ComponentProps<"button"> & { checked?: boolean; inset?: boolean }) {
  return <button type="button" className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent", className)} {...props}>{children}</button>
}
function DropdownMenuRadioGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
function DropdownMenuRadioItem({ children, className, ...props }: React.ComponentProps<"button"> & { inset?: boolean }) {
  return <button type="button" className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent", className)} {...props}>{children}</button>
}

export {
  DropdownMenu, DropdownMenuPortal, DropdownMenuTrigger,
  DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel,
  DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
}
