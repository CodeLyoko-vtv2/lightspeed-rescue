const { onRequest } = require("firebase-functions/v2/https");
const {
  createRescueTeam,
  updateRescueTeam,
  deleteRescueTeam,
  getAvailableTeams
} = require("./rescueTeams");

exports.apiPing = onRequest((req, res) => {
  res.json({ ok: true, service: "api" });
});

exports.createRescueTeam = createRescueTeam;
exports.updateRescueTeam = updateRescueTeam;
exports.deleteRescueTeam = deleteRescueTeam;
exports.getAvailableTeams = getAvailableTeams;
