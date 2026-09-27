import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "M3*Palettes — A little color. A whole system.",
  description: "Create harmonious Material 3 color systems. Explore light and dark themes, copy design tokens, and download ready-to-use CSS.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
