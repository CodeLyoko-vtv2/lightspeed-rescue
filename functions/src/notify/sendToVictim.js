"use strict";

const { logger } = require("firebase-functions");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const sendToVictim = async ({ victimId, sosId, title, body }) => {
  try {
    if (!victimId) {
      logger.warn("sendToVictim missing victimId", {
        sosId,
        title,
        body
      });
      return null;
    }

    const firestore = getFirestore();
    const docRef = await firestore.collection("notifications").add({
      targetRole: "victim",
      victimId,
      targetUserId: victimId,
      sosId,
      title: title || "",
      body: body || "",
      type: "RESCUE_ACCEPTED",
      read: false,
      createdAt: FieldValue.serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    logger.warn("sendToVictim failed", {
      victimId,
      sosId,
      error: error && error.message ? error.message : String(error)
    });
    return null;
  }
};

module.exports = {
  sendToVictim,
  notifyVictim: sendToVictim
};
