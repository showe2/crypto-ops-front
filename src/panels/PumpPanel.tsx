import React, { useState } from "react";
import { api, download } from "@lib/api";
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
  const [t0, setT0] = useState<number>(pv.t0),
    [t1, setT1] = useState<number>(pv.t1),
    [v0, setV0] = useState<number>(pv.v0),
    [v1, setV1] = useState<number>(pv.v1),
    [m0, setM0] = useState<number>(pv.m0),
    [m1, setM1] = useState<number>(pv.m1),
    [l0, setL0] = useState<number>(pv.l0),
    [l1, setL1] = useState<number>(pv.l1);
  const [flags, setFlags] = useState({ adsDEX: pv.adsDEX });
  const [globalFee, setGlobalFee] = useState<number>(pv.globalFee);
  const [wh1h, setWh1h] = useState<number>(pv.wh1h);
  const [soc, setSoc] = useState<number>(pv.soc);
  const [rows, setRows] = useState<any[]>([]);
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
      const out = await api("POST", "/api/filters", q);
      setRows(Array.isArray(out) ? out : []);
    } catch {
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
  const exp = () =>
    download(
      `pump_${Date.now()}.docx`,
      JSON.stringify(
        {
          preset: presetKey,
          filters: {
            t0,
            t1,
            v0,
            v1,
            m0,
            m1,
            l0,
            l1,
            flags,
            globalFee,
            wh1h,
            soc,
          },
          rows,
        },
        null,
        2
      ),
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
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
            <label className="inline-flex items-center gap-2 text-slate-200">
              <input
                type="checkbox"
                className="accent-indigo-500"
                checked={flags.adsDEX}
                onChange={(e) =>
                  setFlags({
                    ...flags,
                    adsDEX: (e.target as HTMLInputElement).checked,
                  })
                }
              />
              Реклама DEX
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Global fee</span>
            <NumberInput
              value={globalFee}
              onChange={(e) =>
                setGlobalFee(+(e.target as HTMLInputElement).value)
              }
            />
            <span className="text-slate-300">SOL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Whales 1h ≥</span>
            <NumberInput
              value={wh1h}
              onChange={(e) => setWh1h(+(e.target as HTMLInputElement).value)}
            />
            <span className="text-slate-300">SOL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Social score ≥</span>
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
                  <td className="p-3 text-slate-300">{p.liq}</td>
                  <td className="p-3 text-slate-300">{p.vol5}</td>
                  <td className="p-3 text-slate-300">{p.vol60 || "-"}</td>
                  <td className="p-3 text-slate-300">{p.whales1h || "-"}</td>
                  <td className="p-3 text-slate-300">{p.social || "-"}</td>
                  <td className="p-3 text-slate-300">{p.mcap}</td>
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
