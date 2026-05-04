import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { companyName } = await request.json();

    if (!companyName || typeof companyName !== "string") {
      return Response.json({ error: "회사명을 입력해주세요." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "OPENAI_API_KEY 환경변수가 설정되지 않았습니다." }, { status: 500 });
    }
const news = await getNaverNews(companyName);

const newsText = news.map((item, i) => `
${i + 1}. ${item.title}
- ${item.description}
- ${item.pubDate}
`).join("\n");
    
    const prompt = `
너는 국내 주식 투자 분석가다.

회사명: ${companyName}
[최신 뉴스]
${newsText}

[핵심 규칙]

1. 반드시 "결론"과 "한 줄 정리"를 맨 위에 먼저 작성
2. 결론 위에 아래 멘트를 추가

- 추천 → "형은 살거같다."
- 비추천 → "니는 이런걸 종목이라고 가져왔냐?"
- 중립 → "니 알아서해라"

3. 반드시 최신 트렌드 기준으로 분석
- 최소 2025년 하반기 ~ 2026년 이후 기준
- 과거 사업 (예: IPTV, 5G 등 구식 설명) 중심 설명 금지
- 현재 시장 키워드 중심:
  (AI, 데이터센터, 전력, 반도체, 전장, ESS, 금리, 정책 등)

4. 말투는 직설적이고 GPT 스타일
5. 근거 없는 내용은 "확실하지 않음" 표시
6. 절대 무조건 오른다 같은 표현 금지

[출력 형식 - JSON]

{
  "conclusion": "",
  "oneLine": "",
  "businessNature": [],
  "investmentPoints": [],
  "risks": [],
  "investmentView": [],
  "finalInterpretation": ""
}

[추가 규칙]

- conclusion은 반드시 추천/비추천/중립 중 하나의 뉘앙스를 명확히 포함
- outdated한 산업 설명 금지
- 최신 시장 흐름 반영 필수

`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content || "{}";
    return Response.json(JSON.parse(content));
  } catch (error) {
    return Response.json({ error: error.message || "분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
async function getNaverNews(companyName) {
  const query = encodeURIComponent(`${companyName} 주가 실적 전망`);
  const url = `https://openapi.naver.com/v1/search/news.json?query=${query}&display=5&sort=date`;

  const res = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET,
    },
  });

  if (!res.ok) return [];

  const data = await res.json();

  return data.items.map((item) => ({
    title: item.title.replace(/<[^>]*>/g, ""),
    description: item.description.replace(/<[^>]*>/g, ""),
    pubDate: item.pubDate,
  }));
}
