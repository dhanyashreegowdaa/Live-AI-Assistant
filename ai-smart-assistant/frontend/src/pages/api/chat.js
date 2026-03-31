// Next.js API route: proxy chat requests to the FastAPI backend.
// Frontend calls `/api/chat`, which then calls `${BACKEND_URL}/api/v1/api/chat`.

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
    if (!prompt) {
      return res.status(400).json({ message: "Please send a non-empty prompt." });
    }
    const sessionId =
      typeof req.body?.sessionId === "string" ? req.body.sessionId : null;
    const history = Array.isArray(req.body?.history) ? req.body.history : [];
    const metadata =
      req.body?.metadata && typeof req.body.metadata === "object"
        ? req.body.metadata
        : {};

    const configuredBackend =
      process.env.BACKEND_URL?.replace(/\/+$/, "") || null;
    const backendCandidates = configuredBackend
      ? [configuredBackend]
      : ["http://localhost:8000", "http://localhost:8020", "http://localhost:8030"];

    const tryBackend = async (backendUrl) => {
      const url = `${backendUrl}/api/v1/api/chat`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          session_id: sessionId,
          history,
          metadata,
        }),
      });

      let payload;
      try {
        payload = await response.json();
      } catch {
        const text = await response.text().catch(() => "");
        payload = { message: text };
      }

      const msg = String(payload?.response ?? payload?.message ?? "").trim();
      return { ok: response.ok, message: msg, raw: payload };
    };

    let finalAttempt = { ok: false, message: "" };
    for (const candidate of backendCandidates) {
      // eslint-disable-next-line no-await-in-loop
      const attempt = await tryBackend(candidate).catch(() => ({
        ok: false,
        message: "",
      }));
      if (attempt.ok) {
        finalAttempt = attempt;
        break;
      }
      finalAttempt = attempt;
    }

    if (!finalAttempt?.ok) {
      return res.status(500).json({
        message:
          finalAttempt?.message ||
          "Backend chat request failed. Check backend logs.",
      });
    }

    return res.status(200).json({
      message:
        finalAttempt?.message || "No response received from the backend.",
    });
  } catch (err) {
    return res.status(500).json({
      message: err?.message ? String(err.message) : "Unexpected server error.",
    });
  }
}

