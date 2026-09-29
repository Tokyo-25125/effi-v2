import fs from "node:fs";
import path from "node:path";

const logDir = path.resolve("apps/bot-gateway/.eve/logs");

function findLatestLog() {
  if (!fs.existsSync(logDir)) return null;
  const files = fs.readdirSync(logDir)
    .filter((f) => f.endsWith(".log"))
    .map((f) => ({
      path: path.join(logDir, f),
      time: fs.statSync(path.join(logDir, f)).mtimeMs,
    }))
    .sort((a, b) => b.time - a.time);
  return files[0]?.path ?? null;
}

function extractLatestQr(logPath) {
  if (!logPath || !fs.existsSync(logPath)) return null;
  const content = fs.readFileSync(logPath, "utf8");
  const lines = content.split("\n").filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const data = JSON.parse(lines[i]);
      if (data.detail && data.detail.includes("Scan this QR in WhatsApp")) {
        return data.detail;
      }
    } catch {}
  }
  return null;
}

let lastQr = null;

function check() {
  const logFile = findLatestLog();
  const qr = extractLatestQr(logFile);
  if (qr && qr !== lastQr) {
    lastQr = qr;
    console.log(qr);
    console.log("\nScan with WhatsApp > Linked Devices. Listening for refreshes...");
  } else if (!qr && !lastQr) {
    console.log("Waiting for WhatsApp QR code in Eve logs...");
  }
}

check();
setInterval(check, 2500);
