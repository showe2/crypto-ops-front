import React, { useEffect, useRef, useState } from "react";
import { api, download } from "@lib/api";
import { Badge, Button, Card, CopyBtn } from "@components/UI";
import { pretty } from "@lib/fmt";
import { openChart } from "@lib/charts";
import inf from "@presets/influencers.json";
import ver from "@presets/verified.json";

const DEMO = [
  {
    phrase: "DOGE2025 rockets",
    account: "@tierA_trader",
    source: "Twitter",
    url: "https://twitter.com/",
    tier: "A",
  },
  {
    phrase: "PEPE-X meme born",
    account: "pepe_signal",
    source: "Telegram",
    url: "https://t.me/",
    tier: "B",
  },
];

export default function TwitterPanel() {
  const [run, setRun] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [cd, setCd] = useState(0);
  const ref = useRef<any>(null);

  useEffect(() => {
    if (!run) return;
    ref.current = setInterval(() => {
      const s = DEMO[0];
      const e = {
        id: `${Date.now()}`,
        phrase: s.phrase,
        source: "Twitter",
        account: s.account,
        tier: "A",
        date: new Date().toISOString(),
        url: s.url,
        likes5: (10 + Math.random() * 90) | 0,
        likes10: (20 + Math.random() * 120) | 0,
        likes15: (40 + Math.random() * 160) | 0,
        summary: "всплеск",
        hel_state: "waiting",
        mint: null,
        links: {},
        dev: "Dev_Alpha",
        devSol: (Math.random() * 50).toFixed(1),
        mintedAt: new Date().toISOString(),
        safety: { goplus: "OK", rug: "OK", sniffer: "OK" },
        isSpam: false,
        tgPulse: false,
      };
      setRows((p) => [e, ...p].slice(0, 150));
      api("POST", "/api/ingest/social_alert", e).catch(() => {});
    }, 1000);
    return () => clearInterval(ref.current);
  }, [run]);

  useEffect(() => {
    const t = setInterval(() => setCd((s) => (s > 0 ? s - 1 : s)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!run) return;
    const t = setInterval(() => {
      setRows((prev) =>
        prev.map((r) => {
          let n = r;
          if (r.hel_state === "waiting" && Math.random() > 0.6) {
            setCd(90);
            n = {
              ...r,
              hel_state: "mint_found",
              mint: `Mint_${(Math.random() * 1e6) | 0}`,
            };
            api("POST", "/api/merge_insights", { mint: n.mint }).catch(
              () => {}
            );
          }
          if (!r.tgPulse && Math.random() > 0.5) n = { ...n, tgPulse: true };
          return n;
        })
      );
    }, 1500);
    return () => clearInterval(t);
  }, [run]);

  const minted = rows.filter(
    (r) =>
      r.hel_state === "mint_found" &&
      (r.isSpam
        ? true
        : r.safety?.goplus !== "BAD" &&
          r.safety?.rug !== "BAD" &&
          r.safety?.sniffer !== "BAD")
  );
  const exportDOCX = () =>
    minted.length &&
    download(
      `helius_found_${Date.now()}.docx`,
      JSON.stringify(minted, null, 2),
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  const buy = async (r: any) => {
    try {
      openChart({ mint: r.mint, links: r.links });
      await api("POST", "/api/bot/buy", {
        mint: r.mint,
        amountSol: 0.5,
        mode: "auto",
      });
      alert("BUY отправлен");
    } catch {
      alert("Ошибка BUY");
    }
  };

  const tiers = (inf?.influencers || []).reduce((acc: any, x: any) => {
    acc[x.tier] = (acc[x.tier] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Button variant="success" onClick={() => setRun(true)}>
          Парсить
        </Button>
        <Button variant="danger" onClick={() => setRun(false)}>
          Стоп
        </Button>
        <Button variant="ghost" onClick={exportDOCX}>
          Скачать DOCX
        </Button>
        <Badge>{cd > 0 ? `Helius: ${cd}s` : "Helius: ---"}</Badge>
      </div>

      <Card title="Сигналы X/TG">
        <div className="overflow-auto max-h-[40vh] rounded-2xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60 text-slate-300 sticky top-0">
              <tr>
                <th className="p-3 text-left">Мем</th>
                <th className="p-3 text-left">Источник</th>
                <th className="p-3 text-left">Акк</th>
                <th className="p-3 text-left">Tier</th>
                <th className="p-3 text-left">Дата</th>
                <th className="p-3 text-left">Лайки</th>
                <th className="p-3 text-left">TG</th>
                <th className="p-3 text-left">Helius</th>
                <th className="p-3 text-left">Действия</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-slate-800 hover:bg-slate-800/30"
                >
                  <td className="p-3 text-slate-100">{r.phrase}</td>
                  <td className="p-3 text-slate-300">{r.source}</td>
                  <td className="p-3 text-slate-300">{r.account}</td>
                  <td className="p-3">
                    {r.tier === "A" ? (
                      <Badge color="green">A</Badge>
                    ) : r.tier === "B" ? (
                      <Badge color="yellow">B</Badge>
                    ) : (
                      <Badge>C</Badge>
                    )}
                  </td>
                  <td className="p-3 text-slate-400">{pretty(r.date)}</td>
                  <td className="p-3 text-slate-300">
                    {r.likes5}/{r.likes10}/{r.likes15}
                  </td>
                  <td className="p-3">
                    {r.tgPulse ? (
                      <Badge color="green">всплеск</Badge>
                    ) : (
                      <Badge>---</Badge>
                    )}
                  </td>
                  <td className="p-3">
                    {r.hel_state === "waiting" && <Badge>таймер</Badge>}
                    {r.hel_state === "mint_found" && (
                      <div className="flex items-center gap-2">
                        <Badge color="green">mint</Badge>
                        <span className="font-mono text-slate-200">
                          {r.mint}
                        </span>
                        <CopyBtn text={r.mint || ""} title="Копировать" />
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button onClick={() => buy(r)}>Купить</Button>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          api("POST", "/api/bot/cancel", {
                            mint: r.mint,
                          }).catch(() => {})
                        }
                      >
                        Отмена
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Найденные Helius (OG токены)">
        <div className="overflow-x-auto">
          <div className="flex gap-3 min-w-full">
            {minted.map((t, i) => (
              <div
                key={t.mint + i}
                className="min-w-[320px] max-w-[360px] flex-1 rounded-2xl border border-slate-800 bg-slate-900/60 p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-slate-100 truncate">
                    {t.phrase || "Token"}
                  </div>
                  <Badge color={t.isSpam ? "red" : "green"}>
                    {t.isSpam ? "СПАМ" : "OK"}
                  </Badge>
                </div>
                <div className="text-sm grid gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Mint</span>
                    <span className="font-mono text-slate-200 truncate">
                      {t.mint}
                    </span>
                    <CopyBtn text={t.mint} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Dev</span>
                    <span className="text-slate-200 truncate">
                      {t.dev || "---"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Создано</span>
                    <span className="text-slate-200">{pretty(t.mintedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Dev SOL</span>
                    <span className="text-slate-200">{t.devSol}</span>
                  </div>
                  <div className="text-slate-200">
                    Безопасность: GoPlus {t.safety?.goplus || "?"} • RugCheck{" "}
                    {t.safety?.rug || "?"} • Sniffer {t.safety?.sniffer || "?"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
