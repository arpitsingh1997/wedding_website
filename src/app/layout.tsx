import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Pinyon_Script } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pinyon",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wedding Invitation",
  description: "Dharmi & Arpit — wedding celebration",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F3E9E6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${pinyon.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`${cormorant.className} min-h-screen overflow-hidden font-display antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
