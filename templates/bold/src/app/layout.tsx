import type { Metadata } from "next";
import config from "../../site.config.json";
import "./globals.css";

export const metadata: Metadata = {
  title: config.metaTitle,
  description: config.metaDescription,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ "--accent": config.accentColor } as React.CSSProperties}>
        {children}
      </body>
    </html>
  );
}
