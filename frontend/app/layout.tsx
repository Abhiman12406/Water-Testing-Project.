import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AQUAGUARD AI // Neo-Brutalist Water Quality Telemetry & Anomaly Detector",
  description: "Machine learning spatio-temporal water quality prediction platform powered by trained Random Forest, XGBoost, and Logistic Regression models on 37 USGS monitoring stations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-theme="light"
    >
      <body className="min-h-full flex flex-col selection:bg-[#ffde59] selection:text-black">
        {children}
      </body>
    </html>
  );
}
