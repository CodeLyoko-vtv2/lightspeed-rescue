const { onRequest } = require("firebase-functions/v2/https");

exports.notifyPing = onRequest((req, res) => {
  res.json({ ok: true, service: "notify" });
});
