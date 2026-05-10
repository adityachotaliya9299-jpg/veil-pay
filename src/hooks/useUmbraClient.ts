"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { getUmbraClient } from "@umbra-privacy/sdk";

const RPC = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";

const DEVNET_CONFIG = {
  network: "devnet" as const,
  rpcUrl: RPC,
  rpcSubscriptionsUrl: RPC.replace("https://", "wss://").replace("http://", "ws://"),
  indexerApiEndpoint: "https://utxo-indexer.api.umbraprivacy.com",
};

export type UmbraClientStatus = "idle" | "initializing" | "ready" | "error";

export function useUmbraClient() {
  const { connected, publicKey, signTransaction, signMessage } = useWallet();
  const clientRef = useRef<Awaited<ReturnType<typeof getUmbraClient>> | null>(null);
  const [status, setStatus] = useState<UmbraClientStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const builtForKey = useRef<string | null>(null);

  const initClient = useCallback(async () => {
    if (!connected || !publicKey || !signTransaction || !signMessage) return;

    const pubkeyStr = publicKey.toBase58();
    if (builtForKey.current === pubkeyStr && clientRef.current) return;

    setStatus("initializing");
    setError(null);

    try {
      // Import kit encoder/decoder once at init time
      const { getTransactionEncoder, getTransactionDecoder } =
        await import("@solana/kit");

      const encoder = getTransactionEncoder();
      const decoder = getTransactionDecoder();

      // Custom signer: bypasses createSignerFromWalletAccount
      // Uses wallet adapter's signTransaction directly (avoids Wallet Standard bug)
      const signer = {
        address: pubkeyStr as any,

        async signTransaction(kitTx: any): Promise<any> {
          // 1. Encode @solana/kit tx → Solana wire bytes (same format as web3.js v1)
          const encoded = encoder.encode(kitTx);
          const txBytes = new Uint8Array(encoded as unknown as ArrayBufferLike);

          // 2. Deserialize as VersionedTransaction for wallet adapter
          const vTx = VersionedTransaction.deserialize(txBytes);

          // 3. Sign via wallet adapter (window.phantom.solana path — known to work)
          const signed = await signTransaction(vTx as any);

          // 4. Decode signed bytes back to @solana/kit format
          const signedBytes = signed.serialize();
          return decoder.decode(signedBytes);
        },

        async signTransactions(kitTxs: readonly any[]): Promise<any[]> {
          return Promise.all(kitTxs.map((tx: any) => signer.signTransaction(tx)));
        },

        async signMessage(message: Uint8Array): Promise<any> {
          const sig = await signMessage(message);
          return { bytes: sig };
        },
      };

      const client = await getUmbraClient({
        signer: signer as any,
        ...DEVNET_CONFIG,
      });

      clientRef.current = client;
      builtForKey.current = pubkeyStr;
      setStatus("ready");
      console.log("[useUmbraClient] Client ready, custom signer active");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to initialize Umbra client";
      setError(msg);
      setStatus("error");
      console.error("[useUmbraClient]", err);
    }
  }, [connected, publicKey, signTransaction, signMessage]);

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