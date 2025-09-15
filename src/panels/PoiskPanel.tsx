import React, { useState } from "react";
import { api, download, API } from "@lib/api";
import { openChart } from "@lib/charts";
import { Badge, Button, Card, CopyBtn, Input } from "@components/UI";

export default function PoiskPanel() {
  const [q, setQ] = useState("");
  const [r, setR] = useState<any | null>(null);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [chat, setChat] = useState<any[]>([]);
  const [ask, setAsk] = useState("");
  const [uploads, setUploads] = useState<any>({
    books: [],
    texts: [],
    images: [],
    rules: false,
    filters: false,
  });

  const run = async () => {
    try {
      console.log("🔍 Searching for token:", q);
      console.log(
        "🔍 Making request to:",
        `/api/token/report?query=${encodeURIComponent(q)}`
      );
      const x = await api(
        "GET",
        `/api/token/report?query=${encodeURIComponent(q)}`
      );
      console.log("📊 RAW RESPONSE from /api/token/report:");
      console.log(x);
      console.log("📊 Response type:", typeof x);
      console.log("📊 Is array?", Array.isArray(x));
      console.log("📊 Response keys:", x ? Object.keys(x) : "null/undefined");
      if (x && typeof x === "object") {
        console.log("📊 DETAILED FIELD ANALYSIS:");
        Object.entries(x).forEach(([key, value]) => {
          console.log(`  - ${key}:`, value, `(type: ${typeof value})`);
        });
        console.log("📊 run_id found:", x.run_id);
        setCurrentRunId(x.run_id || null);
      }
      console.log("📊 JSON.stringify:", JSON.stringify(x, null, 2));
      setR(x);
    } catch (err) {
      console.error("❌ Error calling /api/token/report:", err);
      console.error("❌ Full error object:", err);
      setCurrentRunId(null);
      setR({
        name: "DEMO-COIN",
        contract: "DeMo...",
        liq: 42000,
        mcap: 180000,
        risk: "LOW",
        links: {},
        social: { x: "+230%", tg: "30/ч" },
        security: { goplus: "OK", rug: "OK", sniffer: "OK" },
        lastPump: "2025-09-04 18:45",
        nextWindow: "20–40м",
        verdict: "BUY / WATCH",
        mint: "MintZ999",
      });
    }
  };

  const askAI = async () => {
    const msg = { role: "user", content: ask, ts: Date.now() };
    setChat((c) => [...c, msg]);
    setAsk("");
    try {
      console.log("🤖 Asking AI:", ask);
      console.log("🤖 Using run_id:", currentRunId);
      const requestBody = {
        q: msg.content,
        context: "memory",
        run_id: currentRunId,
      };
      console.log("🤖 Request body:", JSON.stringify(requestBody, null, 2));
      const a = await api("POST", "/api/ask", requestBody);
      console.log("🤖 AI Response:", a);
      setChat((c) => [
        ...c,
        {
          role: "assistant",
          content: String(
            a?.answer || "(demo) ИИ: учту память, ответ сформирован."
          ),
        },
      ]);
    } catch (err) {
      console.error("❌ Error calling /api/ask:", err);
      setChat((c) => [
        ...c,
        { role: "assistant", content: "(demo) ИИ недоступна, ответ оффлайн." },
      ]);
    }
  };

  const readFile = (file: any) =>
    new Promise((res) => {
      const R = new FileReader();
      R.onload = () => res(String(R.result || ""));
      R.readAsText(file);
    });

  const handleUpload = async (e: any, type: string) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      if (type === "images") {
        await api("POST", "/api/ingest/images", {
          files: files.map((f: any) => ({ name: f.name, size: f.size })),
        });
        setUploads((u: any) => ({
          ...u,
          images: [...u.images, ...files.map((f: any) => f.name)],
        }));
      } else if (type === "books") {
        const texts = await Promise.all(files.map(readFile));
        await api("POST", "/api/ingest/books", { texts });
        setUploads((u: any) => ({
          ...u,
          books: [...u.books, ...files.map((f: any) => f.name)],
        }));
      } else if (type === "texts") {
        const texts = await Promise.all(files.map(readFile));
        const parsed = texts.map((t) => {
          try {
            return JSON.parse(t as string);
          } catch {
            return { raw: t };
          }
        });
        await api("POST", "/api/ingest/texts", { items: parsed });
        setUploads((u: any) => ({
          ...u,
          texts: [...u.texts, ...files.map((f: any) => f.name)],
        }));
      }
    } catch {
      alert("Ошибка загрузки");
    }
  };

  const applyRules = async (type: string) => {
    try {
      await api(
        "POST",
        type === "rules" ? "/api/ingest/rules" : "/api/ingest/filters",
        { enable: true }
      );
      setUploads((u: any) => ({ ...u, [type]: true }));
    } catch {
      alert("Не удалось применить");
    }
  };

  const generateDOCX = async () => {
    try {
      if (!currentRunId) {
        alert("Сначала выполните поиск для получения run_id");
        return;
      }
      console.log("📄 Generating DOCX with run_id:", currentRunId);
      const response = await fetch(
        `${API}/api/docx/${currentRunId}?type=discovery`,
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
      a.download = `discovery_report_${currentRunId}.docx`;
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
      <Card title="Поиск токена">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Название или контракт"
            value={q}
            onChange={(e) => setQ((e.target as HTMLInputElement).value)}
          />
          <Button onClick={run}>Проверить</Button>
        </div>
      </Card>
      {r && (
        <Card title={`Отчёт по ${r.name || "Token"}`}>
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl border border-slate-800 p-3 flex items-center gap-2">
              <div>
                <div className="text-slate-400">Контракт</div>
                <div className="text-slate-100">{r.contract}</div>
              </div>
              <CopyBtn text={r.contract} />
            </div>
            <div className="rounded-2xl border border-slate-800 p-3">
              <div className="text-slate-400">Ликвидность</div>
              <div className="text-slate-100">{r.liq}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 p-3">
              <div className="text-slate-400">MCAP</div>
              <div className="text-slate-100">{r.mcap}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 p-3">
              <div className="text-slate-400">Риск</div>
              <div className="text-slate-100">{r.risk}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 p-3">
              <div className="text-slate-400">Безопасность</div>
              <div className="text-slate-100">
                GoPlus: {r.security?.goplus} • RugCheck: {r.security?.rug} •
                SolSniffer: {r.security?.sniffer}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 p-3">
              <div className="text-slate-400">Соцсети</div>
              <div className="text-slate-100">
                X: {r.social?.x} • TG: {r.social?.tg}
              </div>
            </div>
          </div>
          <div className="mt-2 text-slate-100 font-semibold">
            Вердикт ИИ: {r.verdict}
          </div>
          <div className="mt-2 flex gap-2">
            <Button
              onClick={() => {
                const birdeyeUrl = `https://birdeye.so/token/${r.mint}?chain=solana`;
                window.open(birdeyeUrl, "_blank");
              }}
            >
              График
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                api("POST", "/api/bot/buy", {
                  mint: r.mint,
                  amount: 0.5,
                }).catch(() => {})
              }
            >
              Купить
            </Button>
            <Button variant="ghost" onClick={generateDOCX}>
              DOCX
            </Button>
          </div>
        </Card>
      )}
      <Card title="Чат с ИИ (память)">
        <div className="grid gap-2">
          <div className="max-h-52 overflow-auto rounded-xl border border-slate-800 bg-slate-900/50 p-2 text-sm">
            {chat.map((m, i) => (
              <div key={i} className="my-1">
                <Badge color={m.role === "user" ? "yellow" : "green"}>
                  {m.role}
                </Badge>
                <span className="text-slate-200">{m.content}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Спросить у ИИ..."
              value={ask}
              onChange={(e) => setAsk((e.target as HTMLInputElement).value)}
            />
            <Button onClick={askAI}>Спросить</Button>
          </div>
        </div>
      </Card>

      <Card title="Загрузка знаний для ИИ">
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-slate-800 p-3">
            <div className="text-slate-400 mb-1">Книги (txt/pdf → текст)</div>
            <input
              type="file"
              multiple
              onChange={(e) => handleUpload(e, "books")}
              className="block w-full text-slate-200"
            />
            <div className="mt-1 text-xs text-slate-400">
              {uploads.books.length
                ? `Загружено: ${uploads.books.length}`
                : "---"}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 p-3">
            <div className="text-slate-400 mb-1">Тексты (JSON)</div>
            <input
              type="file"
              multiple
              onChange={(e) => handleUpload(e, "texts")}
              className="block w-full text-slate-200"
            />
            <div className="mt-1 text-xs text-slate-400">
              {uploads.texts.length
                ? `Загружено: ${uploads.texts.length}`
                : "---"}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 p-3">
            <div className="text-slate-400 mb-1">Фото</div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleUpload(e, "images")}
              className="block w-full text-slate-200"
            />
            <div className="mt-1 text-xs text-slate-400">
              {uploads.images.length
                ? `Загружено: ${uploads.images.length}`
                : "---"}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 p-3 grid gap-2">
            <div className="flex items-center justify-between">
              <div className="text-slate-400">Глобальные правила</div>
              <Button variant="success" onClick={() => applyRules("rules")}>
                {uploads.rules ? "Включены" : "Включить"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-slate-400">Тонкие фильтры</div>
              <Button variant="success" onClick={() => applyRules("filters")}>
                {uploads.filters ? "Включены" : "Включить"}
              </Button>
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-500 mt-2">
          ИИ будет использовать загруженные материалы при ответах в чате и
          анализе токенов.
        </div>
      </Card>
    </div>
  );
}
