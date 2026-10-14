import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://mygovthub.web.app"),
  title: {
    default: "MyGovt AI Hub | Autonomous Civic Portal & Municipal Infrastructure Platform",
    template: "%s | MyGovt AI Hub",
  },
  description:
    "MyGovt AI Hub (InfraPulse AI) is an intelligent citizen civic portal and government hub for urban hazard computer vision inspection, road pothole triage, municipal dispatch, and public grievance resolution.",
  applicationName: "MyGovt AI Hub",
  keywords: [
    "MyGovt Hub",
    "my govt hub",
    "mygovthub",
    "govt portal",
    "government portal",
    "civic portal",
    "citizen portal",
    "citizen civic portal",
    "infrapulse ai",
    "infrapulse",
    "municipal grievance portal",
    "civic issue reporting",
    "pothole complaint portal",
    "urban infrastructure triage",
    "smart city municipal portal",
    "public works portal",
    "SDG 11 sustainable cities",
    "hazard triage AI",
    "automated municipal dispatch",
  ],
  authors: [{ name: "MyGovt AI Hub Team" }],
  creator: "MyGovt AI Hub",
  publisher: "MyGovt AI Hub",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mygovthub.web.app",
    title: "MyGovt AI Hub | Civic Portal & Government Infrastructure Hub",
    description:
      "AI-powered citizen civic portal and government municipal hub for automated urban hazard triage, pothole detection, and real-time municipal dispatch.",
    siteName: "MyGovt AI Hub",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "MyGovt AI Hub Civic Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyGovt AI Hub | Civic Portal & Government Infrastructure Hub",
    description:
      "AI-powered citizen civic portal and government municipal hub for automated urban hazard triage and dispatch.",
    images: ["/logo.png"],
    creator: "@mygovthub",
  },
  alternates: {
    canonical: "https://mygovthub.web.app",
  },
  category: "Government & Civic Infrastructure",
  verification: {
    google: "CrjeWc-ZPV1jt8rxQXVI04Xa3-LuSkpQOH9KhUgy1DY",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://mygovthub.web.app/#webapp",
      "name": "MyGovt AI Hub",
      "alternateName": [
        "MyGovt Hub",
        "mygovthub",
        "InfraPulse AI",
        "Civic Portal",
        "Government Portal",
        "Citizen Civic Portal",
      ],
      "url": "https://mygovthub.web.app",
      "applicationCategory": "GovernmentApplication",
      "operatingSystem": "All",
      "description":
        "AI-powered citizen civic portal and government hub for urban hazard computer vision inspection, road defect triage, automated municipal dispatch, and public grievance resolution.",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "featureList": [
        "Citizen Civic Issue Reporting",
        "Autonomous Computer Vision Pothole Detection",
        "Geospatial Municipal Triage",
        "Automated Work Order Dispatch",
        "UN SDG 11 Sustainable Cities Tracking",
      ],
    },
    {
      "@type": "GovernmentService",
      "@id": "https://mygovthub.web.app/#service",
      "name": "MyGovt Hub Citizen Civic Services",
      "serviceType": "Civic Issue Reporting & Municipal Infrastructure Resolution",
      "provider": {
        "@type": "Organization",
        "name": "MyGovt AI Hub",
        "url": "https://mygovthub.web.app",
      },
      "areaServed": "Global / Municipal Jurisdictions",
      "description":
        "Public civic portal allowing citizens to report hazardous road conditions, infrastructure defects, and track municipal repairs in real-time.",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta
          name="google-site-verification"
          content="CrjeWc-ZPV1jt8rxQXVI04Xa3-LuSkpQOH9KhUgy1DY"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-slate-950 font-sans transition-colors duration-200">
        {/* Semantic SEO landmark for search engine crawlers */}
        <section className="sr-only" aria-label="About MyGovt AI Hub Civic Portal">
          <h1>MyGovt AI Hub - Intelligent Civic Portal and Government Hub</h1>
          <p>
            Welcome to MyGovt AI Hub (InfraPulse AI), the official citizen civic portal
            for autonomous urban infrastructure triage, pothole reporting, municipal work order dispatch,
            and sustainable smart city administration.
          </p>
          <h2>Civic Issue Resolution &amp; Municipal Government Portal</h2>
          <p>
            Citizens can report road hazards, water logging, street light failures, and urban defects
            with instant AI computer vision verification and live municipal dispatch tracking.
          </p>
        </section>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
