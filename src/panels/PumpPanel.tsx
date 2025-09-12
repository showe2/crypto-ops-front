import React, { useState } from "react";
import { api, download, API } from "@lib/api";
import { Card, NumberInput, Button, CopyBtn } from "@components/UI";
import presets from "@presets/filters.pump.json";

type Vals = {
  t0: number;
  t1: number;
  v0: number;
  v1: number;
  m0: number;
  m1: number;
  l0: number;
  l1: number;
  adsDEX: boolean;
  globalFee: number;
  wh1h: number;
  soc: number;
};

export default function PumpPanel() {
  const [presetKey, setPresetKey] = useState(
    presets.presets?.[1]?.key || "balanced"
  );
  const pv = ((presets.presets || []).find((x: any) => x.key === presetKey)
    ?.values as Vals) || {
    t0: 0,
    t1: 60,
    v0: 0,
    v1: 999999,
    m0: 0,
    m1: 999999,
    l0: 0,
    l1: 999999,
    adsDEX: false,
    globalFee: 0,
    wh1h: 0,
    soc: 0,
  };
  const [t0, setT0] = useState<number>(pv.t0);
  const [t1, setT1] = useState<number>(pv.t1);
  const [v0, setV0] = useState<number>(pv.v0);
  const [v1, setV1] = useState<number>(pv.v1);
  const [m0, setM0] = useState<number>(pv.m0);
  const [m1, setM1] = useState<number>(pv.m1);
  const [l0, setL0] = useState<number>(pv.l0);
  const [l1, setL1] = useState<number>(pv.l1);
  const [flags, setFlags] = useState({ adsDEX: pv.adsDEX });
  const [globalFee, setGlobalFee] = useState<number>(pv.globalFee);
  const [wh1h, setWh1h] = useState<number>(pv.wh1h);
  const [soc, setSoc] = useState<number>(pv.soc);
  const [rows, setRows] = useState<any[]>([]);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);

  const applyPreset = (k: string) => {
    const v = (presets.presets || []).find((x: any) => x.key === k)
      ?.values as Vals;
    if (!v) return;
    setPresetKey(k);
    setT0(v.t0);
    setT1(v.t1);
    setV0(v.v0);
    setV1(v.v1);
    setM0(v.m0);
    setM1(v.m1);
    setL0(v.l0);
    setL1(v.l1);
    setFlags({ adsDEX: v.adsDEX });
    setGlobalFee(v.globalFee);
    setWh1h(v.wh1h);
    setSoc(v.soc);
  };

  const search = async () => {
    try {
      const q = {
        timeMin: t0,
        timeMax: t1,
        volMin: v0,
        volMax: v1,
        mcapMin: m0,
        mcapMax: m1,
        liqMin: l0,
        liqMax: l1,
        adsDEX: flags.adsDEX,
        globalFee,
        whales1hMin: wh1h,
        socialMin: soc,
      };
      console.log("🔍 Sending filters request:", JSON.stringify(q, null, 2));
      const out = await api("POST", "/api/filters", q);
      console.log("📊 RAW RESPONSE from /api/filters:", out);
      console.log("📊 Response type:", typeof out);
      if (out && typeof out === "object") {
        console.log("📊 Response keys:", Object.keys(out));
        console.log("📊 candidates:", out.candidates);
        console.log("📊 total_found:", out.total_found);
        console.log("📊 error:", out.error);
        console.log("📊 run_id:", out.run_id);
        setCurrentRunId(out.run_id || null);
        if (out.candidates && Array.isArray(out.candidates)) {
          console.log("📊 Found", out.candidates.length, "pump candidates");
          setRows(out.candidates);
        } else {
          console.log("📊 No candidates found or invalid format");
          setRows([]);
        }
      } else {
        console.log("📊 Invalid response format");
        setRows([]);
      }
    } catch (err) {
      console.error("❌ Error calling /api/filters:", err);
      setCurrentRunId(null);
      setRows([
        {
          rank: 1,
          name: "FROG KING",
          mint: "Fr0g...",
          liq: 8200,
          vol5: 12600,
          vol60: 92000,
          mcap: 52000,
          whales1h: 3500,
          social: 82,
          ai: "Окно пампа 15–35м; вошло 3 кита ~1200 SOL; следим за маркетингом.",
          links: {},
        },
        {
          rank: 2,
          name: "DOGE2025",
          mint: "D0ge...",
          liq: 6500,
          vol5: 9800,
          vol60: 61000,
          mcap: 41000,
          whales1h: 900,
          social: 67,
          ai: "Потенциал слабее: мало китов, но соцсети растут. Вход при откате.",
          links: {},
        },
      ]);
    }
  };

  const exp = async () => {
    try {
      if (!currentRunId) {
        alert("Сначала выполните поиск для получения run_id");
        return;
      }
      console.log("📄 Generating DOCX with run_id:", currentRunId);

      const response = await fetch(
        `${API}/api/docx/${currentRunId}?type=pump`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(API.includes("ngrok")
              ? { "ngrok-skip-browser-warning": "true" }
              : {}),
          },
          body: JSON.stringify({}),
        }
      );

      console.log("📄 Response status:", response.status);
      console.log(
        "📄 Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "";
      console.log("📄 Content-Type:", contentType);

      if (contentType.includes("application/json")) {
        const jsonData = await response.json();
        console.log("📄 Received JSON instead of DOCX:", jsonData);
        alert("Backend returned JSON instead of DOCX file");
        return;
      }

      const blob = await response.blob();
      console.log("📄 Blob size:", blob.size, "bytes");
      console.log("📄 Blob type:", blob.type);

      if (blob.size === 0) {
        alert("Received empty file from backend");
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pump_analysis_${currentRunId}.docx`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      console.log("📄 Download triggered for file:", a.download);

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("❌ Error generating DOCX:", err);
      alert(`Ошибка генерации DOCX файла`);
    }
  };

  return (
    <div className="grid gap-4">
      <Card
        title="Фильтры (пресеты + киты/соцсети)"
        right={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Пресет</span>
            <select
              value={presetKey}
              onChange={(e) =>
                applyPreset((e.target as HTMLSelectElement).value)
              }
              className="rounded-xl bg-slate-800/80 border border-slate-700 px-2 py-1 text-slate-100"
            >
              {(presets.presets || []).map((p: any) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        }
      >
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-slate-400 mb-1">Время (мин)</div>
            <div className="flex gap-2">
              <NumberInput
                value={t0}
                onChange={(e) => setT0(+(e.target as HTMLInputElement).value)}
              />
              <NumberInput
                value={t1}
                onChange={(e) => setT1(+(e.target as HTMLInputElement).value)}
              />
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Объём (5м)</div>
            <div className="flex gap-2">
              <NumberInput
                value={v0}
                onChange={(e) => setV0(+(e.target as HTMLInputElement).value)}
              />
              <NumberInput
                value={v1}
                onChange={(e) => setV1(+(e.target as HTMLInputElement).value)}
              />
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">MCAP</div>
            <div className="flex gap-2">
              <NumberInput
                value={m0}
                onChange={(e) => setM0(+(e.target as HTMLInputElement).value)}
              />
              <NumberInput
                value={m1}
                onChange={(e) => setM1(+(e.target as HTMLInputElement).value)}
              />
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Ликвидность</div>
            <div className="flex gap-2">
              <NumberInput
                value={l0}
                onChange={(e) => setL0(+(e.target as HTMLInputElement).value)}
              />
              <NumberInput
                value={l1}
                onChange={(e) => setL1(+(e.target as HTMLInputElement).value)}
              />
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Whales 1h ≥ (SOL)</div>
            <NumberInput
              value={wh1h}
              onChange={(e) => setWh1h(+(e.target as HTMLInputElement).value)}
            />
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Social score ≥</div>
            <NumberInput
              value={soc}
              onChange={(e) => setSoc(+(e.target as HTMLInputElement).value)}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button variant="success" onClick={search}>
            Применить
          </Button>
          <Button variant="ghost" onClick={exp}>
            DOCX
          </Button>
        </div>
      </Card>
      <Card title="Выдача">
        <div className="overflow-auto rounded-2xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60 text-slate-300 sticky top-0">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Имя</th>
                <th className="p-3 text-left">Mint</th>
                <th className="p-3 text-left">Liq</th>
                <th className="p-3 text-left">Vol5</th>
                <th className="p-3 text-left">Vol60</th>
                <th className="p-3 text-left">Whales1h</th>
                <th className="p-3 text-left">Social</th>
                <th className="p-3 text-left">MCAP</th>
                <th className="p-3 text-left">Действия (ИИ)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p: any, i: number) => (
                <tr
                  key={(p.mint || p.name) + i}
                  className="border-t border-slate-800 hover:bg-slate-800/30"
                >
                  <td className="p-3 text-slate-300">{p.rank ?? i + 1}</td>
                  <td className="p-3 text-slate-100">{p.name}</td>
                  <td className="p-3 text-slate-300">
                    <span className="font-mono">{p.mint}</span>
                    <span className="ml-2">
                      <CopyBtn text={p.mint} />
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">
                    {typeof p.liq === "object"
                      ? JSON.stringify(p.liq)
                      : p.liq || "-"}
                  </td>
                  <td className="p-3 text-slate-300">
                    {typeof p.vol5 === "object"
                      ? JSON.stringify(p.vol5)
                      : p.vol5 || "-"}
                  </td>
                  <td className="p-3 text-slate-300">
                    {typeof p.vol60 === "object"
                      ? JSON.stringify(p.vol60)
                      : p.vol60 || "-"}
                  </td>
                  <td className="p-3 text-slate-300">
                    {typeof p.whales1h === "object"
                      ? p.whales1h?.count && p.whales1h.count > 0
                        ? `${p.whales1h.count} (${
                            p.whales1h.total_inflow_usd || 0
                          } USD)`
                        : "-"
                      : p.whales1h || "-"}
                  </td>
                  <td className="p-3 text-slate-300">
                    {typeof p.social === "object"
                      ? JSON.stringify(p.social)
                      : p.social || "-"}
                  </td>
                  <td className="p-3 text-slate-300">
                    {typeof p.mcap === "object"
                      ? JSON.stringify(p.mcap)
                      : p.mcap || "-"}
                  </td>
                  <td className="p-3 text-slate-200">
                    <div className="whitespace-pre-wrap">
                      {p.ai || "ИИ формирует сигнал..."}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
