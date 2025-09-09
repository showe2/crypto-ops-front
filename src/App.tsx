import React from "react";
import { cn } from "@lib/fmt";
import StartPanel from "@panels/StartPanel";
import TwitterPanel from "@panels/TwitterPanel";
import PumpPanel from "@panels/PumpPanel";
import PoiskPanel from "@panels/PoiskPanel";
import WhalesPanel from "@panels/WhalesPanel";
import ListingsPanel from "@panels/ListingsPanel";
import BotPanel from "@panels/BotPanel";
import DevTests from "@dev/DevTests";

const TABS = [
  { key: "start", label: "Start" },
  { key: "twitter", label: "Twitter/TG" },
  { key: "pump", label: "Pump" },
  { key: "poisk", label: "Поиск" },
  { key: "whales", label: "Киты/Dev" },
  { key: "listings", label: "Листинги" },
  { key: "bot", label: "Bot" },
];

export default function App() {
  const [tab, setTab] = React.useState("start");
  const showDev =
    (import.meta && import.meta.env && import.meta.env.DEV) ||
    new URLSearchParams(location.search).has("dev");
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 p-5 md:p-8">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Crypto Ops Console
          </h1>
          <div className="flex gap-2 flex-wrap">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "px-3 py-2 rounded-xl text-sm border",
                  tab === t.key
                    ? "bg-indigo-600 border-indigo-500"
                    : "bg-slate-800/70 border-slate-700 hover:bg-slate-700/70"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-slate-400 text-sm mt-2">
          X/TG → Helius → безопасность → Pump-фильтры (киты+соцсети) → Bot.
          Пресеты подключены.
        </p>
      </header>
      <div className="grid gap-6">
        {tab === "start" && <StartPanel />}
        {tab === "twitter" && <TwitterPanel />}
        {tab === "pump" && <PumpPanel />}
        {tab === "poisk" && <PoiskPanel />}
        {tab === "whales" && <WhalesPanel />}
        {tab === "listings" && <ListingsPanel />}
        {tab === "bot" && <BotPanel />}
        {showDev ? <DevTests /> : null}
      </div>
    </div>
  );
}
