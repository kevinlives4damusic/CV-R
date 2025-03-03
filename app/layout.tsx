import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Resume.AI - AI-Powered CV Review",
  description: "Optimize your CV with AI-powered analysis to pass ATS systems and land more interviews.",
  keywords: [
    "resume", 
    "CV", 
    "AI", 
    "review", 
    "job application", 
    "career", 
    "ATS", 
    "applicant tracking system", 
    "resume optimization", 
    "job search", 
    "career advice"
  ],
  authors: [{ name: "Resume.AI Team" }],
  creator: "Resume.AI",
  publisher: "Resume.AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://resume-ai.vercel.app/",
    siteName: "Resume.AI",
    title: "Resume.AI - AI-Powered CV Review",
    description: "Get your resume past AI gatekeepers with our AI-powered resume review tool. Improve your chances of landing interviews with personalized feedback.",
    images: [
      {
        url: "/images/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Resume.AI - AI-Powered Resume Review",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume.AI - AI-Powered CV Review",
    description: "Get your resume past AI gatekeepers with our AI-powered resume review tool",
    images: ["/images/og-image.webp"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased bg-black text-white`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
