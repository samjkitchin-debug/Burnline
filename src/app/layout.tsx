import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Burnline",
  description: "Know what you can spend today and still hit your savings target.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
