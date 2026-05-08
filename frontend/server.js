const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// ---------- API PROXIES ----------

app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://account-auth:4001",
    changeOrigin: true,
    pathRewrite: {
      "^/api/auth": ""
    }
  })
);

app.use(
  "/api/gameplay",
  createProxyMiddleware({
    target: "http://gameplay:4002",
    changeOrigin: true,
    pathRewrite: {
      "^/api/gameplay": ""
    }
  })
);

app.use(
  "/api/profile",
  createProxyMiddleware({
    target: "http://player-profile:4003",
    changeOrigin: true,
    pathRewrite: {
      "^/api/profile": ""
    }
  })
);

// ---------- STATIC FRONTEND ----------

app.use(express.static(path.join(__dirname)));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ---------- START ----------

app.listen(8080, () => {
  console.log("frontend running on 8080");
});