"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClientOnly } from "@/components/ClientOnly";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Shield, LayoutDashboard, Users, Zap,
  Eye, LogOut, Inbox, Bell
} from "lucide-react";
 
const NAV = [
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/team",       label: "Team",        icon: Users },
  { href: "/payroll",    label: "Payroll",     icon: Zap },
  { href: "/shield",     label: "Shield",      icon: Shield },
  { href: "/inbox",      label: "Inbox",       icon: Inbox },
  { href: "/compliance", label: "Compliance",  icon: Eye },
];
 
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
 
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
 
      {/* Subtle grid */}
      <div className="grid-bg" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.4 }} />
 
      {/* ── SIDEBAR ── */}
      <aside style={{
        width: "220px", flexShrink: 0, position: "sticky", top: 0, height: "100vh",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", padding: "16px 10px",
        background: "rgba(3,3,5,0.9)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        zIndex: 50
      }}>
 
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "9px", padding: "10px 10px", marginBottom: "24px", borderRadius: "10px", transition: "background 0.2s" }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-2)"}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "transparent"}>
          <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "var(--lime-dim)", border: "1px solid var(--border-lime)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Shield size={13} color="var(--lime)" />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15px", letterSpacing: "-0.03em", color: "var(--text)" }}>
            veil<span style={{ color: "var(--lime)" }}>pay</span>
          </span>
        </Link>
 
        {/* Section label */}
        <p className="label" style={{ padding: "0 10px", marginBottom: "6px", fontSize: "9px" }}>NAVIGATION</p>
 
        {/* Nav items */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "9px",
                  padding: "9px 10px", borderRadius: "10px",
                  background: active ? "var(--lime-dim)" : "transparent",
                  border: `1px solid ${active ? "var(--border-lime)" : "transparent"}`,
                  color: active ? "var(--lime)" : "var(--text-2)",
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLDivElement).style.background = "var(--bg-2)";
                    (e.currentTarget as HTMLDivElement).style.color = "var(--text)";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    (e.currentTarget as HTMLDivElement).style.color = "var(--text-2)";
                  }
                }}>
                  <Icon size={14} strokeWidth={active ? 2.5 : 2} />
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: active ? 600 : 400, fontSize: "13px" }}>
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
 
        {/* Bottom */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
          {/* Network badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 10px", marginBottom: "4px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--lime)", boxShadow: "0 0 6px var(--lime)" }} />
            <span className="label" style={{ color: "var(--text-3)", fontSize: "9px" }}>
              {process.env.NEXT_PUBLIC_NETWORK ?? "mainnet"}
            </span>
          </div>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "9px",
              padding: "9px 10px", borderRadius: "10px", cursor: "pointer",
              color: "var(--text-3)", transition: "all 0.15s"
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.color = "var(--text)"; (e.currentTarget as HTMLDivElement).style.background = "var(--bg-2)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.color = "var(--text-3)"; (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}>
              <LogOut size={13} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: "12px" }}>Back to Home</span>
            </div>
          </Link>
        </div>
      </aside>
 
      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", zIndex: 1, position: "relative" }}>
 
        {/* Top bar */}
        <header style={{
          height: "56px", position: "sticky", top: 0, zIndex: 40,
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          padding: "0 28px", gap: "10px",
          background: "rgba(3,3,5,0.85)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)"
        }}>
          <button style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--bg-1)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-3)" }}>
            <Bell size={13} />
          </button>
          <ClientOnly>
            <WalletMultiButton />
          </ClientOnly>
        </header>
 
        {/* Content */}
        <main style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}