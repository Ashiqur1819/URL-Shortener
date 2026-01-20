import http from "http";
import fs from "fs/promises";
import path from "path";

const port = 3000;

const serveFile = async (res, filePath, contentType) => {
  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch (error) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Page not found.");
  }
};

const server = http.createServer(async (req, res) => {
  if (req.method === "GET") {
    if (req.url === "/") {
      const filePath = path.join("public", "index.html");
      serveFile(res, filePath, "text/html");
    } else if (req.url === "/style.css") {
      const filePath = path.join("public", "style.css");
      serveFile(res, filePath, "text/css");
    }
  }
});

server.listen(port, () => {
  console.log("Server running successfully on port: ", port);
});
