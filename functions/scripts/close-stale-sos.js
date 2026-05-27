"use strict";

const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const getArg = (name, fallback = null) => {
  const prefix = `--${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : fallback;
};

const shouldApply = process.argv.includes("--apply");
const closeAllPending = process.argv.includes("--all-pending");
const minutes = Number(getArg("minutes", "60"));
const reason = getArg("reason", "stale_pending_cleanup");
const projectId = getArg("project", process.env.FIREBASE_PROJECT_ID || "lightspeed-rescue");

if (!closeAllPending && (!Number.isFinite(minutes) || minutes <= 0)) {
  console.error("minutes must be a positive number unless --all-pending is used");
  process.exit(1);
}

initializeApp({ projectId });

const toMillis = (value) => {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value === "number") return value;
  return 0;
};

const main = async () => {
  const db = getFirestore();
  const cutoff = Date.now() - minutes * 60 * 1000;
  const snap = await db
    .collection("sos_alerts")
    .where("status", "==", "pending")
    .get();

  const staleDocs = snap.docs.filter((doc) => {
    if (closeAllPending) return true;
    const data = doc.data();
    const lastSeen = toMillis(data.updatedAt) || toMillis(data.createdAt);
    return lastSeen > 0 && lastSeen <= cutoff;
  });

  console.log(`Project: ${projectId}`);
  console.log(`Pending SOS found: ${snap.size}`);
  console.log(`Pending SOS matched: ${staleDocs.length}`);

  staleDocs.forEach((doc) => {
    const data = doc.data();
    const lastSeen = toMillis(data.updatedAt) || toMillis(data.createdAt);
    console.log(
      `- ${doc.id} victim=${data.victimId || "unknown"} incident=${data.incidentType || "unknown"} lastSeen=${lastSeen ? new Date(lastSeen).toISOString() : "unknown"}`
    );
  });

  if (!shouldApply || staleDocs.length === 0) {
    console.log(shouldApply ? "No changes applied." : "Dry run only. Add --apply to close matched SOS.");
    return;
  }

  const batch = db.batch();
  staleDocs.forEach((doc) => {
    batch.update(doc.ref, {
      status: "cancelled",
      cancelReason: reason,
      cancelledAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
  });
  await batch.commit();
  console.log(`Closed ${staleDocs.length} pending SOS.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
