import type { Metadata } from "next";
import { Noto_Sans_KR, Rubik } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
});

const rubik = Rubik({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-rubik",
});

const tenada = localFont({
  src: "../assets/fonts/Tenada.woff2",
  variable: "--font-tenada",
});

export const metadata: Metadata = {
  title: "Money Diary",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${rubik.variable} ${tenada.variable}`}
    >
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
