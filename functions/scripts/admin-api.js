"use strict";

const http = require("http");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const PORT = Number(process.env.ADMIN_API_PORT || 5055);
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "lightspeed-rescue";
const DEFAULT_RESCUE_PASSWORD = "Rescue@123";
const DEFAULT_RESCUE_TYPE = "Công an";
const DEFAULT_BASE_LOCATION = { lat: 16.0544, lng: 108.2022 };

initializeApp({ projectId: PROJECT_ID });

const auth = getAuth();
const firestore = getFirestore();

const normalizePhone = (value) => {
  const digits = String(value || "").replace(/[^0-9]/g, "");
  if (!digits) return "";
  if (digits.startsWith("84")) return `+${digits}`;
  if (digits.startsWith("0")) return `+84${digits.slice(1)}`;
  return `+84${digits}`;
};

const phoneToAuthEmail = (phone) =>
  `${phone.replace(/[^0-9]/g, "")}@lightspeed-rescue.local`;

const readJson = (request) =>
  new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
};

const createOrRepairRescueTeam = async ({ phoneNumber, fullName }) => {
  const normalizedPhone = normalizePhone(phoneNumber);
  const normalizedName = String(fullName || "").trim();

  if (!normalizedPhone || !normalizedName) {
    const error = new Error("Thiếu số điện thoại hoặc tên người dùng.");
    error.statusCode = 400;
    throw error;
  }

  const email = phoneToAuthEmail(normalizedPhone);
  let user;

  try {
    user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, {
      phoneNumber: normalizedPhone,
      displayName: normalizedName,
      password: DEFAULT_RESCUE_PASSWORD,
      disabled: false,
    });
  } catch (error) {
    if (error?.code !== "auth/user-not-found") {
      throw error;
    }

    user = await auth.createUser({
      email,
      phoneNumber: normalizedPhone,
      displayName: normalizedName,
      password: DEFAULT_RESCUE_PASSWORD,
      disabled: false,
    });
  }

  const teamId = user.uid;
  const teamProfile = {
    name: normalizedName,
    fullName: normalizedName,
    type: DEFAULT_RESCUE_TYPE,
    hotline: normalizedPhone,
    phoneNumber: normalizedPhone,
    authEmail: email,
    role: "RESCUE_TEAM",
    baseLocation: DEFAULT_BASE_LOCATION,
    currentLocation: DEFAULT_BASE_LOCATION,
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
      phoneNumber: normalizedPhone,
      authEmail: email,
      fullName: normalizedName,
      disabled: false,
      updatedAt: FieldValue.serverTimestamp(),
      deletedAt: null,
    }, { merge: true }),
    firestore.collection("users").doc(teamId).set({
      role: "rescuer",
      teamId,
      phoneNumber: normalizedPhone,
      authEmail: email,
      fullName: normalizedName,
      disabled: false,
      updatedAt: FieldValue.serverTimestamp(),
      deletedAt: null,
    }, { merge: true }),
  ]);

  return {
    success: true,
    teamId,
    email,
    phoneNumber: normalizedPhone,
    fullName: normalizedName,
    password: DEFAULT_RESCUE_PASSWORD,
  };
};

const deleteRescueTeam = async ({ teamId, phoneNumber, authEmail }) => {
  let targetUid = teamId;
  const normalizedPhone = normalizePhone(phoneNumber);
  const email = authEmail || (normalizedPhone ? phoneToAuthEmail(normalizedPhone) : null);

  if (!targetUid && email) {
    try {
      const user = await auth.getUserByEmail(email);
      targetUid = user.uid;
    } catch (error) {
      if (error?.code !== "auth/user-not-found") {
        throw error;
      }
    }
  }

  if (!targetUid) {
    const error = new Error("Không tìm thấy UID tài khoản cần xóa.");
    error.statusCode = 404;
    throw error;
  }

  try {
    await auth.deleteUser(targetUid);
  } catch (error) {
    if (error?.code !== "auth/user-not-found") {
      throw error;
    }
  }

  await Promise.all([
    firestore.collection("rescue_teams").doc(targetUid).set({
      isAvailable: false,
      deletedAt: FieldValue.serverTimestamp(),
    }, { merge: true }),
    firestore.collection("Users").doc(targetUid).set({
      disabled: true,
      deletedAt: FieldValue.serverTimestamp(),
    }, { merge: true }),
    firestore.collection("users").doc(targetUid).set({
      disabled: true,
      deletedAt: FieldValue.serverTimestamp(),
    }, { merge: true }),
  ]);

  return { success: true, teamId: targetUid };
};

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  try {
    if (request.method === "POST" && request.url === "/rescue-teams") {
      const payload = await readJson(request);
      const result = await createOrRepairRescueTeam(payload);
      sendJson(response, 200, result);
      return;
    }

    if (request.method === "DELETE" && request.url === "/rescue-teams") {
      const payload = await readJson(request);
      const result = await deleteRescueTeam(payload);
      sendJson(response, 200, result);
      return;
    }

    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    sendJson(response, error.statusCode || 500, {
      error: error?.message || "Internal error",
      code: error?.code || null,
    });
  }
});

server.listen(PORT, () => {
  console.log(`Admin API listening on http://localhost:${PORT}`);
});
