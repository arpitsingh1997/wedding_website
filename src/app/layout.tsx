import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Pinyon_Script } from "next/font/google";
import { VIEWPORT_BOOT_SCRIPT } from "@/lib/viewport-boot";
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
  maximumScale: 1,
  userScalable: false,
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
      <head>
        <script dangerouslySetInnerHTML={{ __html: VIEWPORT_BOOT_SCRIPT }} />
        {/* Never restore prior scroll — always enter at the closed bow / invite top */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if("scrollRestoration"in history)history.scrollRestoration="manual";}catch(e){}if(location.hash)history.replaceState(null,"",location.pathname+location.search);window.scrollTo(0,0);})();`,
          }}
        />
      </head>
      <body
        className={`${cormorant.className} font-display antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
