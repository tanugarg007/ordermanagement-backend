const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const BASE = "http://127.0.0.1:5000";

function request(method, url, opts = {}) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const headers = { ...(opts.headers || {}) };
    let body = opts.body || null;
    if (opts.json !== undefined) {
      body = JSON.stringify(opts.json);
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = Buffer.byteLength(body);
    } else if (body && !(body instanceof Buffer)) {
      headers["Content-Length"] = Buffer.byteLength(body);
    }
    const req = http.request(
      {
        method,
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        headers,
      },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          let parsed;
          try {
            parsed = data && data[0] ? JSON.parse(data) : data;
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed, raw: data });
        });
      }
    );
    req.on("error", (e) => resolve({ status: 0, error: e.message }));
    if (body) req.write(body);
    req.end();
  });
}

function buildMultipart(fields, fileField, filePath) {
  const CRLF = "\r\n";
  const boundary = "----TestBoundary" + Date.now();
  let head = "";
  for (const k of Object.keys(fields)) {
    head += `--${boundary}${CRLF}`;
    head += `Content-Disposition: form-data; name="${k}"${CRLF}${CRLF}`;
    head += String(fields[k]) + CRLF;
  }
  if (filePath) {
    const name = path.basename(filePath);
    const ext = path.extname(name).toLowerCase();
    const mime =
      ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : "application/octet-stream";
    head += `--${boundary}${CRLF}`;
    head += `Content-Disposition: form-data; name="${fileField}"; filename="${name}"${CRLF}`;
    head += `Content-Type: ${mime}${CRLF}${CRLF}`;
  }
  const tail = `${CRLF}--${boundary}--${CRLF}`;
  const headBuf = Buffer.from(head, "utf8");
  const fileBuf = filePath ? fs.readFileSync(filePath) : Buffer.alloc(0);
  const tailBuf = Buffer.from(tail, "utf8");
  const body = Buffer.concat([headBuf, fileBuf, tailBuf]);
  return {
    body,
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

(async () => {
  let r;
  console.log("---(1) GET / - endpoints metadata");
  r = await request("GET", `${BASE}/`);
  console.log("status=", r.status, "body=", typeof r.body === "string" ? r.body : JSON.stringify(r.body, null, 2).slice(0, 600));

  console.log("\n---(2) Register user");
  const email = `shopuser_${Date.now()}@example.com`;
  r = await request("POST", `${BASE}/api/register`, {
    json: { name: "Shopkeeper", email, password: "password123" },
  });
  console.log("status=", r.status, "body=", typeof r.body === "string" ? r.body : JSON.stringify(r.body, null, 2).slice(0, 800));
  const token = r.body && r.body.token;
  if (token) console.log("[OK] got JWT token, len=", token.length);

  console.log("\n---(3) GET /api/health");
  r = await request("GET", `${BASE}/api/health`);
  console.log("status=", r.status, "body=", JSON.stringify(r.body).slice(0, 400));

  console.log("\n---(4) POST /api/items - NO auth - expect 401");
  const tempPng = path.join(__dirname, "tmp_test.png");
  fs.writeFileSync(
    tempPng,
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==",
      "base64"
    )
  );
  const mp1 = buildMultipart(
    { name: "Mouse NoAuth", price: "12.50", quantity: "20", category: "Electronics", status: "In Stock" },
    "image",
    tempPng
  );
  r = await request("POST", `${BASE}/api/items`, {
    body: mp1.body,
    headers: { "Content-Type": mp1.contentType, "Content-Length": mp1.body.length },
  });
  console.log("status=", r.status, "body=", typeof r.body === "string" ? r.body : JSON.stringify(r.body));

  console.log("\n---(5) POST /api/items - WITH auth + real multipart PNG - expect 201");
  const mp2 = buildMultipart(
    { name: "RGB Keyboard Pro", price: "89.99", quantity: "33", category: "Electronics", status: "In Stock" },
    "image",
    tempPng
  );
  r = await request("POST", `${BASE}/api/items`, {
    body: mp2.body,
    headers: {
      Authorization: `Bearer ${token || ""}`,
      "Content-Type": mp2.contentType,
      "Content-Length": mp2.body.length,
    },
  });
  console.log("status=", r.status, "body=", typeof r.body === "string" ? r.body : JSON.stringify(r.body, null, 2).slice(0, 1200));

  console.log("\n---(6) GET /api/items - should list at least 1 item");
  r = await request("GET", `${BASE}/api/items`);
  console.log(
    "status=",
    r.status,
    "count=",
    r.body && r.body.count,
    "total=",
    r.body && r.body.total,
    "firstItem=",
    r.body && r.body.items && r.body.items[0]
      ? JSON.stringify({
          _id: r.body.items[0]._id,
          name: r.body.items[0].name,
          image: r.body.items[0].image,
          price: r.body.items[0].price,
        })
      : ""
  );

  try { fs.unlinkSync(tempPng); } catch {}
  console.log("\nDone.");
})();
