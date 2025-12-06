import * as functions from "firebase-functions/v2/https";
import express from "express";
import cors from "cors";
import path from "path";

if (process.env.NODE_ENV !== 'production') {
  try { require('dotenv').config(); } catch(e) { }
}

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

app.get("/_health_env", (req, res) => {
  res.json({
    PAYPAL_CLIENT_ID_present: !!process.env.PAYPAL_CLIENT_ID,
    PAYPAL_SECRET_present: !!process.env.PAYPAL_SECRET,
    OPENAI_API_KEY_present: !!process.env.OPENAI_API_KEY,
    NODE_ENV: process.env.NODE_ENV || "unknown"
  });
});

app.post("/generate", generate);
app.get("/generate-client-token", generateClientToken);
app.post("/generate-client-token", generateClientToken);
app.post("/create-order", createOrder);
app.post("/capture-order", captureOrder);

exports.api = functions.onRequest({ region: "us-central1" }, app);
