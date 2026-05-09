const { onRequest } = require("firebase-functions/v2/https");
const { onSosCreated } = require("./onSosCreated");
const { onSosUpdated } = require("./onSosUpdated");

exports.sosPing = onRequest((req, res) => {
  res.json({ ok: true, service: "sos" });
});

exports.onSosCreated = onSosCreated;
exports.onSosUpdated = onSosUpdated;
