"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ClientOnly } from "@/components/ClientOnly";
import { Shield, LayoutDashboard, Users, Zap, Eye, LogOut } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/team", label: "Team", icon: Users },       
  { href: "/payroll", label: "Payroll", icon: Zap },   
  { href: "/compliance", label: "Compliance", icon: Eye },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>

      {/* Sidebar */}
      <aside style={{
        width: "220px", flexShrink: 0,
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        padding: "24px 16px",
        position: "sticky", top: 0, height: "100vh", overflow: "hidden"
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px", paddingLeft: "8px" }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "8px",
            background: "var(--cyan-dim)", border: "1px solid var(--border-accent)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Shield size={14} color="var(--cyan)" />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "16px", letterSpacing: "-0.02em", color: "var(--text)" }}>
            veil<span style={{ color: "var(--cyan)" }}>pay</span>
          </span>
        </Link>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 8px", marginBottom: "8px" }}>
            Menu
          </p>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "8px", transition: "all 0.15s",
                  background: active ? "var(--cyan-dim)" : "transparent",
                  border: `1px solid ${active ? "var(--border-accent)" : "transparent"}`,
                  color: active ? "var(--cyan)" : "var(--text-muted)",
                  cursor: "pointer"
                }}>
                  <Icon size={15} />
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: active ? 600 : 500, fontSize: "14px" }}>{label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: back to home */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 12px", borderRadius: "8px",
            color: "var(--text-muted)", cursor: "pointer", transition: "color 0.15s"
          }}>
            <LogOut size={14} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "13px" }}>Back to Home</span>
          </div>
        </Link>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Top bar */}
        <header style={{
          height: "64px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          padding: "0 32px", gap: "16px",
          backdropFilter: "blur(10px)"
        }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)",
            padding: "4px 10px", borderRadius: "6px",
            background: "var(--bg-card)", border: "1px solid var(--border)"
          }}>
            devnet
          </div>
          <ClientOnly>
            <WalletMultiButton />
            </ClientOnly>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "40px 40px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}