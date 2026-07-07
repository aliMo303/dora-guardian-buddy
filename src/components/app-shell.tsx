import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FilePlus2, GitCompareArrows, BookOpen, ShieldAlert, Bell, Search } from "lucide-react";
import { TrustFooter } from "@/components/trust-footer";
import type { ReactNode } from "react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/assessment/new", label: "New Assessment", icon: FilePlus2 },
  { to: "/regulatory-mapping", label: "Regulatory Mapping", icon: GitCompareArrows },
  { to: "/framework-explorer", label: "Framework Explorer", icon: BookOpen },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-[var(--sidebar-bg)]">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
          <div className="grid place-items-center h-9 w-9 rounded-md bg-primary/15 text-primary ring-1 ring-primary/30">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-semibold text-[15px]">DORA Copilot</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider">GRC · ICT Risk</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace
          </div>
          {navItems.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-primary/15 text-foreground ring-1 ring-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="m-3 rounded-lg border border-border bg-[var(--surface-2)] p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-warning">
            <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
            Live regulatory feed
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            EBA DORA RTS on incident classification · in force since 17 Jan 2025.
          </p>
        </div>

        <div className="border-t border-border px-4 py-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/25 grid place-items-center text-xs font-semibold text-primary">MK</div>
          <div className="text-xs leading-tight">
            <div className="font-medium">M. Keller</div>
            <div className="text-muted-foreground">ICT Risk Officer</div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur px-6 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono text-[11px] rounded bg-accent px-1.5 py-0.5">Neopay Bank AG</span>
            <span>·</span>
            <span>Environment: <span className="text-foreground">Production</span></span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 rounded-md border border-border bg-[var(--surface-2)] px-2.5 py-1.5 text-xs text-muted-foreground w-72">
              <Search className="h-3.5 w-3.5" />
              <span>Search incidents, articles, RTS clauses…</span>
              <kbd className="ml-auto font-mono text-[10px] text-muted-foreground">⌘K</kbd>
            </div>
            <button className="relative h-8 w-8 grid place-items-center rounded-md border border-border bg-[var(--surface-2)] text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-danger ring-2 ring-background" />
            </button>
          </div>
        </header>
        <main className="flex-1 min-w-0">{children}</main>
        <TrustFooter />
      </div>
    </div>
  );
}