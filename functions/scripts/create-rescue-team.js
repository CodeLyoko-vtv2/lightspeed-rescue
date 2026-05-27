"use strict";

const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const args = process.argv.slice(2);

const getArg = (name, fallback) => {
  const prefix = `--${name}=`;
  const found = args.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
};

const normalizePhone = (value) => {
  const digits = String(value || "").replace(/[^0-9]/g, "");
  if (!digits) return "";
  if (digits.startsWith("84")) return `+${digits}`;
  if (digits.startsWith("0")) return `+84${digits.slice(1)}`;
  return `+84${digits}`;
};

const phoneToAuthEmail = (phone) =>
  `${phone.replace(/[^0-9]/g, "")}@lightspeed-rescue.local`;

const projectId = getArg("project", process.env.FIREBASE_PROJECT_ID || "lightspeed-rescue");
const phoneNumber = normalizePhone(getArg("phone", ""));
const fullName = getArg("name", "Đội cứu hộ");
const password = getArg("password", "Rescue@123");
const type = getArg("type", "Công an");
const baseLocation = { lat: 16.0544, lng: 108.2022 };

if (!phoneNumber) {
  console.error("Missing --phone=...");
  process.exit(1);
}

initializeApp({ projectId });

async function createRescueTeam() {
  const auth = getAuth();
  const firestore = getFirestore();
  const email = phoneToAuthEmail(phoneNumber);
  let user;

  try {
    user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, {
      phoneNumber,
      displayName: fullName,
      password,
      disabled: false,
    });
  } catch (error) {
    if (error?.code !== "auth/user-not-found") {
      throw error;
    }

    user = await auth.createUser({
      email,
      phoneNumber,
      displayName: fullName,
      password,
      disabled: false,
    });
  }

  const teamId = user.uid;
  const teamProfile = {
    name: fullName,
    fullName,
    type,
    hotline: phoneNumber,
    phoneNumber,
    authEmail: email,
    role: "RESCUE_TEAM",
    baseLocation,
    currentLocation: baseLocation,
    isAvailable: true,
    currentSosId: null,
    fcmToken: null,
    updatedAt: FieldValue.serverTimestamp(),
    deletedAt: null,
  };

  await Promise.all([
    firestore.collection("rescue_teams").doc(teamId).set(teamProfile, { merge: true }),
    firestore.collection("Users").doc(teamId).set({
      role: "RESCUE_TEAM",
      teamId,
      phoneNumber,
      authEmail: email,
      fullName,
      disabled: false,
      updatedAt: FieldValue.serverTimestamp(),
      deletedAt: null,
    }, { merge: true }),
    firestore.collection("users").doc(teamId).set({
      role: "rescuer",
      teamId,
      phoneNumber,
      authEmail: email,
      fullName,
      disabled: false,
      updatedAt: FieldValue.serverTimestamp(),
      deletedAt: null,
    }, { merge: true }),
  ]);

  console.log("Rescue team account is ready.");
  console.log(`Team ID: ${teamId}`);
  console.log(`Phone: ${phoneNumber}`);
  console.log(`Auth email: ${email}`);
  console.log(`Password: ${password}`);
}

createRescueTeam().catch((error) => {
  console.error("Failed to create rescue team account.");
  console.error(error?.message || error);
  process.exit(1);
});
