import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { companyName } = await request.json();
    const normalizedCompanyName = normalizeCompanyName(companyName);
    
    if (!companyName || typeof companyName !== "string") {
      return Response.json({ error: "회사명을 입력해주세요." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "OPENAI_API_KEY 환경변수가 설정되지 않았습니다." }, { status: 500 });
    }
const news = await getNaverNews(normalizedCompanyName);

if (news.length < 2) {
  return Response.json({
    conclusion: "회사명부터 똑바로 확인해라",
    oneLine: "니가 찾는 회사가 상장한지부터 확인해라",
    businessNature: [
      "회사명으로 확인 가능한 최신 뉴스가 부족합니다.",
      "종목명이 아니라 일반 단어이거나 잘못 입력된 값일 가능성이 큽니다."
    ],
    investmentPoints: [
      "분석 불가입니다. 정확한 회사명 또는 종목명을 입력해야 합니다."
    ],
    risks: [
      "존재하지 않는 회사명을 억지로 분석하면 잘못된 투자 판단으로 이어질 수 있습니다."
    ],
    investmentView: [
      "예: SK텔레콤, 삼성전자, LG전자처럼 실제 회사명을 입력하세요."
    ],
    finalInterpretation: "회사부터 제대로 가져와라."
  });
}

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
2. 한줄정리에는 이 종목은 배당형, 수익형, 도박형, 초안정형 등과 같이 종목의 성향을 표시
3. 결론 위에 아래 멘트를 추가하고, 결론의 행은 한줄 내려서 시작.
- 추천 → "형은 살거같다."
- 비추천 → "니는 이런걸 종목이라고 가져왔냐?"
- 중립 → "노잼종목이다. 니 알아서 해라"

4. 반드시 최신 트렌드 기준으로 분석
- 최소 2025년 하반기 ~ 2026년 이후 기준
- 과거 사업 (예: IPTV, 5G 등 구식 설명) 중심 설명 금지
- 현재 시장 키워드 중심:
  (AI, 데이터센터, 전력, 반도체, 전장, ESS, 금리, 정책 등)
5. 말투는 직설적이고 GPT 스타일
6. 근거 없는 내용은 "확실하지 않음" 표시
7. 절대 무조건 오른다 같은 표현 금지

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
- 사용자가 입력한 회사명은 정규화된 회사명 기준으로만 분석한다.
- 최신 뉴스 데이터가 부족하면 억지로 분석하지 말고 분석 불가로 판단한다.
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
function normalizeCompanyName(input) {
  const name = input.trim().replace(/\s/g, "").toLowerCase();

  const companyMap = {
    skt: "SK텔레콤",
    "sk텔레콤": "SK텔레콤",
    "에스케이텔레콤": "SK텔레콤",
    "에스케이텔레콤주식회사": "SK텔레콤",

    "엘지유플러스": "LG유플러스",
    "lg유플러스": "LG유플러스",
    "lgu+": "LG유플러스",
    "lguplus": "LG유플러스",
    "유플러스": "LG유플러스",

    "엘지전자": "LG전자",
    "lg전자": "LG전자",

    "엘지에너지솔루션": "LG에너지솔루션",
    "lg에너지솔루션": "LG에너지솔루션",
    "엘지엔솔": "LG에너지솔루션",
    "lg엔솔": "LG에너지솔루션",

    "하이닉스": "SK하이닉스",
    "sk하이닉스": "SK하이닉스",
    "에스케이하이닉스": "SK하이닉스",

    "삼전": "삼성전자",
    "삼성전자": "삼성전자",

    "현차": "현대자동차",
    "현대차": "현대자동차",
    "현대자동차": "현대자동차",

    "기아차": "기아",
    "기아자동차": "기아",
    "기아": "기아"
  };

  return companyMap[name] || input.trim();
}
