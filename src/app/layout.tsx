import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://virtual-enterprise.web.app"),
  title: {
    default: "Virtual Enterprise — Fábrica Autónoma de Micro-SaaS (v0.1.0 MVP)",
    template: "%s | Virtual Enterprise",
  },
  description:
    "Plataforma multi-agente en runtime impulsada por Google Antigravity y Gemini 3.8 Flash para la investigación, diseño, desarrollo y despliegue de micro-SaaS con supervisión Human-in-the-Loop.",
  keywords: [
    "multi-agente",
    "IA",
    "Gemini 3.8 Flash",
    "Google Antigravity",
    "micro-SaaS",
    "Human-in-the-Loop",
    "Next.js 14",
    "Tailwind CSS",
    "automatización B2B",
  ],
  authors: [{ name: "Claudio Ceppi", url: "https://github.com/ClaudioCeppi83" }],
  creator: "Claudio Ceppi",
  publisher: "Virtual Enterprise AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Virtual Enterprise — Fábrica Autónoma de Micro-SaaS",
    description:
      "Sistema multi-agente en runtime donde agentes de IA operan como departamentos de una empresa virtual (CEO, Discovery, Producto, Growth, Ingeniería y DevOps).",
    url: "https://virtual-enterprise.web.app",
    siteName: "Virtual Enterprise",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Virtual Enterprise — Fábrica Autónoma de Micro-SaaS",
    description:
      "Plataforma multi-agente en runtime con Gemini 3.8 Flash y Google Antigravity.",
    creator: "@ClaudioCeppi",
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
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Virtual Enterprise",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Fábrica autónoma de micro-SaaS basada en un colectivo multi-agente en runtime supervisado mediante un tablero Kanban Human-in-the-Loop.",
  creator: {
    "@type": "Person",
    name: "Claudio Ceppi",
    url: "https://github.com/ClaudioCeppi83",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-slate-950 text-slate-100 font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
