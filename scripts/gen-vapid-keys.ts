import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();
console.log("VAPID_PUBLIC_KEY=" + keys.publicKey);
console.log("VAPID_PRIVATE_KEY=" + keys.privateKey);
console.log("NEXT_PUBLIC_VAPID_PUBLIC_KEY=" + keys.publicKey);
console.log();
console.log("Also set VAPID_SUBJECT to a mailto: URL, e.g.");
console.log("VAPID_SUBJECT=mailto:you@example.com");
