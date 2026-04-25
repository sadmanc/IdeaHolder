"use client";

import { useEffect, useState, useTransition } from "react";
import { sendTestPush } from "@/app/actions";

type Status = "loading" | "unsupported" | "denied" | "subscribed" | "available";

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const buffer = new ArrayBuffer(raw.length);
  const arr = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export default function EnableNotifications({
  vapidPublicKey,
}: {
  vapidPublicKey: string;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [testPending, startTest] = useTransition();
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        if (!cancelled) setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setStatus("denied");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (!cancelled) setStatus(existing ? "subscribed" : "available");
      } catch {
        if (!cancelled) setStatus("available");
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    setError(null);
    setBusy(true);
    try {
      if (!vapidPublicKey) {
        throw new Error("Server is missing NEXT_PUBLIC_VAPID_PUBLIC_KEY.");
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus(perm === "denied" ? "denied" : "available");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      const json = sub.toJSON() as {
        endpoint?: string;
        keys?: { p256dh?: string; auth?: string };
      };
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error("Subscription is missing keys.");
      }
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
          user_agent: navigator.userAgent,
        }),
      });
      if (!res.ok) {
        throw new Error(`Server rejected subscription (${res.status}).`);
      }
      setStatus("subscribed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't enable notifications.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setError(null);
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        });
      }
      setStatus("available");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't disable.");
    } finally {
      setBusy(false);
    }
  }

  function fireTest() {
    setTestResult(null);
    startTest(async () => {
      try {
        await sendTestPush();
        setTestResult("Test push sent. Check your devices.");
      } catch (e) {
        setTestResult(
          e instanceof Error ? e.message : "Couldn't send test push.",
        );
      }
    });
  }

  return (
    <div className="rounded border border-neutral-200 bg-white p-3">
      <h3 className="text-sm font-medium text-neutral-900">Notifications</h3>
      <div className="mt-1 text-xs text-neutral-600">
        {status === "loading" && <p>Checking…</p>}
        {status === "unsupported" && (
          <p>
            This browser doesn&apos;t support push notifications. On iPhone,
            install the app to your Home Screen first.
          </p>
        )}
        {status === "denied" && (
          <p>
            Notifications are blocked for this site. Enable them in your
            browser&apos;s site settings, then reload.
          </p>
        )}
        {status === "available" && (
          <p>Not enabled on this device.</p>
        )}
        {status === "subscribed" && (
          <p>Enabled on this device.</p>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {status === "available" && (
          <button
            type="button"
            onClick={enable}
            disabled={busy}
            className="rounded bg-black px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
          >
            {busy ? "Enabling…" : "Enable on this device"}
          </button>
        )}
        {status === "subscribed" && (
          <>
            <button
              type="button"
              onClick={fireTest}
              disabled={testPending}
              className="rounded bg-black px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
            >
              {testPending ? "Sending…" : "Send test push"}
            </button>
            <button
              type="button"
              onClick={disable}
              disabled={busy}
              className="rounded border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 transition-colors hover:border-neutral-500 disabled:opacity-60"
            >
              {busy ? "…" : "Disable on this device"}
            </button>
          </>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {testResult && (
        <p className="mt-2 text-xs text-neutral-500">{testResult}</p>
      )}
    </div>
  );
}
