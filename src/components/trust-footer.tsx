import { Link } from "@tanstack/react-router";
import { ShieldCheck, FileText, Lock } from "lucide-react";

export function TrustFooter() {
  return (
    <footer className="border-t border-border bg-[var(--surface-2)]/40 px-6 py-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
          <span className="font-medium text-foreground">DORA Copilot</span>
          <span className="hidden md:inline">·</span>
          <div className="flex items-center gap-3">
            <Link
              to="/privacy"
              className="hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <Lock className="h-3 w-3" />
              Privacy
            </Link>
            <Link
              to="/terms"
              className="hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <FileText className="h-3 w-3" />
              Terms
            </Link>
            <Link
              to="/security"
              className="hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <ShieldCheck className="h-3 w-3" />
              Security
            </Link>
          </div>
        </div>
        <div className="text-center md:text-right">© 2026 DORA Copilot. All rights reserved.</div>
      </div>
    </footer>
  );
}
