import type { IncomingMessage, ServerResponse } from "http";
import { generateQuizAI, evaluateSubmissionAI, analyzeStudentSkillsAI } from "./geminiService.ts";

async function readRequestBody(req: IncomingMessage): Promise<any> {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return {};
  }

  if ((req as any).body) {
    return (req as any).body;
  }

  return new Promise((resolve) => {
    let rawData = "";
    req.setEncoding("utf-8");

    const timer = setTimeout(() => {
      cleanup();
      try {
        resolve(rawData ? JSON.parse(rawData) : {});
      } catch {
        resolve({});
      }
    }, 1000);

    function cleanup() {
      clearTimeout(timer);
      req.off("data", onData);
      req.off("end", onEnd);
      req.off("error", onError);
    }

    function onData(chunk: string) {
      rawData += chunk;
      if (rawData.length > 5 * 1024 * 1024) {
        cleanup();
        resolve({});
      }
    }

    function onEnd() {
      cleanup();
      try {
        resolve(rawData ? JSON.parse(rawData) : {});
      } catch {
        resolve({});
      }
    }

    function onError() {
      cleanup();
      resolve({});
    }

    req.on("data", onData);
    req.on("end", onEnd);
    req.on("error", onError);

    if (req.readableEnded || req.complete) {
      cleanup();
      try {
        resolve(rawData ? JSON.parse(rawData) : {});
      } catch {
        resolve({});
      }
    }
  });
}

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url?.split("?")[0] || "";
  if (!url.startsWith("/api/")) return false;

  // Set CORS and JSON headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return true;
  }

  const body = await readRequestBody(req);

  try {
    if (url === "/api/ai/generate-quiz" && req.method === "POST") {
      const result = await generateQuizAI(body);
      res.statusCode = 200;
      res.end(JSON.stringify(result));
      return true;
    }

    if (url === "/api/ai/evaluate-submission" && req.method === "POST") {
      const result = await evaluateSubmissionAI(body);
      res.statusCode = 200;
      res.end(JSON.stringify(result));
      return true;
    }

    if (url === "/api/ai/skill-analysis" && req.method === "POST") {
      const result = await analyzeStudentSkillsAI(body);
      res.statusCode = 200;
      res.end(JSON.stringify(result));
      return true;
    }

    if (url === "/api/health") {
      res.statusCode = 200;
      res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
      return true;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Endpoint not found" }));
    return true;
  } catch (err: any) {
    console.error("API error:", err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message || "Internal server error" }));
    return true;
  }
}
