import { createRequestHandler } from "@react-router/express";
import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4038;
const BASE_PATH = "/app042";

// Serve static assets from build/client with base path
app.use(
  `${BASE_PATH}/assets`,
  express.static(join(__dirname, "build/client/assets"), {
    immutable: true,
    maxAge: "1y",
  })
);

// Serve other static files (like favicon)
app.use(
  BASE_PATH,
  express.static(join(__dirname, "build/client"), {
    maxAge: "1h",
  })
);

// Handle SSR requests
app.all(
  "*",
  createRequestHandler({
    build: await import("./build/server/index.js"),
  })
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}${BASE_PATH}`);
});
