"use client";
import { useState, useCallback, useEffect } from "react";
import {
  getUserRegistrationFunction,
  getUserAccountQuerierFunction,
} from "@umbra-privacy/sdk";
import { isRegistrationError } from "@umbra-privacy/sdk/errors";
import { getUserRegistrationProver } from "@umbra-privacy/web-zk-prover";
import type { useUmbraClient } from "./useUmbraClient";

type Client = ReturnType<typeof useUmbraClient>["client"];

export type RegistrationStatus =
  | "unknown"
  | "checking"
  | "unregistered"
  | "registering"
  | "registered"
  | "error";

export function useUmbraAccount(client: Client) {
  const [regStatus, setRegStatus] = useState<RegistrationStatus>("unknown");
  const [regError, setRegError] = useState<string | null>(null);
  const [isConfidential, setIsConfidential] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const checkRegistration = useCallback(async () => {
    if (!client) return;
    setRegStatus("checking");
    setRegError(null);

    try {
      const query = getUserAccountQuerierFunction({ client });
      const result = await query(client.signer.address);

      if (result.state === "non_existent") {
        setIsConfidential(false);
        setIsAnonymous(false);
        setRegStatus("unregistered");
      } else {
        // result.state === "exists"
        const { data } = result;
        setIsConfidential(data.isUserAccountX25519KeyRegistered ?? false);
        setIsAnonymous(data.isUserCommitmentRegistered ?? false);
        setRegStatus("registered");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setRegError(msg);
      setRegStatus("error");
      console.error("[useUmbraAccount] check:", err);
    }
  }, [client]);

  const register = useCallback(async () => {
    if (!client) return;
    setRegStatus("registering");
    setRegError(null);

    try {
      const zkProver = getUserRegistrationProver();
      const registerFn = getUserRegistrationFunction({ client }, { zkProver });
      const sigs = await registerFn({
        confidential: true,
        anonymous: true,
        callbacks: {
          userAccountInitialisation: {
            pre: async () => console.log("[Umbra] Creating account..."),
            post: async (_tx: unknown, sig: string) => console.log("[Umbra] Account created:", sig),
          },
          registerX25519PublicKey: {
            pre: async () => console.log("[Umbra] Registering encryption key..."),
            post: async (_tx: unknown, sig: string) => console.log("[Umbra] Key registered:", sig),
          },
          registerUserForAnonymousUsage: {
            pre: async () => console.log("[Umbra] Registering commitment..."),
            post: async (_tx: unknown, sig: string) => console.log("[Umbra] Commitment registered:", sig),
          },
        },
      });

      console.log(`[Umbra] Registered in ${sigs.length} tx(s)`);
      setIsConfidential(true);
      setIsAnonymous(true);
      setRegStatus("registered");
    } catch (err) {
      let msg = "Registration failed";
      if (isRegistrationError(err)) {
        switch (err.stage) {
          case "master-seed-derivation": msg = "Please sign the message in your wallet to set up Umbra."; break;
          case "transaction-sign": msg = "You cancelled the registration transaction."; break;
          case "zk-proof-generation": msg = "ZK proof generation failed. Please try again."; break;
          case "transaction-send": msg = "Transaction timed out. Please retry."; break;
          default: msg = `Registration failed at: ${err.stage}`;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setRegError(msg);
      setRegStatus("error");
      console.error("[useUmbraAccount] register:", err);
    }
  }, [client]);

  useEffect(() => {
    if (client) {
      checkRegistration();
    } else {
      setRegStatus("unknown");
      setIsConfidential(false);
      setIsAnonymous(false);
      setRegError(null);
    }
  }, [client, checkRegistration]);

  return { regStatus, regError, isConfidential, isAnonymous, register, checkRegistration };
}