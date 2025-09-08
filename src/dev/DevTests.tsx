import React from "react";
import { toCSV, parseCSV } from "@lib/csv";
import { Card } from "@components/UI";
export default function DevTests() {
  const [res, setRes] = React.useState<any[]>([]);
  React.useEffect(() => {
    const T: any[] = [];
    const A = (n: string, c: any, d: any = "") => T.push({ n, ok: !!c, d });
    A("toCSV(empty)", toCSV([]) === "");
    const obj = { a: "one", b: "two" };
    const c1 = toCSV([obj]);
    const b1 = parseCSV(c1);
    A(
      "roundtrip",
      b1.length === 1 && b1[0].a === "one" && b1[0].b === "two",
      c1
    );
    const tricky = [{ a: "va,lue", b: 'quo"te', c: "multi\nline" }],
      c2 = toCSV(tricky),
      b2 = parseCSV(c2);
    A(
      "csv quotes/commas/newlines",
      b2[0].a === "va,lue" && b2[0].b === 'quo"te' && b2[0].c === "multi line",
      c2
    );
    const c3 = "a,b\n1,\n";
    const b3 = parseCSV(c3);
    A(
      "empty cell + trailing newline",
      b3.length === 1 && b3[0].a === "1" && b3[0].b === ""
    );
    const c4 = "x\r\ny\r\n";
    const b4 = parseCSV(c4);
    A("CRLF header + 1 row", b4.length === 1);
    const raw = [{ t: "line1\r\nline2", u: "plain" }],
      c5 = toCSV(raw),
      b5 = parseCSV(c5);
    A(
      "CRLF normalized to space",
      b5[0].t === "line1 line2" && b5[0].u === "plain"
    );
    const c6 = "x\r\n";
    const b6 = parseCSV(c6);
    A("CRLF headers-only", b6.length === 0);
    setRes(T);
  }, []);
  return (
    <Card title="DevTests">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {res.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-2 py-1"
          >
            <span
              className={
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                (t.ok
                  ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
                  : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30")
              }
            >
              {t.ok ? "PASS" : "FAIL"}
            </span>
            <div className="text-slate-200 truncate">{t.n}</div>
            {t.d && (
              <code className="text-slate-400 truncate">{String(t.d)}</code>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
