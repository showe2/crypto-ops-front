import React from "react";
import { api } from "@lib/api";
import { Button, Card, CopyBtn, Input, NumberInput } from "@components/UI";
import { pretty } from "@lib/fmt";

export default function BotPanel() {
  const [mint, setMint] = React.useState("");
  const presets = [0.1, 0.2, 0.5, 1, 2, 5];
  const [amt, setAmt] = React.useState(1);
  const [slip, setSlip] = React.useState(0.5);
  const [prio, setPrio] = React.useState<"normal" | "high">("normal");
  const [history, setHistory] = React.useState<any[]>([]);
  const [gh, setGh] = React.useState("");

  const buy = async () => {
    try {
      await api("POST", "/api/bot/buy", {
        mint,
        amount: amt,
        slippage: slip,
        priority: prio,
      });
      alert("BUY");
    } catch {
      alert("Ошибка BUY");
    }
  };

  const sell = async () => {
    try {
      await api("POST", "/api/bot/sell", { mint, percent: 100 });
      alert("SELL ALL");
    } catch {
      alert("Ошибка SELL");
    }
  };

  const start = async () => {
    try {
      await api("POST", "/api/bot/start", {
        mint,
        amount: amt,
        slippage: slip,
        priority: prio,
      });
      alert("Бот запущен");
    } catch {
      alert("Ошибка запуска");
    }
  };

  React.useEffect(() => {
    (async () => {
      try {
        const h = await api("GET", "/api/bot/history");
        if (Array.isArray(h)) setHistory(h);
      } catch {
        setHistory([
          {
            name: "DEMO-COIN",
            mint: "MintZ999",
            liq: 12000,
            mcap: 180000,
            vol5: 9000,
            vol60: 48000,
            whales1h: 2200,
            verdict:
              "OK, ретест перед пампом. Держим частично, добавка по пробою.",
            ts: Date.now() - 3600000,
          },
        ]);
      }
    })();
  }, []);

  return (
    <div className="grid gap-4">
      <Card title="Моментальная покупка">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="grid gap-2">
            <div className="text-xs text-slate-400">Mint / контракт</div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Mint..."
                value={mint}
                onChange={(e) => setMint((e.target as HTMLInputElement).value)}
              />
              <CopyBtn text={mint} />
            </div>
          </div>
          <div className="grid gap-2">
            <div className="text-xs text-slate-400">Параметры</div>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <Button key={p} variant="ghost" onClick={() => setAmt(p)}>
                  {p} SOL
                </Button>
              ))}
              <div className="flex items-center gap-2">
                <NumberInput
                  value={amt}
                  onChange={(e) =>
                    setAmt(+(e.target as HTMLInputElement).value)
                  }
                />
                <span className="text-slate-300">SOL</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Slippage</span>
                <NumberInput
                  value={slip}
                  onChange={(e) =>
                    setSlip(+(e.target as HTMLInputElement).value)
                  }
                />
                <span className="text-slate-300">%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Priority</span>
                <select
                  value={prio}
                  onChange={(e) =>
                    setPrio((e.target as HTMLSelectElement).value as any)
                  }
                  className="rounded-xl bg-slate-800/80 border border-slate-700 px-2 py-1 text-slate-100"
                >
                  <option value="normal">normal</option>
                  <option value="high">high (Jito)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button onClick={buy}>Купить</Button>
          <Button variant="danger" onClick={sell}>
            Продать
          </Button>
          <Button variant="ghost" onClick={start}>
            Запустить бота
          </Button>
        </div>
      </Card>

      <Card title="Защита (ИИ вывод)">
        <div className="text-sm text-slate-200">
          ИИ агрегирует GoPlus/RugCheck/Sniffer: при рисках → авто SELL, иначе —
          окно входа и риск-оценка. Учитывает LP lock, mint authority,
          honeypot-паттерны, миграции девов.
        </div>
      </Card>

      <Card title="История сделок бота">
        <div className="overflow-auto rounded-2xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60 text-slate-300 sticky top-0">
              <tr>
                <th className="p-3 text-left">Дата/время</th>
                <th className="p-3 text-left">Токен</th>
                <th className="p-3 text-left">Mint</th>
                <th className="p-3 text-left">Ликвидность</th>
                <th className="p-3 text-left">MCAP</th>
                <th className="p-3 text-left">Vol5</th>
                <th className="p-3 text-left">Vol1h</th>
                <th className="p-3 text-left">Whales1h</th>
                <th className="p-3 text-left">Вывод ИИ</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr
                  key={(h.mint || h.name) + i}
                  className="border-t border-slate-800 hover:bg-slate-800/30"
                >
                  <td className="p-3 text-slate-400">
                    {h.ts ? pretty(h.ts) : "---"}
                  </td>
                  <td className="p-3 text-slate-100">{h.name}</td>
                  <td className="p-3 text-slate-300">
                    <span className="font-mono">{h.mint}</span>
                    <span className="ml-2">
                      <CopyBtn text={h.mint} />
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{h.liq}</td>
                  <td className="p-3 text-slate-300">{h.mcap}</td>
                  <td className="p-3 text-slate-300">{h.vol5}</td>
                  <td className="p-3 text-slate-300">{h.vol60}</td>
                  <td className="p-3 text-slate-300">{h.whales1h}</td>
                  <td className="p-3 text-slate-200 whitespace-pre-wrap">
                    {h.verdict || h.ai || "---"}
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
