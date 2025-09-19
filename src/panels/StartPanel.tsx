import React, { useState } from "react";
import { api } from "@lib/api";
import { Badge, Button, Card, Input } from "@components/UI";
import { cn } from "@lib/fmt";
export default function StartPanel() {
  const [apis, setApis] = useState([
    { key: "HELIUS_API_KEY", label: "Helius", ok: false, keyValue: "" },
    { key: "BIRDEYE_API_KEY", label: "Birdeye", ok: false, keyValue: "" },
    { key: "INTERNAL_TOKEN", label: "Ingest Token", ok: false, keyValue: "" },
    {
      key: "GOPLUS_APP_KEY",
      label: "GoPlus (KEY)",
      ok: false,
      keyValue: "",
    },
    {
      key: "GOPLUS_APP_SECRET",
      label: "GoPlus (SEC)",
      ok: false,
      keyValue: "",
    },
    { key: "SOLSNIFFER_API_KEY", label: "SolSniffer", ok: false, keyValue: "" },
    { key: "SOLANAFM_API_KEY", label: "SolanaFM", ok: false, keyValue: "" },
    { key: "WALLET_SECRET_KEY", label: "SOL Wallet", ok: false, keyValue: "" },
    { key: "GROQ_API_KEY", label: "Groq LLM", ok: false, keyValue: "" },
  ]);
  const [sel, setSel] = useState<string | null>(null);
  const [key, setKey] = useState("");
  const [msg, setMsg] = useState("Нажмите 'Чек' для статуса.");
  const allOk = apis.every((a) => a.ok);
  const apply = async () => {
    if (!sel) return;
    const next = apis.map((a) =>
      a.key === sel ? { ...a, ok: Boolean(key), keyValue: key } : a
    );
    setApis(next);
    setKey("");
    try {
      await api("POST", "/api/keys", {
        key: sel,
        value: (next.find((x) => x.key === sel) || ({} as any)).keyValue,
      });
    } catch {}
  };
  const health = async () => {
    try {
      const r = await api("GET", "/api/health");
      setMsg(typeof r === "string" ? r : "Все хорошо: сервисы активны.");
    } catch {
      setMsg("Проблема: не отвечает один из сервисов");
    }
  };
  return (
    <div className="grid xl:grid-cols-3 gap-6">
      <Card
        title="API Connectors"
        right={
          <Badge color={allOk ? "green" : "yellow"}>
            {allOk ? "Все подключено" : "Нужно настроить"}
          </Badge>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {apis.map((a) => (
            <div
              key={a.key}
              onClick={() => setSel(a.key)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-2xl border p-3 cursor-pointer",
                "border-slate-800 bg-slate-900/60 hover:bg-slate-800/60",
                sel === a.key && "ring-2 ring-indigo-500"
              )}
            >
              <div className="text-slate-200 font-medium">{a.label}</div>
              {a.ok ? (
                <Badge color="green">OK</Badge>
              ) : (
                <Badge color="red">OFF</Badge>
              )}
            </div>
          ))}
        </div>
      </Card>
      <Card title="Ключ">
        <div className="grid gap-3">
          <Input value={sel ?? "—"} readOnly />
          <Input
            placeholder="sk-... / gsk-..."
            value={key}
            onChange={(e) => setKey((e.target as HTMLInputElement).value)}
          />
          <div className="flex gap-2">
            <Button onClick={apply} disabled={!sel || !key}>
              Активировать
            </Button>
            <Button variant="ghost" onClick={() => setKey("")}>
              Очистить
            </Button>
          </div>
          <div className="text-xs text-slate-400">
            Секреты в backend; в демо — в состоянии клиента.
          </div>
        </div>
      </Card>
      <Card title="Статус">
        <div className="grid gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-100">
            {msg}
          </div>
          <Button variant="success" onClick={health}>
            Чек
          </Button>
        </div>
      </Card>
    </div>
  );
}
