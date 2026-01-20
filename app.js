import http from "http";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const port = 3000;
const dataFile = path.join("data", "links.json");

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

const loadlinks = async () => {
  try {
    const data = await fs.readFile(dataFile, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile(dataFile, JSON.stringify({}));
      return {};
    }
    throw error;
  }
};

const saveLinks = async (links) => {
  try {
    await fs.writeFile(dataFile, JSON.stringify(links));
  } catch (error) {
    console.log(error);
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
    } else if (req.url === "/links") {
      const links = await loadlinks();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(links));
    } else {
      const links = await loadlinks();
      const shortCode = req.url.slice(1);

      if (links[shortCode]) {
        res.writeHead(302, { location: links[shortCode] });
        return res.end();
      }

      res.writeHead(404, { "Content-Type": "application/text" });
      return res.end("Shortened URL is not found");
    }
  }

  if (req.method === "POST" && req.url === "/shorten") {
    const links = await loadlinks();

    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      const { url, shortCode } = JSON.parse(body);

      if (!url) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("URL is required.");
      }

      const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

      if (links[finalShortCode]) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Short code already exists. Choose another one.");
      }

      links[finalShortCode] = url;

      await saveLinks(links);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, shortCode: finalShortCode }));
    });
  }
});

server.listen(port, () => {
  console.log("Server running successfully on port: ", port);
});
