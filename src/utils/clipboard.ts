export async function copyText(text?: string) {
  const t = text ?? "";
  if (
    typeof navigator !== "undefined" &&
    (navigator as any).clipboard &&
    (window as any).isSecureContext
  ) {
    try {
      await (navigator as any).clipboard.writeText(t);
      return true;
    } catch {}
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = t;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand && document.execCommand("copy");
    document.body.removeChild(ta);
    return !!ok;
  } catch {
    return false;
  }
}
