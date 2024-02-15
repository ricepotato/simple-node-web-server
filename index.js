// simple js http server
// to run: node simpleapi.js
// to test: curl http://localhost:3001/number it responses random integer number

const http = require("http");
const url = require("url");
const fs = require("fs");

function handler(req, res) {
  const q = url.parse(req.url, true);
  const path = q.pathname;
  console.log(`Request path: ${path}`);
  if (path === "/") {
    const filepath = "./index.html";

    fs.stat(filepath, (err, stat) => {
      if (err) {
        console.log("fs stats error.", err);
        res.writeHead(404);
        res.end("Not Found");
        return;
      }

      const modified = stat.mtime;
      const etag =
        stat.size + "-" + Date.parse(stat.mtime).toString().substring(0, 8);
      if (
        req.headers["if-none-match"] &&
        req.headers["if-none-match"] === etag
      ) {
        console.log("etag match. not modified.");
        res.writeHead(304);
        res.end();
        return;
      }

      if (req.headers["if-modified-since"]) {
        const ifModifiedSince = new Date(req.headers["if-modified-since"]);
        // 0.1 초단위 구분 불가
        if (
          Math.floor(ifModifiedSince.getTime()) / 1000 >=
          Math.floor(modified.getTime() / 1000)
        ) {
          console.log("not modified since. not modified.");
          res.writeHead(304);
          res.end();
          return;
        }
      }

      fs.readFile("./index.html", function (err, data) {
        if (err) {
            console.log("fs readFile error.", err);
          res.writeHead(404, { "Content-Type": "text/html" });
          return res.end("404 Not Found");
        }
        // if if-none-match header is set, send 304
        res.writeHead(200, {
          "Content-Type": "text/html",
          ETag: etag,
          "Last-Modified": modified.toUTCString(),
        });
        console.log("ok");
        res.write(data);
        return res.end();
      });
    });

    return;
  }

  if (path === "/number") {
    console.log("Request received");
    res.writeHead(200, { "Content-Type": "text/plain" });
    const number = Math.floor(Math.random() * 100).toString();
    console.log("Response: " + number);
    res.end(number);
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
}

http.createServer(handler).listen(3001);
console.log("Server running at http://localhost:3001/");
