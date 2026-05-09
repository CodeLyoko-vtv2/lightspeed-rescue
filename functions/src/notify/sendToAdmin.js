"use strict";

const { logger } = require("firebase-functions");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

/**
 * Admin web listener example:
 *
 * // admin-web/src/hooks/useNotifications.js
 * import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
 *
 * const q = query(
 *   collection(db, "notifications"),
 *   where("targetRole", "==", "admin"),
 *   where("read", "==", false),
 *   orderBy("createdAt", "desc")
 * );
 *
 * const unsubscribe = onSnapshot(q, (snapshot) => {
 *   snapshot.docChanges().forEach((change) => {
 *     if (change.type === "added") {
 *       const notif = change.doc.data();
 *       // Hien thi toast/bell notification tren UI
 *       showNotification(notif);
 *     }
 *   });
 * });
 *
 * // Cleanup khi unmount
 * return unsubscribe;
 */

const sendToAdmin = async ({ title, body, sosId, type }) => {
  try {
    const firestore = getFirestore();
    const docRef = await firestore.collection("notifications").add({
      targetRole: "admin",
      title: title || "",
      body: body || "",
      sosId: sosId || "",
      type: type || "",
      read: false,
      createdAt: FieldValue.serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    logger.warn("sendToAdmin failed", {
      input: { title, body, sosId, type },
      error: error && error.message ? error.message : String(error)
    });
    return null;
  }
};

module.exports = {
  sendToAdmin
};
