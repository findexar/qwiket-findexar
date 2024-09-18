import { Inter, Roboto } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import StyledComponentsRegistry from '@/lib/registry'
import StripeProvider from "@/components/StripeProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const roboto = Roboto({ subsets: ['latin'], weight: ['300', '400', '700'], style: ['normal', 'italic'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={roboto.className}>
        <ClerkProvider>
          <StyledComponentsRegistry>
            <StripeProvider>
              {children}
            </StripeProvider>
          </StyledComponentsRegistry>
        </ClerkProvider>
      </body>
    </html>
  );
}
