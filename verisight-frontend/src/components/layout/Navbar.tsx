import { Link, useLocation } from "wouter";
import { ShieldCheck, Home as HomeIcon, ScanLine, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const TABS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/detect", label: "Detect", icon: ScanLine },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Navbar() {
  const [location] = useLocation();
  const activeHref = TABS.find((t) =>
    t.href === "/" ? location === "/" : location.startsWith(t.href)
  )?.href ?? "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 pt-4">
      <div className="max-w-7xl mx-auto glass-tabs rounded-2xl px-3 md:px-4 py-2.5 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group pl-2 pr-3">
          <ShieldCheck className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
          <span className="font-bold text-sm tracking-[0.18em]">VERISIGHT</span>
        </Link>

        <div className="flex items-center gap-1 relative bg-black/30 rounded-xl p-1 border border-white/5">
          {TABS.map((tab) => {
            const isActive = activeHref === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center gap-2 z-10",
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-tab"
                    className="absolute inset-0 rounded-lg bg-primary shadow-[0_0_18px_rgba(0,255,255,0.45)]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10 hidden sm:inline">{tab.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2 pr-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            v2.4 · live
          </span>
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </nav>
  );
}
