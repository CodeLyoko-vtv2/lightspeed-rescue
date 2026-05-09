const { onRequest } = require("firebase-functions/v2/https");

exports.aiPing = onRequest((req, res) => {
  res.json({ ok: true, service: "ai" });
});
