const { onRequest } = require("firebase-functions/v2/https");

exports.sosPing = onRequest((req, res) => {
  res.json({ ok: true, service: "sos" });
});
