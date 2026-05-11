# VeilPay - Private Financial Infrastructure for Solana

<div align="center">

![VeilPay Banner](https://img.shields.io/badge/VeilPay-Private%20Financial%20Infrastructure-BEFF00?style=for-the-badge&labelColor=030305)

[![Built on Umbra SDK](https://img.shields.io/badge/Built%20on-Umbra%20SDK-BEFF00?style=flat-square&labelColor=030305)](https://sdk.umbraprivacy.com)
[![Solana](https://img.shields.io/badge/Network-Solana%20Mainnet-9945FF?style=flat-square)](https://solana.com)
[![Next.js](https://img.shields.io/badge/Framework-Next.js%2014-black?style=flat-square)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)

**"ProtonMail for salaries."**

*Private payroll, stealth inbox, encrypted balances, and compliance tools — powered by Umbra's ZK privacy layer.*

[**Live Demo →**](https://veil-pay-mu.vercel.app) | [**Demo Video**](https://www.loom.com/share/277c45481fff4406a68629c5ef0853a4) | [**Umbra SDK Docs →**](https://sdk.umbraprivacy.com)

</div>

---

## 🔒 What is VeilPay?

VeilPay is the **complete private financial infrastructure platform** for Solana teams. It solves a fundamental problem with on-chain payroll: **every salary payment on Solana is publicly visible**.

When a company pays employees in crypto today, anyone with access to a block explorer can see:
- Every recipient wallet address
- Exact salary amounts for every employee
- Payment frequency revealing team size
- Total payroll costs exposing company financials
- Permanent, immutable public record of all compensation

VeilPay makes this **impossible** — using Umbra's ZK UTXO mixer, encrypted balances, X25519 key encryption, and Arcium MPC co-signing.

---

## 🎯 The Problem

```
❌ Traditional on-chain payroll:
Company Wallet ──[VISIBLE AMOUNT]──► Employee Wallet
      ↑                                     ↑
 Anyone can see                        Anyone can see
 amount, timing,                    this person works here
 total spent

✅ VeilPay private payroll:
Company Wallet ──► Umbra ZK Mixer ──► Employee Inbox
      ↑                 ↑                    ↑
 Entry visible      Link broken          Amount hidden
                  (ZK Proof)         Address unlinkable
                                     Memo encrypted
```

---

## ✨ Features

### 💸 Private Payroll
Send USDC to your entire team in a single payroll run. Each recipient receives a private UTXO via Umbra's mixer — no on-chain link between employer and employee. Amounts are fully confidential. Includes encrypted memo per recipient.

**Key flow:**
1. Employer adds recipients (name, address, amount, encrypted memo)
2. Click "Send Payroll Run"
3. ZK proof generated in browser via snarkjs (Groth16)
4. Private UTXOs created in Umbra mixer pool
5. Each employee gets a claimable UTXO — zero on-chain link to employer

### 📬 Stealth Payroll Inbox *(Flagship Feature)*
The "ProtonMail for salaries." Employees connect their wallet and see incoming private payments. Funds appear as `████████` until the employee reveals them with their private key. Each payment includes an **encrypted memo** (e.g. *"August 2025 Salary + Q3 Bonus"*) that only the recipient can decrypt.

**Key flow:**
1. Employee connects wallet → inbox scans Umbra mixer for their UTXOs
2. Pending payments show as redacted amounts
3. Click **Reveal Memo** → X25519 decryption → memo appears
4. Click **Claim Payment** → ZK proof generated → funds move to encrypted balance
5. Relayer pays gas fees — employee wallet never appears as fee payer

### 🛡️ Shield Assets
Move tokens from your public wallet into Umbra's encrypted balance. Your balance becomes completely invisible on-chain — only queryable by the account owner.

### 👥 Team Address Book
Persistent employee management in your browser. Add employees with labels, departments, wallet addresses. Import via CSV. Auto-populate payroll runs. Search and filter by department.

### 📊 Compliance Dashboard
Generate scoped viewing keys derived from your master viewing key using Poseidon hashing. The key hierarchy enables **selective disclosure**:

```
Master Viewing Key (never shared)
├── Yearly Key  { year: 2025 }          → share for annual audit
│   ├── Monthly Key { year: 2025, month: 5 }  → share for monthly review
│   │   └── Daily Key { year: 2025, month: 5, day: 11 }
```

Export an **Auditor Package** (JSON) with the viewing key, scope metadata, and SDK integration instructions.

---

## 🔧 Umbra SDK Integration

VeilPay integrates **10+ Umbra SDK primitives** — Umbra is not a wrapper, it IS the privacy layer:

| Feature | Umbra SDK Function | Package |
|---------|-------------------|---------|
| Client initialization | `getUmbraClient` | `@umbra-privacy/sdk` |
| Wallet Standard signer | `createSignerFromWalletAccount` | `@umbra-privacy/sdk` |
| User registration | `getUserRegistrationFunction` | `@umbra-privacy/sdk` |
| Registration ZK proof | `getUserRegistrationProver` | `@umbra-privacy/web-zk-prover` |
| Check account state | `getUserAccountQuerierFunction` | `@umbra-privacy/sdk` |
| **Private payroll send** | `getPublicBalanceToReceiverClaimableUtxoCreatorFunction` | `@umbra-privacy/sdk` |
| **Payroll ZK proof** | `getCreateReceiverClaimableUtxoFromPublicBalanceProver` | `@umbra-privacy/web-zk-prover` |
| **Scan inbox UTXOs** | `getClaimableUtxoScannerFunction` | `@umbra-privacy/sdk` |
| **Claim UTXOs → private** | `getReceiverClaimableUtxoToEncryptedBalanceClaimerFunction` | `@umbra-privacy/sdk` |
| **Claim ZK proof** | `getReceiverClaimableUtxoToEncryptedBalanceClaimerProver` | `@umbra-privacy/web-zk-prover` |
| **Relayer (gasless claim)** | `getUmbraRelayer` | `@umbra-privacy/sdk` |
| **Shield/deposit** | `getPublicBalanceToEncryptedBalanceDepositorFunction` | `@umbra-privacy/sdk` |
| **Query private balance** | `getEncryptedBalanceQuerierFunction` | `@umbra-privacy/sdk` |
| **Compliance keys** | `client.monthlyViewingKey.generate()` | `@umbra-privacy/sdk` |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VeilPay Frontend (Next.js 14)            │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │  useUmbra    │  │  Payroll     │  │  Inbox         │   │
│  │  Client.ts   │  │  Page        │  │  Page          │   │
│  │              │  │  (send UTXO) │  │  (claim UTXO)  │   │
│  └──────┬───────┘  └──────┬───────┘  └───────┬────────┘   │
│         │                 │                   │             │
│  ┌──────▼─────────────────▼───────────────────▼──────────┐ │
│  │              @umbra-privacy/sdk                        │ │
│  │   getUmbraClient → UmbraClient instance                │ │
│  │   Signer: createSignerFromWalletAccount (Wallet Std)   │ │
│  └──────────────────────────┬─────────────────────────────┘ │
│                             │                               │
│  ┌──────────────────────────▼─────────────────────────────┐ │
│  │         @umbra-privacy/web-zk-prover                   │ │
│  │   snarkjs (Groth16) — ZK proofs in browser             │ │
│  │   Proving keys downloaded from CDN (~10MB, cached)     │ │
│  └──────────────────────────────────────────────────────--┘ │
└─────────────────────────────┬───────────────────────────────┘
                              │ Solana Transactions
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Solana Mainnet                            │
│                                                             │
│  ┌─────────────────────┐  ┌──────────────────────────────┐ │
│  │  Umbra Program       │  │  Arcium MPC Network          │ │
│  │  UMBRAD2ishe...     │  │  (encrypted computation)     │ │
│  │  - Mixer pool       │  │  - Co-signs transactions     │ │
│  │  - UTXO commitments │  │  - Confidential arithmetic   │ │
│  │  - Encrypted PDA    │  └──────────────────────────────┘ │
│  └─────────────────────┘                                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  UTXO Indexer API (utxo-indexer.api.umbraprivacy.com)│  │
│  │  - Indexes mixer pool commitments                    │   │
│  │  - Enables efficient scanning for recipients        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Privacy Model

```
SENDER PRIVACY:
  Employer Wallet ──ZK Proof──► Umbra Mixer ✓ (amount hidden, entry obfuscated)

RECIPIENT PRIVACY:
  Umbra Mixer ──ZK Proof──► Employee Inbox ✓ (no link to mixer deposit)

AMOUNT PRIVACY:
  All UTXO values encrypted with X25519 key ✓

MEMO PRIVACY:
  Encrypted with recipient's Umbra X25519 public key ✓
  Only decryptable by the recipient's master seed ✓

COMPLIANCE:
  Poseidon-derived hierarchical viewing keys ✓
  Master → Yearly → Monthly → Daily scope ✓
  Non-reversible (child key cannot derive parent) ✓

FEE PRIVACY:
  Relayer pays SOL gas fees ✓
  Recipient wallet never appears as fee payer on-chain ✓
```

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js 14 (App Router) | Full-stack React |
| **Language** | TypeScript | Type safety |
| **Privacy Core** | `@umbra-privacy/sdk` | All ZK operations |
| **ZK Proofs** | `@umbra-privacy/web-zk-prover` | Browser-native Groth16 |
| **ZK Runtime** | snarkjs | Proof generation |
| **Wallet** | `@solana/wallet-adapter-react` | Phantom/Solflare |
| **Wallet Standard** | `@wallet-standard/app` | Umbra signer creation |
| **Solana Kit** | `@solana/kit` | Transaction encoding |
| **Blockchain** | Solana (mainnet) | Settlement layer |
| **Fonts** | Space Grotesk + Space Mono | UI typography |
| **Storage** | localStorage | Team/history persistence |
| **Deployment** | Vercel | Hosting |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Phantom or Solflare wallet
- USDC on Solana mainnet (for live transactions)

### Installation

```bash
# Clone the repository
git clone https://github.com/adityachotaliya9299-jpg/veil-pay
cd veil-pay

# Install dependencies (legacy peer deps required for snarkjs compatibility)
npm install --legacy-peer-deps
```

### Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Mainnet RPC endpoint (use Helius for better reliability)
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com

# For production (recommended):
# NEXT_PUBLIC_RPC_URL=https://rpc.helius.xyz/?api-key=YOUR_KEY

NEXT_PUBLIC_NETWORK=mainnet
```

### Run Development Server

```bash
npm run dev
```

> **Note:** First ZK proof generation downloads ~10MB of proving keys from CDN.
> This is cached after the first run. Subsequent proofs generate in 1-3 seconds.

Open [http://localhost:3000](http://localhost:3000)

### Build & Deploy

```bash
# Production build
npm run build

# Deploy to Vercel
npx vercel --prod
```

---

## 📱 Usage Guide

### For Employers

#### Send Private Payroll

```
1. Navigate to /team → add employees (name, address, department)
2. Navigate to /payroll → click "New Payroll Run"
3. Select token (USDC mainnet/devnet)
4. Add recipients manually OR click "Import CSV"
   CSV format: name, address, amount
5. Add encrypted memo per employee:
   e.g. "August 2025 Salary + Q3 Performance Bonus"
6. Click "Send Payroll Run" → approve Phantom popup
7. Each employee receives a private UTXO
   ✓ No on-chain link from your wallet
   ✓ Amount hidden from block explorers
   ✓ Memo encrypted — only recipient can read
```

#### Shield Treasury Assets

```
1. Navigate to /shield
2. Select token and enter amount
3. Click "Shield" → ZK proof generated in browser
4. Tokens enter Umbra's encrypted balance
5. Balance becomes invisible on-chain
6. Only queryable using your master seed
```

#### Generate Compliance Viewing Keys

```
1. Navigate to /compliance
2. Select scope: Yearly / Monthly / Daily
3. Select time period
4. Click "Generate Viewing Key"
   ↳ Prompts wallet signMessage for key derivation
   ↳ Returns scoped hex viewing key
5. Share with accountant/auditor
6. Click "Auditor Package" → downloads JSON with:
   - The viewing key
   - Scope metadata
   - SDK integration instructions
   - Step-by-step decryption guide
```

### For Employees

#### Access Stealth Inbox

```
1. Navigate to /inbox
2. Connect wallet
3. Inbox scans Umbra mixer for your claimable UTXOs
4. Pending payments appear:
   ████████ USDC | ████ → encrypted memo
5. Click "Reveal Memo" → decrypts to: "August Salary + Bonus"
6. Click "Claim Payment":
   → ZK proof generated (Groth16, ~2-3 seconds)
   → Relayer submits transaction (gasless for you)
   → Funds arrive in your encrypted balance
   → Zero on-chain link to your employer
```

---

## 📁 Project Structure

```
veil-pay/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   │                               # - Typing animation
│   │   │                               # - Product mockup hero
│   │   │                               # - Feature bento grid
│   │   │                               # - How it works section
│   │   │                               # - Roadmap
│   │   ├── layout.tsx                  # Root layout + wallet providers
│   │   ├── globals.css                 # Design system (Space Grotesk)
│   │   ├── providers.tsx               # Solana wallet adapter setup
│   │   └── (app)/
│   │       ├── layout.tsx              # App shell with sidebar nav
│   │       ├── dashboard/page.tsx      # Overview + encrypted balance
│   │       ├── payroll/page.tsx        # Payroll runs + encrypted memos
│   │       ├── inbox/page.tsx          # Stealth inbox + UTXO claiming
│   │       ├── team/page.tsx           # Employee address book
│   │       ├── shield/page.tsx         # Shield/deposit assets
│   │       └── compliance/page.tsx     # Viewing keys + auditor export
│   ├── hooks/
│   │   ├── useUmbraClient.ts           # Umbra client via Wallet Standard
│   │   └── useUmbraAccount.ts          # Registration + account state
│   ├── lib/
│   │   └── teamStorage.ts             # localStorage: team, history, memos
│   └── components/
│       └── ClientOnly.tsx              # SSR hydration helper
├── next.config.ts                      # Webpack config for snarkjs
├── .env.example                        # Environment variable template
├── vercel.json                         # Deployment config
└── README.md
```

---

## 🔐 Security Model

### What's private

| Data | Privacy Level | How |
|------|--------------|-----|
| Sender address | ✅ Hidden from recipients and observers | Umbra mixer entry |
| Recipient address | ✅ Hidden from sender and observers | Stealth UTXO |
| Payment amount | ✅ Encrypted | ZK UTXO commitment |
| Payroll memo | ✅ End-to-end encrypted | X25519 key encryption |
| Encrypted balance | ✅ Hidden from all | Arcium MPC |
| Transaction link | ✅ Broken | ZK nullifier |

### What's visible

| Data | Visible To | Why |
|------|-----------|-----|
| Mixer pool deposits | Public | Decentralized pool requires public commitments |
| UTXO tree insertions | Public | Required for ZK proof verification |
| Claim transactions | Public (via relayer) | Settlement on Solana |
| Viewing key usage | Private to holder | Never posted on-chain |

### Compliance Architecture

The hierarchical viewing key system uses **Poseidon hash function** (ZK-friendly, same as used in the protocol itself):

```
signMessage(scope_string) → master_seed
POSEIDON(master_seed, year) → yearly_key
POSEIDON(yearly_key, month) → monthly_key
POSEIDON(monthly_key, day) → daily_key
```

- One-way: monthly key **cannot** derive yearly key
- Deterministic: same inputs always produce same key
- Auditor gets **exactly** the scope they need

---

## 🗺️ Roadmap

| Status | Module | Description |
|--------|--------|-------------|
| ✅ **Live** | Private Payroll | Batch salary via Umbra mixer |
| ✅ **Live** | Stealth Inbox | Employee UTXO claiming |
| ✅ **Live** | Encrypted Memos | X25519-encrypted payroll notes |
| ✅ **Live** | Shield Assets | Encrypted balance deposits |
| ✅ **Live** | Team Address Book | Persistent employee management |
| ✅ **Live** | CSV Import | Bulk recipient import |
| ✅ **Live** | Compliance Tools | Scoped viewing keys |
| ✅ **Live** | Auditor Package | JSON compliance export |
| 🔜 **Soon** | Private Invoicing | Confidential B2B invoices |
| 🔜 **Soon** | Contractor Payments | Private freelancer payouts |
| 🔜 **Soon** | DAO Treasury | Multi-contributor payouts |
| 📅 **Planned** | Recurring Payroll | Automated private schedules |
| 📅 **Planned** | Multi-sig Payroll | CFO + CEO approval flows |
| 📅 **Planned** | Private Reimbursements | Expense claims with privacy |

---

## 🤝 Contributing

Contributions welcome! Please open an issue first to discuss what you'd like to change.

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/veil-pay
cd veil-pay
npm install --legacy-peer-deps

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, then
git push origin feature/your-feature-name
# Open a pull request
```

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgements

- [**Umbra Privacy**](https://umbraprivacy.com) — for building the ZK privacy infrastructure that makes this possible
- [**Arcium**](https://arcium.com) — for the MPC co-signing network
- [**Superteam Earn**](https://earn.superteam.fun) — for hosting the hackathon
- [**Solana Foundation**](https://solana.com) — for the underlying blockchain

---

<div align="center">

**VeilPay** · Built with ❤️ on [Umbra Privacy SDK](https://sdk.umbraprivacy.com) · Solana Mainnet

*Private payroll for the onchain age.*

</div>
