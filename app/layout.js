import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Abhishek R",
  description:
    "Portfolio of Abhishek R – full-stack engineer and BCI/EEG researcher building intelligent products and neural interfaces.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased ${plusJakarta.className}`}>{children}</body>
    </html>
  );
}
