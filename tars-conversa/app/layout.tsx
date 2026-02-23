import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import ConvexClientProvider from "@/providers/ConvexClientProvider";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tars-Conversa",
  description: "Conversations that connect.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <ConvexClientProvider>
              {children}
              <Toaster position="bottom-right" richColors />
            </ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
