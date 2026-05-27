"use strict";

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const { getFirestore } = require("firebase-admin/firestore");
const { getDatabase, ServerValue } = require("firebase-admin/database");
const {
  calculateTriageScore,
  getLabelText,
  DEFAULT_INCIDENT_TYPE,
  INCIDENT_BASE_SCORES
} = require("../ai/triageScore");

let sendToAdmin = null;
try {
  ({ sendToAdmin } = require("../notify/sendToAdmin"));
} catch (error) {
  logger.warn("sendToAdmin module is not available", {
    error: error && error.message ? error.message : String(error)
  });
}

const REQUIRED_FIELDS = ["victimId", "victimName", "victimPhone", "incidentType"];
const VALID_INCIDENT_TYPES = Object.keys(INCIDENT_BASE_SCORES);

const isEmptyValue = (value) =>
  value === null || value === undefined || value === "";

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

const validateRequiredFields = (data, sosId) => {
  const missingFields = REQUIRED_FIELDS.filter((field) => isEmptyValue(data[field]));

  if (missingFields.length > 0) {
    logger.warn("Missing required SOS fields", {
      sosId,
      missingFields
    });
    return false;
  }

  return true;
};

const buildNotificationBody = ({ victimName, victimPhone, incidentType }) => {
  const phonePart = victimPhone ? ` (${victimPhone})` : "";
  return `SOS moi tu ${victimName}${phonePart}. Su co: ${incidentType}.`;
};

const onSosCreated = onDocumentCreated(
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

      const data = event.data.data() || {};

      if (!validateRequiredFields(data, sosId)) {
        return;
      }

      const incidentType = normalizeIncidentType(data.incidentType, sosId);
      const victimId = data.victimId;
      const victimName = data.victimName;
      const victimPhone = data.victimPhone;

      const { score, label } = calculateTriageScore({
        incidentType,
        description: data.description,
        hasImage: Boolean(data.hasImage),
        hasAudio: Boolean(data.hasAudio),
        minutesWaiting: typeof data.minutesWaiting === "number" ? data.minutesWaiting : 0
      });

      const firestore = getFirestore();
      const rtdb = getDatabase();

      const scoreUpdate = firestore
        .collection("sos_alerts")
        .doc(sosId)
        .update({
          priorityScore: score,
          priorityLabel: label,
          aiTriageScore: score,
          aiTriageLabel: label
        });

      const sessionInit = rtdb.ref(`sos_sessions/${sosId}/meta`).set({
        victimId,
        victimName,
        victimPhone,
        status: "active",
        createdAt: ServerValue.TIMESTAMP
      });

      const [scoreResult, sessionResult] = await Promise.allSettled([
        scoreUpdate,
        sessionInit
      ]);

      if (scoreResult.status === "rejected") {
        logger.warn("Failed to update SOS score", {
          sosId,
          error: scoreResult.reason ? scoreResult.reason.message : "unknown"
        });
      }

      if (sessionResult.status === "rejected") {
        logger.warn("Failed to create SOS session", {
          sosId,
          error: sessionResult.reason ? sessionResult.reason.message : "unknown"
        });
      }

      const labelText = getLabelText(label);
      const title = `[${labelText}] ${incidentType} - ${victimName}`;
      const body = buildNotificationBody({ victimName, victimPhone, incidentType });

      if (typeof sendToAdmin === "function") {
        const notifyResult = await Promise.allSettled([
          sendToAdmin({
            title,
            body,
            sosId,
            type: "NEW_SOS"
          })
        ]);

        if (notifyResult[0].status === "rejected") {
          logger.warn("Notify step failed", {
            sosId,
            error: notifyResult[0].reason ? notifyResult[0].reason.message : "unknown"
          });
        }
      } else {
        logger.warn("sendToAdmin is not configured", { sosId });
      }

      logger.info("SOS triage processed", {
        sosId,
        victimName,
        score,
        label
      });
    } catch (error) {
      logger.error("onSosCreated unexpected error", {
        sosId,
        error: error && error.message ? error.message : String(error)
      });
    }
  }
);

module.exports = {
  onSosCreated
};
