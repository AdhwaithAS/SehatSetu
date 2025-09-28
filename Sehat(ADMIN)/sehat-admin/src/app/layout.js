import { Lato } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Script from "next/script";
import Navbar from "./components/navbar";

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

export const metadata = {
  title: "Sehat Admin",
  description: "Sehat Admin Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      <body className={`${lato.variable} antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
