import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Pinyon_Script } from "next/font/google";
import { LANDING, LANDING_DESKTOP } from "@/components/opening/landing-assets";
import {
  LANDING2_DESKTOP,
  LANDING2_PHONE,
} from "@/components/opening/welcome-assets";
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
        {/* Critical: show desklanding art on desktop before CSS chunk loads */}
        <style
          dangerouslySetInnerHTML={{
            __html: `.art-desktop{display:none!important}html.is-desktop .art-phone{display:none!important}html.is-desktop img.art-desktop,html.is-desktop video.art-desktop{display:block!important;visibility:visible!important;opacity:1!important}@media (min-width:768px){.art-phone{display:none!important}img.art-desktop,video.art-desktop{display:block!important}}`,
          }}
        />
        {/* Warm bow + invite art so reload paints envelope first with invite ready underneath */}
        <link rel="preload" as="image" href={LANDING} />
        <link rel="preload" as="image" href={LANDING_DESKTOP} />
        <link rel="preload" as="image" href={LANDING2_PHONE} />
        <link rel="preload" as="image" href={LANDING2_DESKTOP} />
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
