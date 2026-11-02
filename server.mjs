import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";

const port = Number(process.env.PORT ?? 3000);
const dataFile = new URL("./data/tasks.json", import.meta.url);
const seed = [
  { id: 1, title: "Write the release notes", done: false },
  { id: 2, title: "Review the onboarding flow", done: true },
  { id: 3, title: "Fix the login redirect", done: false },
];
const account = { email: "demo@example.com", password: "demo-password" };
const sessions = new Set();

const load = () => (existsSync(dataFile) ? JSON.parse(readFileSync(dataFile, "utf8")) : seed);
const save = (tasks) => writeFileSync(dataFile, JSON.stringify(tasks, null, 2));
const escape = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const cookieOf = (req) => /(?:^|; )sid=([a-f0-9]+)/.exec(req.headers.cookie ?? "")?.[1];
const form = (req) =>
  new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(new URLSearchParams(body)));
  });
const page = (title, body) => `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
body { font-family: system-ui, sans-serif; background: #f6f4ef; color: #222; margin: 0; }
main { max-width: 560px; margin: 64px auto; background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 1px 4px #0002; }
h1 { margin-top: 0; font-size: 24px; }
li { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #eee; list-style: none; }
ul { padding: 0; }
button { font: inherit; padding: 6px 12px; border-radius: 6px; border: 1px solid #bbb; background: #fafafa; cursor: pointer; }
input { font: inherit; padding: 8px; border-radius: 6px; border: 1px solid #bbb; width: 100%; box-sizing: border-box; margin-bottom: 12px; }
</style></head><body><main>${body}</main></body></html>`;
const send = (res, status, html, headers = {}) => {
  res.writeHead(status, { "content-type": "text/html; charset=utf-8", ...headers });
  res.end(html);
};

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const signedIn = sessions.has(cookieOf(req));
  if (url.pathname === "/login" && req.method === "POST") {
    const fields = await form(req);
    if (fields.get("email") === account.email && fields.get("password") === account.password) {
      const sid = randomBytes(16).toString("hex");
      sessions.add(sid);
      return send(res, 303, "", { location: "/", "set-cookie": `sid=${sid}; HttpOnly; Path=/` });
    }
    return send(res, 401, page("Sign in", `<h1>Sign in</h1><p>Wrong email or password.</p><a href="/login">Try again</a>`));
  }
  if (url.pathname === "/login") {
    return send(res, 200, page("Sign in", `<h1>Sign in to Task board</h1>
<form method="post" action="/login"><input name="email" placeholder="Email" autofocus>
<input name="password" type="password" placeholder="Password"><button>Sign in</button></form>`));
  }
  if (!signedIn) return send(res, 303, "", { location: "/login" });
  if (url.pathname === "/toggle" && req.method === "POST") {
    const id = Number((await form(req)).get("id"));
    save(load().map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
    return send(res, 303, "", { location: "/" });
  }
  const items = load()
    .map(
      (task) => `<li><form method="post" action="/toggle"><input type="hidden" name="id" value="${task.id}">
<button>${task.done ? "Undo" : "Done"}</button></form><span>${task.done ? `<s>${escape(task.title)}</s>` : escape(task.title)}</span></li>`,
    )
    .join("");
  send(res, 200, page("Task board", `<h1>Task board</h1><ul>${items}</ul>`));
}).listen(port, "0.0.0.0", () => console.log(`task board on http://127.0.0.1:${port}`));
