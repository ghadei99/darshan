import type { Metadata } from "next";
import { Cinzel, Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";

import { AnimatedBackground } from "@/components/AnimatedBackground";
import { AppNav } from "@/components/AppNav";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Darshana Suite",
  description:
    "A meditative workspace for classical Indian philosophical reasoning — syllogistic analysis, conditional logic, and more darshanas to come.",
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('darshana-theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${sourceSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="relative min-h-full flex flex-col bg-background text-foreground">
        <AnimatedBackground />
        <div className="relative z-10 flex min-h-full flex-col">
          <AppNav />
          {children}
        </div>
      </body>
    </html>
  );
}
