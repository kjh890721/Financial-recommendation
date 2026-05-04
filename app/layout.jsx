import "./globals.css";

export const metadata = {
  title: "부자는 못돼도 똔똔은 칩시다",
  description: "회사명만 입력하면 투자 관점을 한 줄로 평가합니다.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
