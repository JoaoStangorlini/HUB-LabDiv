import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import "katex/dist/katex.min.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

import { ReadingProgressBar } from "@/components/reading/ReadingProgressBar";
import { ReadingExperienceProvider } from "@/components/reading/ReadingExperienceProvider";
import { ScrollToTop } from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "Hub de Comunicação Científica do Lab-Div",
  description: "O hub oficial de comunicação científica do Instituto de Física da Universidade de São Paulo.",
  openGraph: {
    title: "Hub de Comunicação Científica do Lab-Div",
    description: "O hub oficial de comunicação científica do Instituto de Física da Universidade de São Paulo.",
    images: ['/api/og?title=Hub%20de%20Comunicação%20Científica&category=Instituto%20de%20Física%20USP'],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LabDiv",
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value || '';
  const htmlClass = theme === 'dark' ? 'dark' : '';

  return (
    <html lang="pt-BR" suppressHydrationWarning className={htmlClass}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const supportDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && supportDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans selection:bg-brand-yellow selection:text-brand-blue bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 transition-colors duration-200 antialiased`}
        suppressHydrationWarning
      >
        <ReadingExperienceProvider>
          <ReadingProgressBar />
          <ScrollToTop />
          {children}
        </ReadingExperienceProvider>
      </body>
    </html>
  );
}
