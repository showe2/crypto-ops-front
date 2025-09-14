import React from "react";
import { toCSV, parseCSV } from "@lib/csv";
import { Card, Badge } from "@components/UI";

export default function DevTests() {
  const [res, setRes] = React.useState<any[]>([]);

  React.useEffect(() => {
    const T: any[] = [];
    const A = (n: string, c: any, d: any = "") => T.push({ n, ok: !!c, d });

    // existing test cases (preserved)
    A("toCSV(empty)", toCSV([]) === "");

    const obj = { a: "one", b: "two" };
    const c1 = toCSV([obj]);
    const b1 = parseCSV(c1);
    A(
      "roundtrip",
      b1.length === 1 && b1[0].a === "one" && b1[0].b === "two",
      c1
    );

    const tricky = [{ a: "va,lue", b: 'quo"te', c: "multi\nline" }];
    const c2 = toCSV(tricky);
    const b2 = parseCSV(c2);
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

    const c5raw = [{ t: "line1\r\nline2", u: "plain" }];
    const c5 = toCSV(c5raw);
    const b5 = parseCSV(c5);
    A(
      "CRLF normalized to space",
      b5[0].t === "line1 line2" && b5[0].u === "plain"
    );

    const c6 = "x\r\n";
    const b6 = parseCSV(c6);
    A("CRLF headers-only", b6.length === 0);

    // additional test cases from updated version
    const c7rows = [{ x: '"quoted"', y: "😺" }];
    const c7 = toCSV(c7rows);
    const b7 = parseCSV(c7);
    A("unicode + quotes", b7[0].x === '"quoted"' && b7[0].y === "😺", c7);

    const c8rows = [{ a: ",,comma,,", b: "plain" }];
    const c8 = toCSV(c8rows);
    const b8 = parseCSV(c8);
    A("commas only", b8[0].a === ",,comma,," && b8[0].b === "plain", c8);

    const c9 = 'a,b\n"he""llo"\n,ok\n';
    const b9 = parseCSV(c9);
    A(
      "escaped quotes in field",
      b9.length === 2 && b9[0].a === 'he"llo' && b9[1].b === "ok",
      c9
    );

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
            <Badge color={t.ok ? "green" : "red"}>
              {t.ok ? "PASS" : "FAIL"}
            </Badge>
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
