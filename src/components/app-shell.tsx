import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FilePlus2,
  GitCompareArrows,
  BookOpen,
  ShieldAlert,
  Bell,
  Search,
  AlarmClock,
  Clock,
  UserCheck,
} from "lucide-react";
import { TrustFooter } from "@/components/trust-footer";
import { incidents } from "@/lib/mock-data";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEffect, useState, type ReactNode } from "react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/assessment/new", label: "New Assessment", icon: FilePlus2 },
  { to: "/regulatory-mapping", label: "Regulatory Mapping", icon: GitCompareArrows },
  { to: "/framework-explorer", label: "Framework Explorer", icon: BookOpen },
];

const notifications = [
  {
    id: "n1",
    icon: AlarmClock,
    tone: "text-danger",
    title: "DORA window closing",
    body: "INC-2041 must be notified to BaFin by 14:45 CET.",
  },
  {
    id: "n2",
    icon: Clock,
    tone: "text-warning",
    title: "NIS2 early warning due",
    body: "BSI early warning window closes in 18h 47m.",
  },
  {
    id: "n3",
    icon: UserCheck,
    tone: "text-muted-foreground",
    title: "Sign-off requested",
    body: "S. Ivanova was asked to review the INC-2041 draft notification.",
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const goTo = (to: string) => {
    setCommandOpen(false);
    navigate({ to });
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-[var(--sidebar-bg)]">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
          <div className="grid place-items-center h-9 w-9 rounded-md bg-primary/15 text-primary ring-1 ring-primary/30">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-semibold text-[15px]">DORA Copilot</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider">
              GRC · ICT Risk
            </div>
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
          <div className="h-8 w-8 rounded-full bg-primary/25 grid place-items-center text-xs font-semibold text-primary">
            MK
          </div>
          <div className="text-xs leading-tight">
            <div className="font-medium">M. Keller</div>
            <div className="text-muted-foreground">ICT Risk Officer</div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur px-6 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono text-[11px] rounded bg-accent px-1.5 py-0.5">
              Neopay Bank AG
            </span>
            <span>·</span>
            <span>
              Environment: <span className="text-foreground">Production</span>
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden md:flex items-center gap-2 rounded-md border border-border bg-[var(--surface-2)] px-2.5 py-1.5 text-xs text-muted-foreground w-72 hover:border-primary/40 transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search incidents, articles, RTS clauses…</span>
              <kbd className="ml-auto font-mono text-[10px] text-muted-foreground">⌘K</kbd>
            </button>
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative h-8 w-8 grid place-items-center rounded-md border border-border bg-[var(--surface-2)] text-muted-foreground hover:text-foreground">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-danger ring-2 ring-background" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="px-4 py-3 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Notifications
                </div>
                <div className="divide-y divide-border">
                  {notifications.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3">
                      <n.icon className={`h-4 w-4 mt-0.5 shrink-0 ${n.tone}`} />
                      <div>
                        <div className="text-sm font-medium">{n.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </header>
        <main className="flex-1 min-w-0">{children}</main>
        <TrustFooter />
      </div>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search incidents, articles, RTS clauses…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigate">
            {navItems.map((item) => (
              <CommandItem key={item.to} onSelect={() => goTo(item.to)}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Incidents">
            {incidents.map((inc) => (
              <CommandItem
                key={inc.id}
                value={`${inc.id} ${inc.title} ${inc.owner}`}
                onSelect={() => goTo("/assessment/new")}
              >
                <FilePlus2 className="h-4 w-4" />
                <span className="font-mono text-xs text-muted-foreground">{inc.id}</span>
                {inc.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
