/* IdeaHolder service worker — receives push events and shows notifications. */

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = { title: "IdeaHolder", body: "", url: "/reminders" };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch (_) {
    /* leave defaults */
  }
  const options = {
    body: payload.body || "",
    icon: "/icon/android",
    badge: "/icon/tab",
    data: { url: payload.url || "/reminders" },
  };
  event.waitUntil(
    self.registration.showNotification(payload.title || "IdeaHolder", options),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/reminders";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((wins) => {
        for (const w of wins) {
          if (w.url.endsWith(target) && "focus" in w) return w.focus();
        }
        return self.clients.openWindow(target);
      }),
  );
});
