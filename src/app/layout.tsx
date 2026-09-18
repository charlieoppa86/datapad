import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Datapad",
  description:
    "Raw CSV와 AI-ready CSV에 같은 질문을 던져 LLM 답변 차이를 나란히 비교하는 진단 도구",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      {/* General Sans is not on Google Fonts; loaded from Fontshare for display/heading text */}
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
