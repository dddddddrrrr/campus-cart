import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "~/components/provider/ThemeProvider";
import AuthProvider from "~/components/provider/AuthProvider";
import Script from "next/script";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "校园超市",
  description: "校园超市",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Script src="https://js.stripe.com/v3/" strategy="lazyOnload" />
              <Toaster position="top-right" duration={2000} />
              {children}
            </ThemeProvider>
          </AuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
