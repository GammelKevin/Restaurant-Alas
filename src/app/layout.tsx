import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/theme-context";
import { ToastProvider } from "@/context/toast-context";
import { VisitorTracker } from "@/components/visitor-tracker";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Restaurant ALAS - Griechische Spezialitäten in Moos",
  description: "Traditionelle griechische Küche im Restaurant ALAS in Moos, Niederbayern. Erleben Sie authentische griechische Gastfreundschaft und köstliche Spezialitäten.",
  keywords: ["Restaurant", "Griechisch", "Moos", "Niederbayern", "Griechische Küche", "ALAS"],
  authors: [{ name: "Restaurant ALAS" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="scroll-smooth">
      <body
        className={`${playfairDisplay.variable} ${poppins.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <ToastProvider>
            <VisitorTracker />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
