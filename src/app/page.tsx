"use client";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Shield,
  Eye,
  FileText,
  Zap,
  Lock,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { ClientOnly } from "@/components/ClientOnly";

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      {/* Glow */}
      <div
        style={{
          position: "fixed",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* NAV */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          justifyContent: "space-between",
          padding: "20px 40px",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(20px)",
          background: "rgba(5,8,16,0.8)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "var(--cyan-dim)",
              border: "1px solid var(--border-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={16} color="var(--cyan)" />
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "18px",
              color: "var(--text)",
            }}
          >
            veil<span style={{ color: "var(--cyan)" }}>pay</span>
          </span>
        </div>

        <ClientOnly>
          <WalletMultiButton />
        </ClientOnly>
      </nav>

      {/* HERO */}
      <main
        style={{
          position: "relative",
          zIndex: 1,
          paddingTop: "160px",
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "160px 40px 80px",
        }}
      >
        {/* Badge */}
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              padding: "6px 14px",
              borderRadius: "100px",
              border: "1px solid var(--border-accent)",
              background: "var(--cyan-dim)",
              display: "inline-flex",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--cyan)",
              }}
            >
              PRIVATE FINANCIAL INFRASTRUCTURE · SOLANA
            </span>
          </div>
        </div>

        {/* HEADLINE */}
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(48px, 7vw, 88px)",
            lineHeight: 1,
            color: "var(--text)",
            marginBottom: "28px",
          }}
        >
          Private Financial<br />
          <span
            style={{
              background:
                "linear-gradient(135deg, var(--cyan) 0%, #0088ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Infrastructure.
          </span>
        </h1>

        {/* SUBHEADING */}
        <p
          style={{
            fontSize: "18px",
            color: "var(--text-mid)",
            lineHeight: 1.7,
            maxWidth: "560px",
            marginBottom: "48px",
          }}
        >
          The complete privacy layer for Solana teams. Private payroll, stealth
          inbox, encrypted balances, and compliance tools — all powered by
          Umbra's ZK infrastructure.
        </p>

        {/* CTA */}
        <Link href="/dashboard">
          <button
            style={{
              padding: "14px 28px",
              borderRadius: "10px",
              background: "var(--cyan)",
              border: "none",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Launch App <ArrowRight size={16} />
          </button>
        </Link>

        {/* FEATURES */}
        <section style={{ marginTop: "120px" }}>
          <h2 style={{ color: "var(--text)" }}>Features</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {[
              "Private Payroll",
              "Compliance Dashboard",
              "Encrypted Balances",
            ].map((f) => (
              <div
                key={f}
                style={{
                  padding: "20px",
                  border: "1px solid var(--border)",
                }}
              >
                {f}
              </div>
            ))}
          </div>
        </section>

        {/* ROADMAP */}
        <section style={{ marginTop: "80px" }}>
          <h2 style={{ color: "var(--text)" }}>
            Payroll is just<br />the first module.
          </h2>

          <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>
            VeilPay is building the full private financial stack for Solana teams.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
            }}
          >
            {[
              "Private Payroll",
              "Stealth Inbox",
              "Shield Assets",
              "Compliance Tools",
              "Private Invoicing",
              "Contractor Payments",
              "DAO Treasury",
              "Recurring Payroll",
            ].map((item) => (
              <div
                key={item}
                style={{
                  padding: "16px",
                  border: "1px solid var(--border)",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer
          style={{
            marginTop: "100px",
            borderTop: "1px solid var(--border)",
            paddingTop: "20px",
          }}
        >
          veilpay · solana privacy infrastructure
        </footer>
      </main>
    </div>
  );
}