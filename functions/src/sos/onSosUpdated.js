"use strict";

const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const {
  calculateTriageScore,
  DEFAULT_INCIDENT_TYPE,
  INCIDENT_BASE_SCORES
} = require("../ai/triageScore");

let sendToAdmin = null;
let sendToRescuer = null;
let notifyVictim = null;

try {
  ({ sendToAdmin } = require("../notify/sendToAdmin"));
} catch (error) {
  logger.warn("sendToAdmin module is not available", {
    error: error && error.message ? error.message : String(error)
  });
}

try {
  ({ sendToRescuer } = require("../notify/sendToRescuer"));
} catch (error) {
  logger.warn("sendToRescuer module is not available", {
    error: error && error.message ? error.message : String(error)
  });
}

try {
  ({ notifyVictim } = require("../notify/sendToVictim"));
} catch (error) {
  logger.warn("notifyVictim module is not available", {
    error: error && error.message ? error.message : String(error)
  });
}

const INTERNAL_FIELDS = ["priorityScore", "priorityLabel", "updatedAt", "status"];
const CASE1_FIELDS = ["description", "imageUrls", "audioUrl", "incidentType"];
const VALID_INCIDENT_TYPES = Object.keys(INCIDENT_BASE_SCORES);

const stripInternalFields = (data) => {
  const result = {};
  for (const key of Object.keys(data || {})) {
    if (!INTERNAL_FIELDS.includes(key)) {
      result[key] = data[key];
    }
  }
  return result;
};

const isTimestamp = (value) => value && typeof value.toMillis === "function";

const deepEqual = (left, right) => {
  if (left === right) {
    return true;
  }

  if (isTimestamp(left) && isTimestamp(right)) {
    return left.toMillis() === right.toMillis();
  }

  if (typeof left !== typeof right) {
    return false;
  }

  if (left === null || right === null) {
    return left === right;
  }

  if (Array.isArray(left)) {
    if (!Array.isArray(right) || left.length !== right.length) {
      return false;
    }
    for (let index = 0; index < left.length; index += 1) {
      if (!deepEqual(left[index], right[index])) {
        return false;
      }
    }
    return true;
  }

  if (typeof left === "object") {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) {
      return false;
    }
    for (const key of leftKeys) {
      if (!Object.prototype.hasOwnProperty.call(right, key)) {
        return false;
      }
      if (!deepEqual(left[key], right[key])) {
        return false;
      }
    }
    return true;
  }

  return false;
};

const normalizeIncidentType = (incidentType, sosId) => {
  if (typeof incidentType !== "string" || !VALID_INCIDENT_TYPES.includes(incidentType)) {
    logger.warn("Invalid incidentType, fallback to default", {
      sosId,
      incidentType
    });
    return DEFAULT_INCIDENT_TYPE;
  }

  return incidentType;
};

const getAssignedTeams = (value) => (value && typeof value === "object" ? value : {});

const getNewTeamIds = (beforeTeams, afterTeams) => {
  const beforeIds = new Set(Object.keys(beforeTeams));
  return Object.keys(afterTeams).filter((teamId) => !beforeIds.has(teamId));
};

const getStatusChanges = (beforeTeams, afterTeams) => {
  const changes = [];
  for (const [teamId, afterTeam] of Object.entries(afterTeams)) {
    const beforeTeam = beforeTeams[teamId] || {};
    const beforeStatus = beforeTeam.status;
    const afterStatus = afterTeam ? afterTeam.status : undefined;
    if (beforeStatus !== afterStatus) {
      changes.push({ teamId, beforeTeam, afterTeam, beforeStatus, afterStatus });
    }
  }
  return changes;
};

const buildTeamDisplayName = (teamId, teamData) =>
  teamData?.name || teamData?.teamName || teamId;

const buildCase1Title = (victimName) => `${victimName} da cung cap them thong tin su co`;

const buildAdminMessage = (message) => ({
  title: "Cap nhat SOS",
  body: message
});

const onSosUpdated = onDocumentUpdated(
  {
    document: "sos_alerts/{sosId}",
    region: "asia-southeast1",
    timeoutSeconds: 60,
    memory: "256MiB"
  },
  async (event) => {
    const sosId = event.params.sosId;

    try {
      if (!event.data) {
        logger.warn("Missing snapshot data", { sosId });
        return;
      }

      const before = event.data.before.data() || {};
      const after = event.data.after.data() || {};

      const beforeFiltered = stripInternalFields(before);
      const afterFiltered = stripInternalFields(after);

      if (deepEqual(beforeFiltered, afterFiltered)) {
        return;
      }

      const updateTypes = [];
      const tasks = [];
      const firestore = getFirestore();

      const case1Changed = CASE1_FIELDS.some(
        (field) => !deepEqual(before[field], after[field])
      );

      if (case1Changed) {
        updateTypes.push("victim-info");
        const incidentType = normalizeIncidentType(after.incidentType, sosId);
        const { score, label } = calculateTriageScore({
          incidentType,
          description: after.description,
          hasImage: Array.isArray(after.imageUrls) && after.imageUrls.length > 0,
          hasAudio: Boolean(after.audioUrl),
          minutesWaiting:
            typeof after.minutesWaiting === "number" ? after.minutesWaiting : 0
        });

        tasks.push(
          firestore.collection("sos_alerts").doc(sosId).update({
            priorityScore: score,
            priorityLabel: label,
            aiTriageScore: score,
            aiTriageLabel: label,
            updatedAt: FieldValue.serverTimestamp()
          })
        );

        const victimName = after.victimName || "Nan nhan";
        if (typeof sendToAdmin === "function") {
          tasks.push(
            sendToAdmin({
              title: buildCase1Title(victimName),
              body: `SOS ${sosId} da cap nhat thong tin su co.`,
              sosId,
              type: "INFO_UPDATED"
            })
          );
        } else {
          logger.warn("sendToAdmin is not configured", { sosId });
        }

        const assignedTeams = getAssignedTeams(after.assignedTeams);
        const acceptedTeams = Object.entries(assignedTeams).filter(
          ([, team]) => team && team.status === "accepted"
        );

        if (acceptedTeams.length > 0) {
          if (typeof sendToRescuer === "function") {
            for (const [teamId] of acceptedTeams) {
              tasks.push(
                sendToRescuer({
                  teamId,
                  sosId,
                  sosData: after,
                  notificationType: "UPDATE"
                })
              );
            }
          } else {
            logger.warn("sendToRescuer is not configured", { sosId });
          }
        }
      }

      const beforeTeams = getAssignedTeams(before.assignedTeams);
      const afterTeams = getAssignedTeams(after.assignedTeams);
      const newTeamIds = getNewTeamIds(beforeTeams, afterTeams);

      if (newTeamIds.length > 0) {
        updateTypes.push("assigned-teams");
        for (const teamId of newTeamIds) {
          if (typeof sendToRescuer === "function") {
            tasks.push(
              sendToRescuer({
                teamId,
                sosId,
                sosData: after,
                notificationType: "DISPATCH"
              })
            );
          } else {
            logger.warn("sendToRescuer is not configured", { sosId, teamId });
          }

          tasks.push(
            firestore.collection("rescue_teams").doc(teamId).set(
              {
                currentSosId: sosId,
                isAvailable: false
              },
              { merge: true }
            )
          );
        }

        if (typeof sendToAdmin === "function") {
          tasks.push(
            sendToAdmin({
              ...buildAdminMessage("Da dieu dong doi cuu ho moi."),
              sosId,
              type: "TEAM_RESPONSE"
            })
          );
        }
      }

      const statusChanges = getStatusChanges(beforeTeams, afterTeams);
      if (statusChanges.length > 0) {
        updateTypes.push("team-status");
        for (const change of statusChanges) {
          const teamName = buildTeamDisplayName(change.teamId, change.afterTeam);
          const afterStatus = change.afterStatus;

          if (afterStatus === "accepted") {
            if (typeof notifyVictim === "function") {
              tasks.push(
                notifyVictim({
                  victimId: after.victimId,
                  sosId,
                  title: "Cuu ho dang toi",
                  body: "Doi cuu ho dang tren duong den ban."
                })
              );
            } else {
              logger.warn("notifyVictim is not configured", { sosId });
            }

            if (typeof sendToAdmin === "function") {
              tasks.push(
                sendToAdmin({
                  ...buildAdminMessage(`${teamName} da nhan nhiem vu.`),
                  sosId,
                  type: "TEAM_RESPONSE"
                })
              );
            }
          }

          if (afterStatus === "rejected") {
            const reason =
              change.afterTeam?.reason || change.afterTeam?.rejectionReason || "Khong ro";

            if (typeof sendToAdmin === "function") {
              tasks.push(
                sendToAdmin({
                  ...buildAdminMessage(`${teamName} tu choi - ${reason}.`),
                  sosId,
                  type: "TEAM_RESPONSE"
                })
              );
            }

            tasks.push(
              firestore.collection("rescue_teams").doc(change.teamId).set(
                {
                  currentSosId: null,
                  isAvailable: true
                },
                { merge: true }
              )
            );
          }

          if (afterStatus === "completed") {
            if (typeof sendToAdmin === "function") {
              tasks.push(
                sendToAdmin({
                  ...buildAdminMessage(`${teamName} da hoan thanh nhiem vu.`),
                  sosId,
                  type: "TEAM_RESPONSE"
                })
              );
            }

            tasks.push(
              firestore.collection("rescue_teams").doc(change.teamId).set(
                {
                  currentSosId: null,
                  isAvailable: true
                },
                { merge: true }
              )
            );
          }
        }
      }

      if (tasks.length === 0) {
        return;
      }

      const results = await Promise.allSettled(tasks);
      for (const result of results) {
        if (result.status === "rejected") {
          logger.warn("onSosUpdated task failed", {
            sosId,
            error: result.reason ? result.reason.message : "unknown"
          });
        }
      }

      logger.info("SOS updated processed", {
        sosId,
        updateTypes
      });
    } catch (error) {
      logger.error("onSosUpdated unexpected error", {
        sosId,
        error: error && error.message ? error.message : String(error)
      });
    }
  }
);

module.exports = {
  onSosUpdated
};
