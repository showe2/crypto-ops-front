export const API =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  "";

export async function api(m: string, p: string, b?: any) {
  const headers: any = { "Content-Type": "application/json" };

  // Add ngrok bypass header if using ngrok
  if (API.includes("ngrok")) {
    headers["ngrok-skip-browser-warning"] = "true";
  }

  const res = await fetch(`${API}${p}`, {
    method: m,
    headers,
    body: b ? JSON.stringify(b) : undefined,
  });

  if (!res.ok) throw new Error(String(res.status));
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export function download(
  name: string,
  content: string,
  mime = "text/plain;charset=utf-8"
) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
