"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ClientOnly } from "@/components/ClientOnly";
import { Shield, LayoutDashboard, Users, Zap, Eye, LogOut, Inbox } from "lucide-react";

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

      {/* Subtle dot grid */}
      <div className="dot-grid" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.5 }} />

      {/* Sidebar */}
      <aside style={{
        width: "228px", flexShrink: 0, position: "sticky", top: 0, height: "100vh",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        display: "flex", flexDirection: "column", padding: "20px 12px",
        background: "rgba(2,4,10,0.8)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        zIndex: 50, overflow: "hidden"
      }}>
        {/* Sidebar glow */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "200px", height: "200px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px", padding: "8px 12px", borderRadius: "10px" }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "8px",
            background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            <Shield size={14} color="var(--cyan)" />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "16px", letterSpacing: "-0.03em", color: "var(--text)" }}>
            veil<span style={{ color: "var(--cyan)" }}>pay</span>
          </span>
        </Link>

        {/* Nav section label */}
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 12px", marginBottom: "8px" }}>
          Menu
        </p>

        {/* Nav items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "10px",
                  background: active ? "rgba(0,212,255,0.08)" : "transparent",
                  border: `1px solid ${active ? "rgba(0,212,255,0.15)" : "transparent"}`,
                  color: active ? "var(--cyan)" : "var(--text-muted)",
                  cursor: "pointer", transition: "all 0.2s",
                  position: "relative"
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                    (e.currentTarget as HTMLDivElement).style.color = "var(--text)";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    (e.currentTarget as HTMLDivElement).style.color = "var(--text-muted)";
                  }
                }}
                >
                  {active && (
                    <div style={{
                      position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                      width: "3px", height: "16px", borderRadius: "0 2px 2px 0",
                      background: "var(--cyan)", boxShadow: "0 0 8px var(--cyan)"
                    }} />
                  )}
                  <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: active ? 600 : 500, fontSize: "14px" }}>
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 12px", borderRadius: "10px", cursor: "pointer",
              color: "var(--text-muted)", transition: "all 0.2s"
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.color = "var(--text)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.color = "var(--text-muted)"; }}>
              <LogOut size={14} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: "13px" }}>Back to Home</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", position: "relative", zIndex: 1 }}>
        {/* Top bar */}
        <header style={{
          height: "64px", position: "sticky", top: 0, zIndex: 40,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          padding: "0 32px", gap: "12px",
          background: "rgba(2,4,10,0.7)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)"
        }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)",
            padding: "5px 12px", borderRadius: "8px",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
            letterSpacing: "0.08em"
          }}>
            {process.env.NEXT_PUBLIC_NETWORK ?? "mainnet"}
          </div>
          <ClientOnly>
            <WalletMultiButton />
          </ClientOnly>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}