import * as functions from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";
import path from "path";

const apiDir = path.join(__dirname, "..", "api");

const generate = require(path.join(apiDir, "generate.js"));
const generateClientToken = require(path.join(apiDir, "generate-client-token.js"));
const createOrder = require(path.join(apiDir, "create-order.js"));
const captureOrder = require(path.join(apiDir, "capture-order.js"));

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "5mb" }));
app.use((req, res, next) => {
  if (req.path && req.path.startsWith("/api/")) {
    // remove only the leading "/api" so routes like "/generate" match
    req.url = req.url.replace(/^\/api/, "");
  }
  next();
});

app.post("/generate", generate);
app.get("/generate-client-token", generateClientToken);
app.post("/generate-client-token", generateClientToken);
app.post("/create-order", createOrder);
app.post("/capture-order", captureOrder);

exports.api = functions.onRequest({ region: "us-central1" }, app);
