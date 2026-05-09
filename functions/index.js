const { initializeApp } = require("firebase-admin/app");
const { setGlobalOptions } = require("firebase-functions/v2");

setGlobalOptions({ region: "asia-southeast1" });
initializeApp();

const sos = require("./src/sos");
const notify = require("./src/notify");
const ai = require("./src/ai");
const api = require("./src/api");

module.exports = {
  ...sos,
  ...notify,
  ...ai,
  ...api
};
