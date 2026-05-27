"use strict";

const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const { getFirestore } = require("firebase-admin/firestore");
const { getDatabase, ServerValue } = require("firebase-admin/database");

let sendToAdmin = null;
try {
  ({ sendToAdmin } = require("../notify/sendToAdmin"));
} catch (error) {
  logger.warn("sendToAdmin module is not available", {
    error: error && error.message ? error.message : String(error)
  });
}

const toMillis = (value) => {
  if (!value) {
    return null;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }
  return null;
};

const getAssignedTeamIds = (assignedTeams) => {
  if (!assignedTeams || typeof assignedTeams !== "object") {
    return [];
  }
  return Object.keys(assignedTeams);
};

const TERMINAL_STATUSES = new Set(["cancelled", "completed", "resolved"]);

const onSosClosed = onDocumentUpdated(
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

      if (TERMINAL_STATUSES.has(before.status) || !TERMINAL_STATUSES.has(after.status)) {
        return;
      }

      const rtdb = getDatabase();
      let metaStatus = null;
      try {
        const metaSnap = await rtdb
          .ref(`sos_sessions/${sosId}/meta/status`)
          .get();
        metaStatus = metaSnap.exists() ? metaSnap.val() : null;
      } catch (error) {
        logger.warn("Failed to check RTDB meta status", {
          sosId,
          error: error && error.message ? error.message : String(error)
        });
      }

      if (TERMINAL_STATUSES.has(metaStatus)) {
        return;
      }

      const firestore = getFirestore();
      const assignedTeamIds = getAssignedTeamIds(after.assignedTeams);
      if (after.rescuerId && !assignedTeamIds.includes(after.rescuerId)) {
        assignedTeamIds.push(after.rescuerId);
      }
      if (after.rescueTeamId && !assignedTeamIds.includes(after.rescueTeamId)) {
        assignedTeamIds.push(after.rescueTeamId);
      }

      const cleanupTasks = [
        rtdb.ref(`sos_sessions/${sosId}/victim_location`).remove(),
        rtdb.ref(`sos_sessions/${sosId}/rescuer_locations`).remove(),
        rtdb.ref(`sos_sessions/${sosId}/meta`).update({
          status: after.status,
          resolvedAt: ServerValue.TIMESTAMP
        })
      ];

      const cleanupResults = await Promise.allSettled(cleanupTasks);
      for (const result of cleanupResults) {
        if (result.status === "rejected") {
          logger.warn("onSosClosed cleanup failed", {
            sosId,
            error: result.reason ? result.reason.message : "unknown"
          });
        }
      }

      const teamUpdates = assignedTeamIds.flatMap((teamId) => [
          firestore.collection("rescue_teams").doc(teamId).set(
            {
              isAvailable: true,
              currentSosId: null
            },
            { merge: true }
          ),
          firestore.collection("Users").doc(teamId).set(
            {
              isAvailable: true,
              currentSosId: null
            },
            { merge: true }
          )
        ]);

      const teamResults = await Promise.allSettled(teamUpdates);
      for (const result of teamResults) {
        if (result.status === "rejected") {
          logger.warn("onSosClosed rescue team update failed", {
            sosId,
            error: result.reason ? result.reason.message : "unknown"
          });
        }
      }

      if (typeof sendToAdmin === "function") {
        const victimName = after.victimName || "Nan nhan";
        try {
          await sendToAdmin({
            title: "✅ Giải cứu thành công",
            body: `${victimName} đã được giải cứu thành công`,
            sosId,
            type: "RESOLVED"
          });
        } catch (error) {
          logger.warn("onSosClosed sendToAdmin failed", {
            sosId,
            error: error && error.message ? error.message : String(error)
          });
        }
      } else {
        logger.warn("sendToAdmin is not configured", { sosId });
      }

      const unreadQuery = await firestore
        .collection("notifications")
        .where("sosId", "==", sosId)
        .where("read", "==", false)
        .get();

      if (!unreadQuery.empty) {
        const batch = firestore.batch();
        unreadQuery.docs.forEach((doc) => {
          batch.update(doc.ref, { read: true });
        });
        try {
          await batch.commit();
        } catch (error) {
          logger.warn("onSosClosed notifications cleanup failed", {
            sosId,
            error: error && error.message ? error.message : String(error)
          });
        }
      }

      const createdAt = toMillis(after.createdAt);
      const resolvedAt = Date.now();
      const durationMinutes = createdAt
        ? Math.round((resolvedAt - createdAt) / 60000)
        : null;
      const victimName = after.victimName || "Nan nhan";
      const incidentType = after.incidentType || "Khac";
      const durationText = durationMinutes === null ? "NA" : durationMinutes;

      logger.info(
        `[onSosClosed] sosId=${sosId} victim=${victimName} duration=${durationText}min teams=${assignedTeamIds.length} incidentType=${incidentType}`
      );
    } catch (error) {
      logger.error("onSosClosed unexpected error", {
        sosId,
        error: error && error.message ? error.message : String(error)
      });
    }
  }
);

module.exports = {
  onSosClosed
};
