// سيرفر "مهاجم" وهمي على origin تاني، بيحاول يحط الموقع جوه iframe (اختبار Clickjacking).
import { createServer } from "node:http";

const [port, target] = [Number(process.argv[2]), process.argv[3]];
createServer((req, res) => {
  const page = new URL(req.url ?? "/", "http://x").searchParams.get("page") ?? "/";
  const body = `<!doctype html><title>attacker</title><iframe src="${target}${page}" width="800" height="600"></iframe>`;
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(body);
}).listen(port, "127.0.0.1");
