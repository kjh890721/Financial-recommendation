import "./globals.css";

export const metadata = {
  title: "GPT 주식 분석",
  description: "회사명만 입력하면 투자 관점 요약을 제공합니다.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
