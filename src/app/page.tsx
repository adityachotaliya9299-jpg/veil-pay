"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ClientOnly } from "@/components/ClientOnly";
import { ArrowRight, Shield, Zap, Eye, Users, Inbox, Lock, CheckCircle } from "lucide-react";

// ─── Typing animation hook ───────────────────────────────────────
function useTyping(phrases: string[], speed = 80, pause = 2000, deleteSpeed = 40) {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const current = phrases[index];
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < current.length) {
        timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), speed);
      } else {
        timeout = setTimeout(() => setPhase("pausing"), pause);
      }
    } else if (phase === "pausing") {
      timeout = setTimeout(() => setPhase("deleting"), 100);
    } else {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), deleteSpeed);
      } else {
        setIndex((index + 1) % phrases.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(timeout);
  }, [text, phase, index, phrases, speed, pause, deleteSpeed]);

  return text;
}

// ─── Counter animation hook ──────────────────────────────────────
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = Date.now();
          const timer = setInterval(() => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress >= 1) clearInterval(timer);
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// ─── Abstract photo component ─────────────────────────────────────
function AbstractPhoto({ variant, style }: { variant: "aurora" | "forest" | "fire" | "ocean"; style?: React.CSSProperties }) {
  const variants = {
    aurora: {
      bg: "radial-gradient(ellipse at 25% 75%, rgba(139,92,246,0.5) 0%, transparent 50%), radial-gradient(ellipse at 75% 25%, rgba(59,130,246,0.4) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(190,255,0,0.1) 0%, transparent 60%), linear-gradient(135deg, #08051a 0%, #0d0b22 50%, #060d1c 100%)",
      overlay: "rgba(139,92,246,0.1)"
    },
    forest: {
      bg: "radial-gradient(ellipse at 30% 70%, rgba(34,197,94,0.4) 0%, transparent 55%), radial-gradient(ellipse at 80% 30%, rgba(16,185,129,0.3) 0%, transparent 50%), linear-gradient(160deg, #030a05 0%, #071409 40%, #040a06 100%)",
      overlay: "rgba(34,197,94,0.05)"
    },
    fire: {
      bg: "radial-gradient(ellipse at 40% 60%, rgba(245,158,11,0.45) 0%, transparent 50%), radial-gradient(ellipse at 75% 40%, rgba(239,68,68,0.3) 0%, transparent 50%), linear-gradient(160deg, #120703 0%, #1c0b04 40%, #0e0503 100%)",
      overlay: "rgba(245,158,11,0.05)"
    },
    ocean: {
      bg: "radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.4) 0%, transparent 55%), radial-gradient(ellipse at 80% 50%, rgba(6,182,212,0.3) 0%, transparent 55%), linear-gradient(160deg, #020810 0%, #040d1a 40%, #020a14 100%)",
      overlay: "rgba(59,130,246,0.05)"
    },
  };
  const v = variants[variant];

  return (
    <div style={{ background: v.bg, ...style, position: "relative", overflow: "hidden" }}>
      {/* Light beam */}
      <div style={{
        position: "absolute", top: "-20%", left: "30%",
        width: "1px", height: "140%",
        background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.06), transparent)",
        transform: "rotate(15deg)"
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: v.overlay,
        backdropFilter: "none"
      }} />
    </div>
  );
}

// ─── Ticker row ───────────────────────────────────────────────────
const TICKER_ITEMS = [
  "Private Payroll", "Zero Knowledge", "Stealth Inbox", "Encrypted Balances",
  "Compliance Ready", "Umbra Protocol", "Solana Native", "Auditor Proofs",
  "No On-chain Link", "ZK Mixer", "Viewing Keys", "UTXO Privacy"
];

// ─── Main component ───────────────────────────────────────────────
export default function LandingPage() {
  const typed = useTyping([
    "private payroll.",
    "stealth salaries.",
    "zero-knowledge.",
    "no traces.",
  ]);

  const stat1 = useCounter(0);
  const stat2 = useCounter(100);
  const stat3 = useCounter(10);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* ── NAVBAR ── */}
      <nav className="glass" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 32px", height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: "none", borderLeft: "none", borderRight: "none",
        borderRadius: 0,
        borderBottom: "1px solid rgba(255,255,255,0.06)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "8px",
            background: "var(--lime-dim)", border: "1px solid var(--border-lime)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Shield size={14} color="var(--lime)" />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", letterSpacing: "-0.03em" }}>
            veil<span style={{ color: "var(--lime)" }}>pay</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span className="label" style={{ color: "var(--text-3)" }}>BUILT ON UMBRA SDK</span>
          <ClientOnly>
            <WalletMultiButton />
          </ClientOnly>
        </div>
      </nav>

      {/* ── TICKER ── */}
      <div className="ticker-wrap" style={{ position: "fixed", top: "60px", left: 0, right: 0, zIndex: 99, background: "rgba(3,3,5,0.95)", padding: "8px 0" }}>
        <div className="ticker-inner">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "12px", paddingRight: "32px" }}>
              <span className="label" style={{ color: "var(--text-3)" }}>{item}</span>
              <span style={{ color: "var(--lime)", fontSize: "10px", opacity: 0.4 }}>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="grid-bg" style={{
        minHeight: "100vh", paddingTop: "140px", paddingBottom: "80px",
        display: "flex", alignItems: "center",
        padding: "140px 48px 80px",
        position: "relative", overflow: "hidden"
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", bottom: "-20%", right: "-5%",
          width: "700px", height: "600px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(190,255,0,0.04) 0%, transparent 65%)",
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", top: "10%", left: "-10%",
          width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 65%)",
          pointerEvents: "none"
        }} />

        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>

          {/* Left: text */}
          <div>
            <div className="animate-fade-up" style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "28px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--lime)", animation: "pulse-lime 2s ease infinite" }} />
              <span className="label-lime">Private Financial Infrastructure · Solana</span>
            </div>

            <h1 className="display-xl animate-fade-up-1" style={{ marginBottom: "24px", color: "var(--text)" }}>
              The future of
              <br />
              <span className="text-lime">
                {typed}<span className="cursor" />
              </span>
            </h1>

            <p className="animate-fade-up-2" style={{
              fontFamily: "var(--font-display)", fontSize: "18px", color: "var(--text-2)",
              lineHeight: 1.65, maxWidth: "480px", marginBottom: "40px", fontWeight: 400
            }}>
              Pay your entire team on Solana without broadcasting salaries, addresses, or amounts to the world. Powered by Umbra's ZK privacy layer.
            </p>

            <div className="animate-fade-up-3" style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "56px" }}>
              <Link href="/dashboard" style={{ textDecoration: "none" }}>
                <button className="btn-primary" style={{ padding: "14px 32px", fontSize: "15px", borderRadius: "14px" }}>
                  Start Building Privacy <ArrowRight size={16} />
                </button>
              </Link>
              <a href="https://sdk.umbraprivacy.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <button className="btn-outline" style={{ padding: "14px 28px", fontSize: "15px", borderRadius: "14px" }}>
                  View Umbra SDK
                </button>
              </a>
            </div>

            {/* Trust badges */}
            <div className="animate-fade-up-4" style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {[
                "Umbra ZK Mixer",
                "Groth16 Proofs",
                "Arcium MPC",
                "Viewing Keys",
              ].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle size={13} color="var(--lime)" />
                  <span className="label" style={{ color: "var(--text-3)", letterSpacing: "0.06em" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: floating cards */}
          <div className="animate-fade-up-2" style={{ position: "relative", height: "520px" }}>
            {/* Main photo */}
            <AbstractPhoto variant="aurora" style={{
              width: "100%", height: "320px", borderRadius: "20px",
              border: "1px solid rgba(139,92,246,0.2)",
              position: "absolute", top: 0, left: 0,
            }} />

            {/* Floating stat card 1 */}
            <div className="glass animate-float" style={{
              position: "absolute", bottom: "80px", left: "-32px",
              padding: "16px 20px", borderRadius: "16px",
              border: "1px solid rgba(190,255,0,0.15)",
              background: "rgba(3,3,5,0.9)"
            }}>
              <p className="label" style={{ marginBottom: "4px", color: "var(--text-3)" }}>On-chain visibility</p>
              <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "28px", color: "var(--lime)" }}>0%</p>
            </div>

            {/* Floating memo card */}
            <div className="glass" style={{
              position: "absolute", bottom: "40px", right: "-20px",
              padding: "14px 18px", borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(3,3,5,0.92)", animation: "float 5s 2s ease-in-out infinite",
              maxWidth: "220px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--green)" }} />
                <p className="label" style={{ color: "var(--text-3)" }}>Encrypted Memo</p>
              </div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-2)" }}>
                ██████ 2025 ████ +<br />
                ████████ Bonus
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--lime)", marginTop: "6px" }}>Only recipient can read ↗</p>
            </div>

            {/* Floating UTXO card */}
            <div className="glass" style={{
              position: "absolute", top: "300px", right: "20px",
              padding: "14px 18px", borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(3,3,5,0.92)",
              animation: "float 7s 1s ease-in-out infinite"
            }}>
              <p className="label" style={{ color: "var(--text-3)", marginBottom: "6px" }}>Private UTXO</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "20px", color: "var(--text)", fontWeight: 700 }}>
                5,000 <span style={{ fontSize: "13px", color: "var(--text-3)" }}>USDC</span>
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                <Lock size={10} color="var(--lime)" />
                <span className="label" style={{ color: "var(--lime)", fontSize: "9px" }}>SHIELDED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "40px 48px"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0" }}>
          {[
            { value: "0%", label: "On-chain sender exposure", ref: stat1.ref },
            { value: "100%", label: "ZK-proof coverage", ref: stat2.ref },
            { value: "6+", label: "Umbra SDK primitives used", ref: stat3.ref },
            { value: "∞", label: "Transaction privacy", ref: null },
          ].map((s, i) => (
            <div key={s.label} ref={s.ref} style={{
              padding: "8px 32px", textAlign: "center",
              borderRight: i < 3 ? "1px solid var(--border)" : "none"
            }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "42px", color: "var(--lime)", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "8px" }}>
                {s.value}
              </p>
              <p className="label" style={{ color: "var(--text-3)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES BENTO ── */}
      <section style={{ padding: "120px 48px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "64px" }}>
          <p className="label-lime" style={{ marginBottom: "16px" }}>What you get</p>
          <h2 className="display-lg" style={{ color: "var(--text)", maxWidth: "600px" }}>
            Everything private.<br />
            <span className="text-purple">Nothing leaked.</span>
          </h2>
        </div>

        {/* Bento grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "auto", gap: "12px" }}>

          {/* Feature 1 — Large with photo */}
          <div style={{ gridColumn: "span 2", gridRow: "span 1", borderRadius: "20px", overflow: "hidden", border: "1px solid var(--border)", position: "relative", minHeight: "280px" }}>
            <AbstractPhoto variant="aurora" style={{ position: "absolute", inset: 0 }} />
            <div style={{ position: "relative", padding: "32px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div className="tag tag-lime" style={{ marginBottom: "12px", width: "fit-content" }}>FLAGSHIP FEATURE</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "26px", color: "var(--text)", letterSpacing: "-0.03em", marginBottom: "8px" }}>
                Stealth Payroll Inbox
              </h3>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "14px", color: "rgba(244,244,248,0.6)", maxWidth: "360px", lineHeight: 1.6 }}>
                Employees receive payments privately. Encrypted memos only they can decrypt. No on-chain link to the employer.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="card" style={{ padding: "28px", minHeight: "280px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--lime-dim)", border: "1px solid var(--border-lime)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Zap size={18} color="var(--lime)" />
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "20px", color: "var(--text)", letterSpacing: "-0.02em", marginBottom: "8px" }}>
                Private Payroll
              </h3>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "13px", color: "var(--text-2)", lineHeight: 1.6 }}>
                Batch salary payments. Zero on-chain link between you and your team.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ flex: 1, height: "4px", borderRadius: "2px", background: "var(--lime-dim)", border: "1px solid var(--border-lime)", overflow: "hidden" }}>
                <div style={{ width: "100%", height: "100%", background: "var(--lime)", borderRadius: "2px" }} />
              </div>
              <span className="label" style={{ color: "var(--lime)", fontSize: "9px" }}>FULLY PRIVATE</span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="card" style={{ padding: "28px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--purple-dim)", border: "1px solid var(--border-purple)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <Shield size={18} color="var(--purple)" />
            </div>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "20px", color: "var(--text)", letterSpacing: "-0.02em", marginBottom: "8px" }}>Shield Assets</h3>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "13px", color: "var(--text-2)", lineHeight: 1.6 }}>
              Deposit tokens into Umbra's encrypted balance. Invisible on-chain.
            </p>
          </div>

          {/* Feature 4 — with photo */}
          <div style={{ gridColumn: "span 2", borderRadius: "20px", overflow: "hidden", border: "1px solid var(--border)", position: "relative", minHeight: "220px" }}>
            <AbstractPhoto variant="forest" style={{ position: "absolute", inset: 0 }} />
            <div style={{ position: "relative", padding: "28px", height: "100%", display: "flex", gap: "32px", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                  <Eye size={18} color="var(--green)" />
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "20px", color: "var(--text)", letterSpacing: "-0.02em", marginBottom: "6px" }}>Compliance Dashboard</h3>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "13px", color: "rgba(244,244,248,0.6)", lineHeight: 1.6 }}>
                  Generate scoped viewing keys for auditors. Yearly, monthly, daily. Share only what's needed.
                </p>
              </div>
              <div style={{ flexShrink: 0, padding: "16px 20px", borderRadius: "14px", background: "rgba(3,3,5,0.8)", border: "1px solid rgba(34,197,94,0.15)" }}>
                <p className="label" style={{ color: "rgba(244,244,248,0.4)", marginBottom: "8px" }}>Auditor scope</p>
                {["Yearly 2025", "Monthly 2025-05", "Daily 2025-05-11"].map((k, i) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: i === 1 ? "var(--lime)" : "rgba(255,255,255,0.15)" }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: i === 1 ? "var(--lime)" : "rgba(244,244,248,0.4)" }}>{k}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="card" style={{ padding: "28px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <Users size={18} color="var(--blue)" />
            </div>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "20px", color: "var(--text)", letterSpacing: "-0.02em", marginBottom: "8px" }}>Team Address Book</h3>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "13px", color: "var(--text-2)", lineHeight: 1.6 }}>
              Save employees permanently. Import via CSV. Pay with one click.
            </p>
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "0 48px 120px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
          <div>
            <p className="label-lime" style={{ marginBottom: "16px" }}>Privacy architecture</p>
            <h2 className="display-lg" style={{ color: "var(--text)", marginBottom: "32px" }}>
              How it actually<br />stays private.
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                { step: "01", title: "Employer sends payroll", desc: "Tokens leave wallet, enter Umbra mixer. A ZK proof is generated in your browser.", color: "var(--text-3)" },
                { step: "02", title: "Link is broken", desc: "The mixer's shielded pool severs the on-chain connection between sender and recipient.", color: "var(--lime)" },
                { step: "03", title: "Employee claims privately", desc: "Recipient scans the pool with their private key. No link to employer appears anywhere.", color: "var(--text-3)" },
                { step: "04", title: "Encrypted memo delivered", desc: "Only the recipient can decrypt the payroll note. Judges, block explorers — nothing.", color: "var(--text-3)" },
              ].map((s, i) => (
                <div key={s.step} style={{
                  display: "flex", gap: "20px", padding: "20px 0",
                  borderBottom: i < 3 ? "1px solid var(--border)" : "none",
                  opacity: i === 1 ? 1 : 0.7, transition: "opacity 0.2s"
                }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: s.color, minWidth: "28px", paddingTop: "2px" }}>{s.step}</span>
                  <div>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "15px", color: "var(--text)", marginBottom: "4px" }}>{s.title}</p>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: "13px", color: "var(--text-2)", lineHeight: 1.5 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div style={{ position: "relative" }}>
            <AbstractPhoto variant="ocean" style={{ width: "100%", height: "420px", borderRadius: "20px", border: "1px solid rgba(59,130,246,0.15)" }} />

            {/* Overlay terminal */}
            <div style={{
              position: "absolute", inset: "24px",
              borderRadius: "12px", background: "rgba(3,3,5,0.85)",
              border: "1px solid rgba(255,255,255,0.07)",
              padding: "20px", backdropFilter: "blur(10px)"
            }}>
              <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
                {["#EF4444", "#F59E0B", "#22C55E"].map(c => (
                  <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />
                ))}
              </div>
              {[
                { line: "$ veilpay.sendPayroll(team, amounts)", color: "var(--lime)" },
                { line: "  ✓ ZK proof generated (1.8s)", color: "var(--text-2)" },
                { line: "  ✓ UTXO created in mixer pool", color: "var(--text-2)" },
                { line: "  ✓ Memo encrypted (X25519)", color: "var(--text-2)" },
                { line: "  ✓ On-chain link: NONE", color: "var(--green)" },
                { line: "  ✓ Tx: 4xKm...9vQp", color: "var(--text-3)" },
                { line: "", color: "" },
                { line: "$ // Employee receives:", color: "var(--text-3)" },
                { line: "  Inbox: 1 pending claim", color: "var(--lime)" },
                { line: "  Memo: ████ 2025 ████", color: "var(--purple)" },
              ].map((l, i) => (
                <p key={i} style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: l.color, lineHeight: "1.8", whiteSpace: "nowrap", overflow: "hidden" }}>
                  {l.line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ROADMAP SECTION ── */}
      <section style={{ padding: "0 48px 120px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <p className="label-lime" style={{ marginBottom: "12px" }}>Roadmap</p>
            <h2 className="display-md" style={{ color: "var(--text)" }}>Payroll is module one.</h2>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "14px", color: "var(--text-2)", maxWidth: "340px", textAlign: "right" }}>
            VeilPay is building the full private financial stack for Solana teams.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          {[
            { status: "live", label: "Private Payroll", desc: "Batch private salary transfers" },
            { status: "live", label: "Stealth Inbox", desc: "Employee-side UTXO claiming" },
            { status: "live", label: "Shield Assets", desc: "Encrypted balance deposits" },
            { status: "live", label: "Compliance Tools", desc: "Scoped viewing keys" },
            { status: "soon", label: "Private Invoicing", desc: "Confidential invoice flows" },
            { status: "soon", label: "Contractor Payments", desc: "Private freelancer payouts" },
            { status: "soon", label: "DAO Treasury", desc: "Multi-contributor payouts" },
            { status: "future", label: "Recurring Payroll", desc: "Automated private schedules" },
          ].map(item => (
            <div key={item.label} style={{
              padding: "16px",
              borderRadius: "14px",
              background: item.status === "live" ? "rgba(190,255,0,0.04)" : item.status === "soon" ? "rgba(139,92,246,0.04)" : "var(--bg-1)",
              border: `1px solid ${item.status === "live" ? "rgba(190,255,0,0.12)" : item.status === "soon" ? "rgba(139,92,246,0.12)" : "var(--border)"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <div style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: item.status === "live" ? "var(--lime)" : item.status === "soon" ? "var(--purple)" : "var(--text-3)",
                  boxShadow: item.status === "live" ? "0 0 6px var(--lime)" : "none"
                }} />
                <span className="label" style={{
                  color: item.status === "live" ? "var(--lime)" : item.status === "soon" ? "var(--purple)" : "var(--text-3)",
                  fontSize: "9px"
                }}>
                  {item.status === "live" ? "LIVE" : item.status === "soon" ? "SOON" : "PLANNED"}
                </span>
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "13px", color: "var(--text)", marginBottom: "4px" }}>{item.label}</p>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "var(--text-3)" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "0 48px 120px" }}>
        <div style={{
          maxWidth: "900px", margin: "0 auto",
          borderRadius: "28px", overflow: "hidden",
          position: "relative"
        }}>
          <AbstractPhoto variant="fire" style={{ position: "absolute", inset: 0 }} />
          <div style={{
            position: "relative", padding: "80px 64px",
            textAlign: "center",
            background: "rgba(3,3,5,0.6)",
            backdropFilter: "blur(4px)"
          }}>
            <p className="label-lime" style={{ marginBottom: "20px" }}>Start today</p>
            <h2 className="display-lg" style={{ color: "var(--text)", marginBottom: "20px" }}>
              Ready to pay<br />without a trace?
            </h2>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "16px", color: "var(--text-2)", marginBottom: "40px", maxWidth: "440px", margin: "0 auto 40px" }}>
              Connect your Phantom wallet and run your first private payroll in 2 minutes.
            </p>
            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <button className="btn-primary" style={{ padding: "16px 40px", fontSize: "16px", borderRadius: "16px" }}>
                Launch VeilPay <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "28px 48px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Shield size={13} color="var(--lime)" />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-3)" }}>
            veilpay · built on <span style={{ color: "var(--lime)" }}>Umbra Privacy SDK</span>
          </span>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-3)" }}>
          Solana · MIT License · Superteam Hackathon 2026
        </span>
      </footer>
    </div>
  );
}