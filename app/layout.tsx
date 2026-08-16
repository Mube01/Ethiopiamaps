import type { Metadata } from "next";
import { Inter, Bodoni_Moda } from "next/font/google";
import "./globals.css";
import { EnquiryProvider } from "@/components/EnquiryProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
});

export const metadata: Metadata = {
  /* =========================================================
     BASIC SEO
  ========================================================= */

  metadataBase: new URL("https://www.ethiopiamaps.com"),

  title: {
    default: "Ethiopia Maps | Contemporary Ethiopian Art",
    template: "%s | Ethiopia Maps",
  },

  description:
    "Discover contemporary Ethiopian art, photography, and fine art prints inspired by the landscapes, cities, and culture of Ethiopia.",

  keywords: [
    "Ethiopia Maps",
    "Ethiopian art",
    "Ethiopian photography",
    "contemporary Ethiopian art",
    "Ethiopian artists",
    "Ethiopian photography prints",
    "Ethiopian art prints",
    "fine art prints Ethiopia",
    "Addis Ababa art",
    "Ethiopia photography",
    "African contemporary art",
    "Ethiopian artwork",
  ],

  authors: [
    {
      name: "Ethiopia Maps",
    },
  ],

  creator: "Ethiopia Maps",
  publisher: "Ethiopia Maps",

  /* =========================================================
     CANONICAL / ROBOTS
  ========================================================= */

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  /* =========================================================
     FAVICON / ICONS
  ========================================================= */

  icons: {
    icon: [
      {
        url: "/favicon.ico",
        type: "image/x-icon",
      },
      {
        url: "/4.webp",
        type: "image/webp",
      },
    ],

    apple: [
      {
        url: "/addis.png",
        type: "image/png",
      },
    ],
  },

  /* =========================================================
     OPEN GRAPH
     
     Used when sharing the website on:
     - Facebook
     - WhatsApp
     - LinkedIn
     - Discord
     - etc.
     
     Put your social sharing image here:
     
     /public/images/og-image.jpg
  ========================================================= */

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.ethiopiamaps.com",

    siteName: "Ethiopia Maps",

    title: "Ethiopia Maps | Contemporary Ethiopian Art",

    description:
      "Discover contemporary Ethiopian art, photography, and fine art prints inspired by the landscapes, cities, and culture of Ethiopia.",

    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ethiopia Maps — Contemporary Ethiopian Art",
      },
    ],
  },

  /* =========================================================
     TWITTER / X
  ========================================================= */

  twitter: {
    card: "summary_large_image",

    title: "Ethiopia Maps | Contemporary Ethiopian Art",

    description:
      "Discover contemporary Ethiopian art, photography, and fine art prints inspired by Ethiopia.",

    images: ["/images/og-image.jpg"],
  },

  /* =========================================================
     OTHER METADATA
  ========================================================= */

  category: "Art & Photography",

  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${bodoni.variable}`}
      >
        <EnquiryProvider>
          {children}
        </EnquiryProvider>
      </body>
    </html>
  );
}