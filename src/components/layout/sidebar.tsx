"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PeerSpaceLogo } from "@/components/brand/logo";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const managerNav: NavItem[] = [
  { label: "Dashboard", href: "/manager", icon: "📊" },
  { label: "Richieste", href: "/manager/requests", icon: "📋" },
  { label: "Tutor", href: "/manager/tutors", icon: "👥" },
  { label: "Materie", href: "/manager/subjects", icon: "📚" },
  { label: "Inviti", href: "/manager/invites", icon: "🔑" },
  { label: "Report", href: "/manager/reports", icon: "💰" },
];

const tutorNav: NavItem[] = [
  { label: "Dashboard", href: "/tutor", icon: "📊" },
  { label: "Disponibili", href: "/tutor/available", icon: "📋" },
  { label: "Le mie richieste", href: "/tutor/my-requests", icon: "✅" },
  { label: "Profilo", href: "/tutor/profile", icon: "👤" },
];

export function Sidebar({ role, onLinkClick }: { role: string; onLinkClick?: () => void }) {
  const pathname = usePathname();
  const nav = role === "MANAGER" ? managerNav : tutorNav;

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <PeerSpaceLogo size="sm" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {role === "MANAGER" ? "Manager" : "Tutor"}
          </span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/manager" &&
              item.href !== "/tutor" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={
                isActive
                  ? {
                      backgroundColor: "var(--ps-accent-light)",
                      color: "var(--ps-accent)",
                    }
                  : undefined
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
