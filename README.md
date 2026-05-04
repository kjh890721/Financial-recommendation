# GPT 주식 분석 웹사이트

회사명을 입력하면 결론, 한 줄 정리, 투자 포인트, 리스크를 보여주는 Next.js 웹사이트입니다.

## 로컬 실행

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`에 OpenAI API Key를 입력하세요.

```env
OPENAI_API_KEY=sk-...
```

## Vercel 배포

1. GitHub에 이 폴더를 업로드합니다.
2. Vercel에서 New Project를 누릅니다.
3. 해당 GitHub Repo를 선택합니다.
4. Environment Variables에 아래 값을 추가합니다.

```env
OPENAI_API_KEY=sk-...
```

5. Deploy를 누릅니다.
6. Settings > Domains에서 보유 도메인을 연결합니다.
7. 도메인 구매처 DNS에 Vercel이 안내하는 A Record 또는 CNAME을 추가합니다.

## 주의

- OpenAI API Key는 절대 프론트엔드에 넣으면 안 됩니다.
- 본 서비스는 투자 참고용이며 매수·매도 추천이 아닙니다.
