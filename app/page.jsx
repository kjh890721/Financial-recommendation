"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, AlertTriangle, Loader2, TrendingUp } from "lucide-react";

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
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm text-slate-300 ring-1 ring-slate-800">
            <TrendingUp size={16} /> GPT 스타일 국내 주식 분석
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">회사명만 입력하면 투자 관점 요약</h1>
          <p className="mt-4 text-slate-400">결론과 한 줄 정리를 먼저 보여주고, 뒤에 사유와 리스크를 정리합니다.</p>
        </header>

        <form onSubmit={handleSubmit} className="mb-5 rounded-2xl bg-slate-900 p-3 shadow-2xl ring-1 ring-slate-800 md:flex md:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="예: SK하이닉스, LG전자, 맥쿼리인프라"
              className="w-full rounded-xl bg-slate-950 py-4 pl-12 pr-4 text-base outline-none ring-1 ring-slate-800 placeholder:text-slate-600 focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <button disabled={!canSubmit} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 font-bold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 md:mt-0 md:w-auto">
            {loading ? <Loader2 className="animate-spin" size={20} /> : null} 분석하기
          </button>
        </form>

        {recentSearches.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {recentSearches.map((item) => (
              <button key={item} onClick={() => { setCompanyName(item); analyzeStock(item); }} className="rounded-full bg-slate-900 px-4 py-2 text-sm text-slate-300 ring-1 ring-slate-800 hover:bg-slate-800">
                {item}
              </button>
            ))}
          </div>
        )}

        {error && <Notice message={error} />}
        {loading && <LoadingBox />}
        {result && !loading && <Result result={result} />}
      </div>
    </main>
  );
}

function Notice({ message }) {
  return <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-950/60 p-5 ring-1 ring-red-900"><AlertTriangle className="mt-0.5 text-red-300" size={22} /><div><p className="font-bold text-red-200">오류</p><p className="mt-1 text-red-100">{message}</p></div></div>;
}

function LoadingBox() {
  return <div className="rounded-2xl bg-slate-900 p-8 text-center ring-1 ring-slate-800"><Loader2 className="mx-auto mb-4 animate-spin text-slate-400" size={36} /><p className="font-semibold">분석 중입니다.</p><p className="mt-2 text-sm text-slate-500">회사 본질, 투자 포인트, 리스크를 정리하고 있습니다.</p></div>;
}

function Result({ result }) {
  return <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
    <section className="rounded-3xl bg-white p-6 text-slate-950 shadow-2xl">
      <p className="mb-2 text-sm font-bold text-slate-500">결론</p>
      <h2 className="text-2xl font-black leading-snug md:text-3xl">{result.conclusion}</h2>
      <div className="mt-5 rounded-2xl bg-slate-100 p-5"><p className="mb-1 text-sm font-bold text-slate-500">한 줄 정리</p><p className="text-xl font-extrabold">{result.oneLine}</p></div>
    </section>
    <ResultCard title="1. 본질" content={result.businessNature} />
    <ResultCard title="2. 지금 투자 포인트" content={result.investmentPoints} />
    <ResultCard title="3. 리스크" content={result.risks} warning />
    <ResultCard title="4. 투자 관점" content={result.investmentView} />
    <ResultCard title="5. 최종 해석" content={result.finalInterpretation} />
    <p className="px-2 text-xs leading-relaxed text-slate-500">본 서비스는 투자 참고용 정보이며, 매수·매도 추천이 아닙니다. 실제 투자 판단은 공시, 실적, 밸류에이션, 수급, 본인의 투자성향을 함께 검토해야 합니다.</p>
  </motion.div>;
}

function ResultCard({ title, content, warning = false }) {
  const lines = Array.isArray(content) ? content : [content];
  return <section className={`rounded-2xl p-6 ring-1 ${warning ? "bg-amber-950/30 ring-amber-800" : "bg-slate-900 ring-slate-800"}`}><h3 className="mb-4 text-lg font-bold">{title}</h3><div className="space-y-2 text-slate-300">{lines.map((line, index) => <p key={index} className="leading-relaxed">{line}</p>)}</div></section>;
}
