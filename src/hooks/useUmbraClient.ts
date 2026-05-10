"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getWallets } from "@wallet-standard/app";
import {
  createSignerFromWalletAccount,
  getUmbraClient,
} from "@umbra-privacy/sdk";

const RPC = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";

const DEVNET_CONFIG = {
  network: "devnet" as const,
  rpcUrl: RPC,
  rpcSubscriptionsUrl: RPC.replace("https://", "wss://").replace("http://", "ws://"),
  indexerApiEndpoint: "https://utxo-indexer.api.umbraprivacy.com",
};

export type UmbraClientStatus = "idle" | "initializing" | "ready" | "error";

export function useUmbraClient() {
  const { connected, publicKey } = useWallet();
  const clientRef = useRef<Awaited<ReturnType<typeof getUmbraClient>> | null>(null);
  const [status, setStatus] = useState<UmbraClientStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const builtForKey = useRef<string | null>(null);

  const initClient = useCallback(async () => {
    if (!connected || !publicKey) return;

    const pubkeyStr = publicKey.toBase58();
    if (builtForKey.current === pubkeyStr && clientRef.current) return;

    setStatus("initializing");
    setError(null);

    try {
      const { get } = getWallets();
      const allWallets = get();

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
        throw new Error("Wallet not found in Wallet Standard registry.");
      }

      const signer = createSignerFromWalletAccount(matchedWallet, matchedAccount);

      // No deferMasterSeedSignature — derive seed immediately at client creation
      // This ensures the seed is ready before any transaction signing happens
      const client = await getUmbraClient({
        signer,
        ...DEVNET_CONFIG,
      });

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

  useEffect(() => {
    if (connected && publicKey) {
      initClient();
    } else {
      clientRef.current = null;
      builtForKey.current = null;
      setStatus("idle");
      setError(null);
    }
  }, [connected, publicKey, initClient]);

  return { client: clientRef.current, status, error, retry: initClient };
}