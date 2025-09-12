import React from "react";
import { api, download } from "@lib/api";
import { parseCSV } from "@lib/csv";
import { Badge, Button, Card, CopyBtn } from "@components/UI";
import presetWhales from "@presets/whales.json";
import presetDevs from "@presets/devs.json";
export default function WhalesPanel() {
  const [whales, setWhales] = React.useState<any[]>([]);
  const [devs, setDevs] = React.useState<any[]>([]);
  const fetchAll = async () => {
    try {
      const w = await api("GET", "/api/whales/best");
      if (Array.isArray(w)) setWhales(w);
    } catch {}
    try {
      const d = await api("GET", "/api/devs/best");
      if (Array.isArray(d)) setDevs(d);
    } catch {}
  };
  React.useEffect(() => {
    (async () => {
      try {
        const w = await api("GET", "/api/whales");
        if (Array.isArray(w)) setWhales(w);
        else setWhales(presetWhales.whales || []);
      } catch {
        setWhales(presetWhales.whales || []);
      }
      try {
        const d = await api("GET", "/api/devs");
        if (Array.isArray(d)) setDevs(d);
        else setDevs(presetDevs.devs || []);
      } catch {
        setDevs(presetDevs.devs || []);
      }
    })();
  }, []);
  const exp = async () => {
    try {
      const whalesData = { whales, devs };
      const response = await api(
        "POST",
        "/api/docx/run_id?type=whales",
        whalesData
      );
      console.log("📄 DOCX response from backend:", response);
      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `whales_${Date.now()}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Error generating DOCX:", err);
      alert("Ошибка генерации DOCX файла");
    }
  };
  const imp = (e: any, type: "whales" | "devs") => {
    const f = e.target.files?.[0];
    if (!f) return;
    const R = new FileReader();
    R.onload = async () => {
      try {
        const txt = String(R.result || "");
        const data = f.name.endsWith(".csv") ? parseCSV(txt) : JSON.parse(txt);
        if (type === "whales") {
          setWhales(data);
          await api("POST", "/api/whales", data).catch(() => {});
        }
        if (type === "devs") {
          setDevs(data);
          await api("POST", "/api/devs", data).catch(() => {});
        }
      } catch {
        alert("JSON массив или CSV с колонками");
      }
    };
    R.readAsText(f);
  };
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <Button variant="success" onClick={fetchAll}>
          Поиск
        </Button>
        <Button variant="ghost" onClick={exp}>
          DOCX
        </Button>
        <label className="inline-flex items-center gap-2 text-slate-200 cursor-pointer">
          <input
            type="file"
            className="hidden"
            onChange={(e) => imp(e, "whales")}
          />
          <span className="rounded-2xl px-3 py-2 bg-slate-800/70 border border-slate-700">
            Загрузить китов
          </span>
        </label>
        <label className="inline-flex items-center gap-2 text-slate-200 cursor-pointer">
          <input
            type="file"
            className="hidden"
            onChange={(e) => imp(e, "devs")}
          />
          <span className="rounded-2xl px-3 py-2 bg-slate-800/70 border border-slate-700">
            Загрузить Dev
          </span>
        </label>
      </div>
      <Card title="Киты">
        <div className="overflow-auto rounded-2xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60 text-slate-300 sticky top-0">
              <tr>
                <th className="p-3 text-left">Адрес</th>
                <th className="p-3 text-left">Имя</th>
                <th className="p-3 text-left">Win%</th>
                <th className="p-3 text-left">P/L</th>
                <th className="p-3 text-left">Avg SOL</th>
                <th className="p-3 text-left">Дней</th>
                <th className="p-3 text-left">Монеты</th>
              </tr>
            </thead>
            <tbody>
              {whales.map((w, i) => (
                <tr
                  key={(w.addr || w.address || "w") + i}
                  className="border-t border-slate-800 hover:bg-slate-800/30"
                >
                  <td className="p-3 font-mono text-slate-300">
                    {w.addr || w.address}
                  </td>
                  <td className="p-3 text-slate-100">{w.name || w.alias}</td>
                  <td className="p-3 text-slate-300">
                    {w.win ?? w.winrate ?? "-"}%
                  </td>
                  <td className="p-3 text-slate-300">{w.pel ?? w.pl ?? "-"}</td>
                  <td className="p-3 text-slate-300">
                    {w.avgSize ?? w.avg_sol ?? "-"}
                  </td>
                  <td className="p-3 text-slate-300">
                    {w.holdDays ?? w.hold_days ?? "-"}
                  </td>
                  <td className="p-3 text-slate-200">
                    {Array.isArray(w.coins)
                      ? w.coins.join(", ")
                      : w.tokens || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Devs">
        <div className="overflow-auto rounded-2xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60 text-slate-300 sticky top-0">
              <tr>
                <th className="p-3 text-left">Адрес</th>
                <th className="p-3 text-left">Имя</th>
                <th className="p-3 text-left">Миграции</th>
                <th className="p-3 text-left">Проекты</th>
              </tr>
            </thead>
            <tbody>
              {devs.map((d, i) => (
                <tr
                  key={(d.addr || d.address || "d") + i}
                  className="border-t border-slate-800 hover:bg-slate-800/30"
                >
                  <td className="p-3 font-mono text-slate-300">
                    {d.addr || d.address}
                  </td>
                  <td className="p-3 text-slate-100">{d.name || d.alias}</td>
                  <td className="p-3 text-slate-300">
                    {d.migr ?? d.migrations ?? 0}/
                    {d.goodMigr ?? d.good_migrations ?? 0}
                  </td>
                  <td className="p-3 text-slate-200">
                    {Array.isArray(d.prevTokens)
                      ? d.prevTokens.join(", ")
                      : d.projects || "-"}
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
