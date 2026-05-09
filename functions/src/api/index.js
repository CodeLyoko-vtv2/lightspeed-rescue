const { onRequest } = require("firebase-functions/v2/https");

exports.apiPing = onRequest((req, res) => {
  res.json({ ok: true, service: "api" });
});
