"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getWallets } from "@wallet-standard/app";
import {
  createSignerFromWalletAccount,
  getUmbraClient,
} from "@umbra-privacy/sdk";

const DEVNET_CONFIG = {
  network: "devnet" as const,
  rpcUrl: "https://api.devnet.solana.com",
  rpcSubscriptionsUrl: "wss://api.devnet.solana.com",
  indexerApiEndpoint: "https://utxo-indexer.api.umbraprivacy.com",
};

export type UmbraClientStatus =
  | "idle"
  | "initializing"
  | "ready"
  | "error";

export function useUmbraClient() {
  const { connected, publicKey } = useWallet();
  const clientRef = useRef<Awaited<ReturnType<typeof getUmbraClient>> | null>(null);
  const [status, setStatus] = useState<UmbraClientStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  // Track which pubkey we built the client for
  const builtForKey = useRef<string | null>(null);

  const initClient = useCallback(async () => {
    if (!connected || !publicKey) return;

    const pubkeyStr = publicKey.toBase58();
    // Don't rebuild if same wallet
    if (builtForKey.current === pubkeyStr && clientRef.current) return;

    setStatus("initializing");
    setError(null);

    try {
      // Discover wallet standard wallets
      const { get } = getWallets();
      const allWallets = get();

      // Find the wallet whose account matches the connected pubkey
      let matchedWallet = null;
      let matchedAccount = null;

      for (const w of allWallets) {
        for (const account of w.accounts) {
          if (account.address === pubkeyStr) {
            matchedWallet = w;
            matchedAccount = account;
            break;
          }
        }
        if (matchedWallet) break;
      }

      if (!matchedWallet || !matchedAccount) {
        throw new Error(
          "Wallet not found in Wallet Standard registry. Make sure Phantom or Solflare is connected."
        );
      }

      const signer = createSignerFromWalletAccount(matchedWallet, matchedAccount);

      const client = await getUmbraClient(
        {
          signer,
          ...DEVNET_CONFIG,
          deferMasterSeedSignature: true, // only prompt on first operation
        },
        {
          // Cache master seed in sessionStorage to avoid re-signing on page refresh
          masterSeedStorage: {
            load: async () => {
              try {
                const stored = sessionStorage.getItem(`umbra:seed:${pubkeyStr}`);
                if (!stored) return { exists: false };
                return { exists: true, seed: new Uint8Array(JSON.parse(stored)) };
              } catch {
                return { exists: false };
              }
            },
            store: async (seed: Uint8Array) => {
              try {
                sessionStorage.setItem(
                  `umbra:seed:${pubkeyStr}`,
                  JSON.stringify(Array.from(seed))
                );
              } catch {
                // sessionStorage might be unavailable
              }
            },
          },
        }
      );

      clientRef.current = client;
      builtForKey.current = pubkeyStr;
      setStatus("ready");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to initialize Umbra client";
      setError(msg);
      setStatus("error");
      console.error("[useUmbraClient]", err);
    }
  }, [connected, publicKey]);

  // Auto-init when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      initClient();
    } else {
      // Wallet disconnected — reset
      clientRef.current = null;
      builtForKey.current = null;
      setStatus("idle");
      setError(null);
    }
  }, [connected, publicKey, initClient]);

  return {
    client: clientRef.current,
    status,
    error,
    retry: initClient,
  };
}