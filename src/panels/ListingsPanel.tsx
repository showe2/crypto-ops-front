import React from "react";
import { api, download } from "@lib/api";
import { toCSV, parseCSV } from "@lib/csv";
import { pretty } from "@lib/fmt";
import { Button, Card, CopyBtn } from "@components/UI";
import { openChart } from "@lib/charts";
import presetSites from "@presets/listing-sites.json";
export default function ListingsPanel() {
  const [run, setRun] = React.useState(false);
  const [sites, setSites] = React.useState<any[]>(presetSites.sources || []);
  const [rows, setRows] = React.useState<any[]>([]);
  React.useEffect(() => {
    (async () => {
      try {
        const r = await api("GET", "/api/listings");
        if (Array.isArray(r)) setRows(r);
      } catch {
        setRows([]);
      }
    })();
  }, []);
  const exportCSV = () =>
    rows.length &&
    download(
      `listings_${Date.now()}.csv`,
      toCSV(
        rows.map((r) => ({
          name: r.name,
          contract: r.contract,
          dev: r.dev,
          site: r.site,
          when: new Date(r.when).toISOString(),
          aiNote: r.aiNote || "",
        }))
      ),
      "text/csv;charset=utf-8"
    );
  const exportDOCX = async () => {
    try {
      const listingsData = { rows, sites };
      const response = await api(
        "POST",
        "/api/docx/run_id?type=listings",
        listingsData
      );
      console.log("📄 DOCX response from backend:", response);
      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `listings_${Date.now()}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Error generating DOCX:", err);
      alert("Ошибка генерации DOCX файла");
    }
  };
  const onUploadSites = (e: any) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const R = new FileReader();
    R.onload = async () => {
      try {
        const txt = String(R.result || "");
        const data = f.name.endsWith(".csv")
          ? parseCSV(txt).map((x) => (x as any).name || Object.values(x)[0])
          : JSON.parse(txt);
        const arr = Array.isArray(data) ? data : [];
        setSites(arr.filter(Boolean));
        await api("POST", "/api/sites", arr).catch(() => {});
      } catch {
        alert("CSV список или JSON-массив");
      }
    };
    R.readAsText(f);
  };
  const pushPresets = async () => {
    try {
      await api(
        "POST",
        "/api/sites",
        (sites || []).map((s: any) => s.url || s)
      );
      alert("Площадки импортированы");
    } catch {
      alert("Не удалось отправить на backend");
    }
  };
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Button variant="success" onClick={() => setRun(true)}>
          Старт
        </Button>
        <Button variant="danger" onClick={() => setRun(false)}>
          Стоп
        </Button>
        <Button variant="ghost" onClick={exportCSV}>
          CSV
        </Button>
        <Button variant="ghost" onClick={exportDOCX}>
          DOCX
        </Button>
        <label className="inline-flex items-center gap-2 text-slate-200 cursor-pointer">
          <input type="file" className="hidden" onChange={onUploadSites} />
          <span className="rounded-2xl px-3 py-2 bg-slate-800/70 border border-slate-700">
            Добавить площадки
          </span>
        </label>
        <Button variant="ghost" onClick={pushPresets}>
          Импорт пресетов
        </Button>
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-700/60 text-slate-200 ring-1 ring-slate-600/60">
          {run ? "Парсинг" : "Стоп"}
        </span>
      </div>
      <Card title="Грядущие листинги">
        <div className="overflow-auto rounded-2xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60 text-slate-300 sticky top-0">
              <tr>
                <th className="p-3 text-left">Токен</th>
                <th className="p-3 text-left">Контракт</th>
                <th className="p-3 text-left">Dev</th>
                <th className="p-3 text-left">Сайт</th>
                <th className="p-3 text-left">Дата</th>
                <th className="p-3 text-left">Анализ ИИ</th>
                <th className="p-3 text-left">Действия</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={(r.contract || r.name) + i}
                  className="border-t border-slate-800 hover:bg-slate-800/30"
                >
                  <td className="p-3 text-slate-100">{r.name}</td>
                  <td className="p-3 text-slate-300">
                    <span className="font-mono">{r.contract}</span>
                    <span className="ml-2">
                      <CopyBtn text={r.contract} />
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{r.dev}</td>
                  <td className="p-3">
                    <a
                      className="text-indigo-400 hover:underline"
                      href={r.site}
                      target="_blank"
                      rel="noreferrer"
                    >
                      open
                    </a>
                  </td>
                  <td className="p-3 text-slate-300">{pretty(r.when)}</td>
                  <td className="p-3 text-slate-200 max-w-[320px]">
                    <div className="whitespace-pre-wrap">
                      {r.aiNote || "ИИ анализирует команду и девов..."}
                    </div>
                  </td>
                  <td className="p-3">
                    <Button
                      onClick={() => openChart({ mint: r.mint, links: {} })}
                    >
                      Открыть
                    </Button>
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
