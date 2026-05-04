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

    const prompt = `
너는 국내 주식 투자 분석가다.
회사명: ${companyName}

반드시 JSON으로만 답변해라.
형식:
{
  "conclusion": "",
  "oneLine": "",
  "businessNature": [],
  "investmentPoints": [],
  "risks": [],
  "investmentView": [],
  "finalInterpretation": ""
}

규칙:
- 결론과 한 줄 정리를 가장 강하게 작성
- 근거 없는 내용은 "확실하지 않음" 표시
- 매수/매도 확정 표현 금지
- GPT 스타일로 직설적이고 간결하게 작성
- 투자 참고용 분석으로만 작성
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
