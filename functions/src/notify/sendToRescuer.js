"use strict";

const { logger } = require("firebase-functions");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

const LAST_SENT = new Map();
const RATE_LIMIT_MS = 1000;
const CLEANUP_MS = 60000;

const NOTIFICATION_TEMPLATES = {
  DISPATCH: {
    title: "🚨 Lệnh điều động khẩn",
    body: (incidentType, victimName) => `${incidentType} — ${victimName} cần hỗ trợ gấp`,
    action: "DISPATCH"
  },
  UPDATE: {
    title: "📋 Cập nhật SOS",
    body: (_incidentType, victimName) => `${victimName} đã cung cấp thêm thông tin`,
    action: "UPDATE"
  },
  CANCELLED: {
    title: "✅ SOS đã kết thúc",
    body: (_incidentType, victimName) => `${victimName} đã được giải cứu thành công`,
    action: "CANCELLED"
  }
};

const toStringValue = (value) => (value === null || value === undefined ? "" : String(value));

const getLatLng = (sosData) => {
  if (!sosData || typeof sosData !== "object") {
    return { lat: "", lng: "" };
  }

  const lat = sosData.lat ?? sosData.latitude ?? sosData.location?.lat ?? sosData.location?.latitude;
  const lng = sosData.lng ?? sosData.longitude ?? sosData.location?.lng ?? sosData.location?.longitude;

  return {
    lat: toStringValue(lat),
    lng: toStringValue(lng)
  };
};

const shouldRateLimit = (teamId) => {
  const lastSentAt = LAST_SENT.get(teamId);
  const now = Date.now();

  if (lastSentAt && now - lastSentAt < RATE_LIMIT_MS) {
    return true;
  }

  LAST_SENT.set(teamId, now);
  setTimeout(() => {
    LAST_SENT.delete(teamId);
  }, CLEANUP_MS);

  return false;
};

const buildMessage = ({ token, sosId, sosData, notificationType }) => {
  const template = NOTIFICATION_TEMPLATES[notificationType] || NOTIFICATION_TEMPLATES.UPDATE;
  const victimName = sosData?.victimName || "Nạn nhân";
  const incidentType = sosData?.incidentType || "Khác";
  const { lat, lng } = getLatLng(sosData);

  return {
    token,
    notification: {
      title: template.title,
      body: template.body(incidentType, victimName)
    },
    data: {
      sosId: toStringValue(sosId),
      victimName: toStringValue(victimName),
      victimPhone: toStringValue(sosData?.victimPhone),
      incidentType: toStringValue(incidentType),
      lat,
      lng,
      action: template.action
    },
    android: {
      priority: "high",
      notification: {
        channelId: "rescue_alerts"
      }
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
          "content-available": 1
        }
      }
    }
  };
};

const sendToRescuer = async ({ teamId, sosId, sosData, notificationType }) => {
  try {
    if (!teamId) {
      logger.warn("sendToRescuer missing teamId", { teamId, sosId });
      return null;
    }

    if (shouldRateLimit(teamId)) {
      logger.warn("sendToRescuer rate limited", { teamId, sosId });
      return null;
    }

    const firestore = getFirestore();
    const teamSnap = await firestore.collection("rescue_teams").doc(teamId).get();
    const teamData = teamSnap.exists ? teamSnap.data() : null;
    const token = teamData?.fcmToken;

    if (!token) {
      logger.warn("sendToRescuer missing fcmToken", { teamId, sosId });
      return null;
    }

    const message = buildMessage({ token, sosId, sosData, notificationType });
    const messageId = await getMessaging().send(message);

    return messageId;
  } catch (error) {
    const errorCode = error?.code || error?.errorInfo?.code;

    if (errorCode === "messaging/registration-token-not-registered") {
      logger.warn("sendToRescuer token not registered", {
        teamId,
        sosId
      });

      try {
        await getFirestore().collection("rescue_teams").doc(teamId).set(
          {
            fcmToken: null
          },
          { merge: true }
        );
      } catch (updateError) {
        logger.warn("sendToRescuer token cleanup failed", {
          teamId,
          sosId,
          error: updateError && updateError.message ? updateError.message : String(updateError)
        });
      }

      return null;
    }

    logger.warn("sendToRescuer failed", {
      teamId,
      sosId,
      input: { teamId, sosId, notificationType },
      error: error && error.message ? error.message : String(error)
    });
    return null;
  }
};

module.exports = {
  sendToRescuer
};
