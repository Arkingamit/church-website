import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Grace Community Church - Where Hearts Unite",
  description:
    "Join Grace Community Church for worship, fellowship, and spiritual growth. Live streaming, prayer wall, events, and more.",
  keywords:
    "church, faith, worship, community, prayer, events, live stream, spiritual growth",
  authors: [{ name: "Grace Community Church" }],
  openGraph: {
    title: "Grace Community Church - Where Hearts Unite",
    description:
      "A welcoming community where faith grows, hearts connect, and lives are transformed through God's love.",
    type: "website",
    images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@lovable_dev",
    images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
  },
};

import { PublicLayoutWrapper } from "@/components/ui/public-layout-wrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>
          <PublicLayoutWrapper>
            {children}
          </PublicLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
