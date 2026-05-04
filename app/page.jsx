"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, AlertTriangle, Loader2, TrendingUp, Sparkles } from "lucide-react";

export default function Page() {
  const [companyName, setCompanyName] = useState("");
  const [result, setResult] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => companyName.trim().length > 0 && !loading, [companyName, loading]);

  async function analyzeStock(name = companyName) {
    const target = name.trim();
    if (!target) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/analyze-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: target }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "분석 요청에 실패했습니다.");

      setResult(data);
      setRecentSearches((prev) => [target, ...prev.filter((item) => item !== target)].slice(0, 5));
    } catch (err) {
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    analyzeStock();
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f1e8] text-[#1f1a17]">
      <div className="absolute left-[-80px] top-[-80px] h-56 w-56 rounded-full bg-[#ffcf24] blur-2xl md:h-80 md:w-80" />
      <div className="absolute right-[-120px] top-40 h-72 w-72 rounded-full bg-[#2ac1bc] opacity-40 blur-3xl" />
      <div className="absolute bottom-[-100px] left-1/2 h-72 w-72 rounded-full bg-[#ff6b35] opacity-30 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6 md:py-10">
        <header className="mb-7 rounded-[2rem] border-4 border-[#1f1a17] bg-[#ffcf24] p-5 shadow-[8px_8px_0_#1f1a17] sm:p-8 md:mb-9 md:p-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-[#1f1a17] bg-white px-4 py-2 text-xs font-black shadow-[3px_3px_0_#1f1a17] sm:text-sm">
            <TrendingUp size={16} /> 부자는 못돼도 똔똔은 칩시다
          </div>
          <h1 className="max-w-3xl break-keep text-4xl font-black leading-[1.05] tracking-[-0.04em] sm:text-5xl md:text-7xl">
            회사명만 입력해라. 형이 딱 평가해준다.
          </h1>
          <p className="mt-4 text-xl font-black sm:text-2xl md:text-3xl">뭘 알고 투자해라</p>
        </header>

        <section className="rounded-[1.75rem] border-4 border-[#1f1a17] bg-white p-3 shadow-[8px_8px_0_#1f1a17] md:p-4">
          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1f1a17]" size={22} />
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="예: SK하이닉스, LG전자, 맥쿼리인프라"
                className="min-h-[58px] w-full rounded-2xl border-3 border-[#1f1a17] bg-[#fffaf0] py-4 pl-12 pr-4 text-base font-bold outline-none placeholder:text-[#8a8178] focus:bg-white focus:ring-4 focus:ring-[#2ac1bc] sm:text-lg"
              />
            </div>
            <button
              disabled={!canSubmit}
              className="min-h-[58px] rounded-2xl border-3 border-[#1f1a17] bg-[#2ac1bc] px-7 py-4 text-lg font-black text-[#1f1a17] shadow-[4px_4px_0_#1f1a17] transition active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 className="mr-2 inline animate-spin" size={20} /> : <Sparkles className="mr-2 inline" size={20} />}
              분석하기
            </button>
          </form>
        </section>

        {recentSearches.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {recentSearches.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setCompanyName(item);
                  analyzeStock(item);
                }}
                className="rounded-full border-2 border-[#1f1a17] bg-white px-4 py-2 text-sm font-black shadow-[3px_3px_0_#1f1a17] transition active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                {item}
              </button>
            ))}
          </div>
        )}

        <div className="mt-7 md:mt-9">
          {error && <Notice message={error} />}
          {loading && <LoadingBox />}
          {result && !loading && <Result result={result} />}
        </div>
      </div>
    </main>
  );
}

function Notice({ message }) {
  return (
    <div className="flex items-start gap-3 rounded-[1.5rem] border-4 border-[#1f1a17] bg-[#ff6b35] p-5 font-bold shadow-[6px_6px_0_#1f1a17]">
      <AlertTriangle className="mt-0.5 shrink-0" size={24} />
      <div>
        <p className="text-lg font-black">오류</p>
        <p className="mt-1 break-words">{message}</p>
      </div>
    </div>
  );
}

function LoadingBox() {
  return (
    <div className="rounded-[1.75rem] border-4 border-[#1f1a17] bg-white p-8 text-center shadow-[8px_8px_0_#1f1a17]">
      <Loader2 className="mx-auto mb-4 animate-spin" size={40} />
      <p className="text-xl font-black">분석 중입니다.</p>
      <p className="mt-2 font-bold text-[#6b625a]">형이 숫자랑 리스크를 같이 보고 있습니다.</p>
    </div>
  );
}

function Result({ result }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <section className="rounded-[2rem] border-4 border-[#1f1a17] bg-[#2ac1bc] p-5 shadow-[8px_8px_0_#1f1a17] sm:p-7">
        <p className="mb-2 inline-block rounded-full border-2 border-[#1f1a17] bg-white px-3 py-1 text-sm font-black">결론</p>
        <h2 className="break-keep text-2xl font-black leading-snug tracking-[-0.03em] sm:text-3xl md:text-4xl">{result.conclusion}</h2>
        <div className="mt-5 rounded-[1.5rem] border-3 border-[#1f1a17] bg-white p-5">
          <p className="mb-1 text-sm font-black text-[#6b625a]">한 줄 정리</p>
          <p className="break-keep text-xl font-black sm:text-2xl">{result.oneLine}</p>
        </div>
      </section>

      <ResultCard title="1. 본질" content={result.businessNature} />
      <ResultCard title="2. 지금 투자 포인트" content={result.investmentPoints} />
      <ResultCard title="3. 리스크" content={result.risks} warning />
      <ResultCard title="4. 투자 관점" content={result.investmentView} />
      <ResultCard title="5. 최종 해석" content={result.finalInterpretation} />

      <p className="px-2 pb-8 text-xs font-bold leading-relaxed text-[#6b625a]">
        본 서비스는 투자 참고용 정보이며, 매수·매도 추천이 아닙니다. 실제 투자 판단은 공시, 실적, 밸류에이션, 수급, 본인의 투자성향을 함께 검토해야 합니다.
      </p>
    </motion.div>
  );
}

function ResultCard({ title, content, warning = false }) {
  const lines = Array.isArray(content) ? content : [content];

  return (
    <section className={`rounded-[1.75rem] border-4 border-[#1f1a17] p-5 shadow-[6px_6px_0_#1f1a17] sm:p-6 ${warning ? "bg-[#ff8a3d]" : "bg-white"}`}>
      <h3 className="mb-4 text-xl font-black tracking-[-0.02em]">{title}</h3>
      <div className="space-y-2 text-base font-bold leading-relaxed text-[#2f2924]">
        {lines.map((line, index) => (
          <p key={index} className="break-keep">
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}
