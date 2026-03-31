// API Service - handle chat requests from the browser.

/**
 * Send a chat prompt to the Next.js API route.
 * @param {string} prompt
 * @param {{
 *  sessionId?: string,
 *  history?: Array<{role: string, content: string}>,
 *  metadata?: Record<string, unknown>
 * }} [options]
 * @returns {Promise<string>}
 */
export async function sendMessage(prompt, options = {}) {
  const trimmed = String(prompt ?? "").trim();
  if (!trimmed) return "";

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: trimmed,
      sessionId: options?.sessionId || null,
      history: Array.isArray(options?.history) ? options.history : [],
      metadata: options?.metadata || {},
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }

  const data = await res.json();
  return String(data?.message ?? "");
}
