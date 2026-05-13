import "./globals.css";
import type { Metadata, Viewport } from "next";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";

export const metadata: Metadata = {
  title: "IdeaHolder",
  description: "Capture random ideas before they slip. Expand the good ones.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf9f6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen" suppressHydrationWarning>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
