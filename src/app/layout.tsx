import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { PageShell } from "@/components/PageShell";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/Navbar";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "MediFund AI · Emergency medical crowdfunding & smart wallet",
  description:
    "AI-powered emergency fundraising, hospital verification, and transparent fintech wallets for life-critical care.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} h-full antialiased`}
    >
      <body className={`${plusJakarta.className} min-h-full`}>
        <Providers>
          <PageShell>
            <Navbar />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-6 sm:px-6">
              {children}
            </main>
          </PageShell>
        </Providers>
      </body>
    </html>
  );
}
