import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Rubik } from "next/font/google";
import localFont from "next/font/local";
import { cookies } from "next/headers";

import InAppHistoryTracker from "@/app/InAppHistoryTracker";
import { APP_NAME, COOKIES } from "@/shared/sharedConstants";
import { parseTheme } from "@/shared/theme";

import "@/app/globals.css";

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
  title: APP_NAME,
};

// 안전 여백(env(safe-area-inset-*))을 쓰려면 화면 끝까지 그려야 한다
export const viewport: Viewport = {
  viewportFit: "cover",
};

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  // 화면 모드 (SC-10): 시스템 설정 따름이면 data-theme를 두지 않는다 (globals.css)
  const theme = parseTheme((await cookies()).get(COOKIES.theme)?.value);

  return (
    <html
      lang="ko"
      data-theme={theme === "system" ? undefined : theme}
      className={`${notoSansKr.variable} ${rubik.variable} ${tenada.variable}`}
    >
      <body>
        <InAppHistoryTracker />
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
