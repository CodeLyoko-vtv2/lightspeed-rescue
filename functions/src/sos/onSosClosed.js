"use strict";

const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const { getFirestore } = require("firebase-admin/firestore");
const { getDatabase, ServerValue } = require("firebase-admin/database");

let notifyAdmin = null;
try {
  ({ notifyAdmin } = require("../notify/sendToAdmin"));
} catch (error) {
  logger.warn("notifyAdmin module is not available", {
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

const onSosClosed = onDocumentUpdated(
  {
    document: "sos_records/{sosId}",
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

      if (before.status === "resolved" || after.status !== "resolved") {
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

      if (metaStatus === "resolved") {
        return;
      }

      const firestore = getFirestore();
      const assignedTeamIds = getAssignedTeamIds(after.assignedTeams);

      const cleanupTasks = [
        rtdb.ref(`sos_sessions/${sosId}/victim_location`).remove(),
        rtdb.ref(`sos_sessions/${sosId}/rescuer_locations`).remove(),
        rtdb.ref(`sos_sessions/${sosId}/meta`).update({
          status: "resolved",
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

      const teamUpdates = assignedTeamIds.map((teamId) =>
        firestore.collection("rescue_teams").doc(teamId).set(
          {
            isAvailable: true,
            currentSosId: null
          },
          { merge: true }
        )
      );

      const teamResults = await Promise.allSettled(teamUpdates);
      for (const result of teamResults) {
        if (result.status === "rejected") {
          logger.warn("onSosClosed rescue team update failed", {
            sosId,
            error: result.reason ? result.reason.message : "unknown"
          });
        }
      }

      if (typeof notifyAdmin === "function") {
        const victimName = after.victimName || "Nan nhan";
        try {
          await notifyAdmin({
            title: "✅ Giải cứu thành công",
            body: `${victimName} đã được giải cứu thành công`,
            sosId
          });
        } catch (error) {
          logger.warn("onSosClosed notifyAdmin failed", {
            sosId,
            error: error && error.message ? error.message : String(error)
          });
        }
      } else {
        logger.warn("notifyAdmin is not configured", { sosId });
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
