import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://abhishek-r.vercel.app";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "Abhishek R",
  description:
    "Portfolio of Abhishek R – full-stack engineer and BCI/EEG researcher building intelligent products and neural interfaces.",
  openGraph: {
    images: ["/herobg.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/herobg.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased ${plusJakarta.className}`}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
