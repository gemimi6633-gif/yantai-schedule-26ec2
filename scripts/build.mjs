import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const serverDir = path.join(dist, "server");
const publicDir = path.join(dist, "public");

async function read(file) {
  return fs.readFile(path.join(root, file), "utf8");
}

async function copyFile(from, to) {
  await fs.mkdir(path.dirname(to), { recursive: true });
  await fs.copyFile(path.join(root, from), to);
}

async function main() {
  await fs.rm(dist, { recursive: true, force: true });
  await fs.mkdir(serverDir, { recursive: true });
  await fs.mkdir(publicDir, { recursive: true });
  await fs.mkdir(path.join(dist, ".openai"), { recursive: true });

  const html = await read("index.html");
  const css = await read("assets/styles.css");
  const js = await read("assets/app.js");
  const sourceImage = await fs.readFile(path.join(root, "assets/source-schedule.png"));

  await fs.writeFile(path.join(publicDir, "index.html"), html);
  await fs.mkdir(path.join(publicDir, "assets"), { recursive: true });
  await fs.writeFile(path.join(publicDir, "assets/styles.css"), css);
  await fs.writeFile(path.join(publicDir, "assets/app.js"), js);
  await copyFile("assets/source-schedule.png", path.join(publicDir, "assets/source-schedule.png"));

  const worker = `
const assets = new Map([
  ["/", { type: "text/html; charset=utf-8", body: ${JSON.stringify(html)} }],
  ["/index.html", { type: "text/html; charset=utf-8", body: ${JSON.stringify(html)} }],
  ["/assets/styles.css", { type: "text/css; charset=utf-8", body: ${JSON.stringify(css)} }],
  ["/assets/app.js", { type: "application/javascript; charset=utf-8", body: ${JSON.stringify(js)} }],
]);

const sourceScheduleBase64 = ${JSON.stringify(sourceImage.toString("base64"))};

function base64ToBytes(base64) {
  const text = atob(base64);
  const bytes = new Uint8Array(text.length);
  for (let index = 0; index < text.length; index += 1) bytes[index] = text.charCodeAt(index);
  return bytes;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const asset = assets.get(url.pathname);
    if (asset) {
      return new Response(asset.body, { headers: { "content-type": asset.type, "cache-control": "public, max-age=60" } });
    }
    if (url.pathname === "/assets/source-schedule.png") {
      return new Response(base64ToBytes(sourceScheduleBase64), {
        status: 200,
        headers: { "content-type": "image/png", "cache-control": "public, max-age=604800" },
      });
    }
    return new Response(assets.get("/").body, { headers: { "content-type": "text/html; charset=utf-8" } });
  },
};
`;
  await fs.writeFile(path.join(serverDir, "index.js"), worker.trimStart());
  await fs.copyFile(path.join(root, ".openai/hosting.json"), path.join(dist, ".openai/hosting.json"));
  console.log("Built dist/server/index.js and dist/public assets");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
