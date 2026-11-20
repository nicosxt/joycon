// Tiny zero-dependency dev server for the static site in ./public.
// Supports clean URLs like Netlify: /joy -> joy.html, /weekend#sunday -> weekend.html
// Usage: npm start   (or: node server.js [port])

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "public");
const PORT = Number(process.argv[2] || process.env.PORT || 3000);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

function resolve(urlPath) {
  let p = decodeURIComponent(urlPath.split("?")[0]);
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT)) return null; // block path traversal
  const candidates = [file, file + ".html", path.join(file, "index.html")];
  return candidates.find((f) => fs.existsSync(f) && fs.statSync(f).isFile()) || null;
}

http
  .createServer((req, res) => {
    const file = resolve(req.url);
    if (!file) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found");
    }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => console.log(`JoyCon running at http://localhost:${PORT}`));
