const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const worldCupMatchesHandler = require("./api/worldcup/matches.js");

const ROOT = __dirname;
const ROOT_WITH_SEPARATOR = `${ROOT}${path.sep}`;
const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 8124);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || `${HOST}:${PORT}`}`);
    if (url.pathname === "/api/worldcup/matches") {
      await worldCupMatchesHandler(request, createJsonResponse(response));
      return;
    }
    serveStatic(url.pathname, response);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ success: false, error: error.message || "服务异常" }));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`World Cup ledger running at http://${HOST}:${PORT}/`);
});

function createJsonResponse(response) {
  return {
    setHeader(name, value) {
      response.setHeader(name, value);
    },
    status(code) {
      response.statusCode = code;
      return this;
    },
    json(payload) {
      const body = JSON.stringify(payload);
      if (!response.hasHeader("Content-Type")) {
        response.setHeader("Content-Type", "application/json; charset=utf-8");
      }
      response.setHeader("Content-Length", Buffer.byteLength(body));
      response.end(body);
    },
  };
}

function serveStatic(pathname, response) {
  const safePath = decodeURIComponent(pathname).replace(/^\/+/, "") || "index.html";
  const resolved = path.resolve(ROOT, safePath);
  if (resolved !== ROOT && !resolved.startsWith(ROOT_WITH_SEPARATOR)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("禁止访问");
    return;
  }

  fs.stat(resolved, (statError, stats) => {
    if (statError || !stats.isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("文件不存在");
      return;
    }

    const contentType = MIME_TYPES[path.extname(resolved).toLowerCase()] || "application/octet-stream";
    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    });
    fs.createReadStream(resolved).pipe(response);
  });
}
