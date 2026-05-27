"use strict";

const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const args = process.argv.slice(2);

const getArg = (name, fallback) => {
  const prefix = `--${name}=`;
  const found = args.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
};

const useEmulator = args.includes("--emulator") || process.env.USE_FIREBASE_EMULATOR === "true";

if (useEmulator) {
  process.env.FIREBASE_AUTH_EMULATOR_HOST =
    process.env.FIREBASE_AUTH_EMULATOR_HOST || "localhost:9099";
}

const projectId = getArg("project", process.env.FIREBASE_PROJECT_ID || "lightspeed-rescue");
const email = getArg("email", "admin_danang_01@lightspeed.rescue");
const password = getArg("password", "Admin@123456");
const displayName = getArg("name", "Admin Trung tâm");

initializeApp({ projectId });

async function createAdmin() {
  const auth = getAuth();
  let user;

  try {
    user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, {
      password,
      displayName,
      disabled: false,
    });
  } catch (error) {
    if (error?.code !== "auth/user-not-found") {
      throw error;
    }

    user = await auth.createUser({
      email,
      password,
      displayName,
      disabled: false,
    });
  }

  const refreshedUser = await auth.getUser(user.uid);
  await auth.setCustomUserClaims(user.uid, {
    ...(refreshedUser.customClaims || {}),
    role: "admin",
  });

  console.log("Admin account is ready.");
  console.log(`Email: ${email}`);
  console.log(`Login ID: ${email.replace("@lightspeed.rescue", "")}`);
  console.log(`Password: ${password}`);
  console.log("Custom claim: role=admin");
  if (useEmulator) {
    console.log("Target: Firebase Auth Emulator");
  } else {
    console.log(`Target project: ${projectId}`);
  }
}

createAdmin().catch((error) => {
  console.error("Failed to create admin account.");
  console.error(error?.message || error);
  process.exit(1);
});
