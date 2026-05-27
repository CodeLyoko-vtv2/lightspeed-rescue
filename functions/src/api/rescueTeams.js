"use strict";

/*
  HTTPS Callable duoc chon vi:
  ✅ Tu dong truyen Firebase Auth token (khong can set header thu cong)
  ✅ Tu dong serialize/deserialize JSON
  ✅ Error handling chuan voi HttpsError codes
  ✅ Tich hop san voi Firebase SDK phia client (1 dong goi)

  HTTPS onRequest dung khi:
  - Can tich hop voi ben thu 3 (webhook, REST API public)
  - Can control hoan toan HTTP method, headers, status code
  - Khong dung Firebase Auth
*/

/*
  Chay 1 lan trong Firebase Admin SDK (hoac Cloud Functions):
  await admin.auth().setCustomUserClaims(adminUid, { role: 'admin' });

  Verify phia client sau khi set:
  await auth.currentUser.getIdToken(true); // force refresh token
  const idTokenResult = await auth.currentUser.getIdTokenResult();
  console.log(idTokenResult.claims.role); // "admin"
*/

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

const REGION_CONFIG = {
  region: "asia-southeast1",
  timeoutSeconds: 60,
  memory: "256MiB"
};

const RESCUE_TYPES = [
  "Cứu hỏa",
  "Quân đội",
  "Y tế",
  "Tìm kiếm cứu nạn",
  "Công an",
  "Bệnh viện"
];

const INCIDENT_PRIORITY = {
  "Hạt nhân": ["Quân đội"],
  "Hỏa hoạn": ["Cứu hỏa"],
  "Động đất": ["Quân đội", "Tìm kiếm cứu nạn"],
  "Dịch bệnh": ["Y tế", "Bệnh viện"],
  "Bão lũ": ["Tìm kiếm cứu nạn"],
  "Khác": ["Công an"]
};

const ADMIN_ROLE = "admin";
const DEFAULT_RESCUE_PASSWORD = "Rescue@123";
const DEFAULT_RESCUE_TYPE = "Công an";
const DEFAULT_BASE_LOCATION = { lat: 16.0544, lng: 108.2022 };

const normalizePhone = (value) => {
  const digits = String(value || "").replace(/[^0-9]/g, "");
  if (!digits) {
    return "";
  }
  if (digits.startsWith("84")) {
    return `+${digits}`;
  }
  if (digits.startsWith("0")) {
    return `+84${digits.slice(1)}`;
  }
  return `+84${digits}`;
};

const phoneToAuthEmail = (phone) =>
  `${phone.replace(/[^0-9]/g, "")}@lightspeed-rescue.local`;

const assertAuthenticated = (context, functionName, input) => {
  if (!context.auth) {
    logger.warn(`${functionName} unauthenticated`, { input });
    throw new HttpsError("unauthenticated", "Can dang nhap de thuc hien chuc nang nay");
  }
};

const assertAdmin = (context, functionName, input) => {
  assertAuthenticated(context, functionName, input);

  if (context.auth?.token?.role !== ADMIN_ROLE) {
    logger.warn(`${functionName} permission denied`, { input });
    throw new HttpsError("permission-denied", "Chi admin moi duoc phep thuc hien");
  }
};

const validateRescueType = (type, functionName, input) => {
  if (!RESCUE_TYPES.includes(type)) {
    logger.warn(`${functionName} invalid rescue type`, { input });
    throw new HttpsError("invalid-argument", "Loai doi cuu ho khong hop le");
  }
};

const validateBaseLocation = (baseLocation, functionName, input) => {
  if (!baseLocation || typeof baseLocation !== "object") {
    logger.warn(`${functionName} invalid baseLocation`, { input });
    throw new HttpsError("invalid-argument", "Base location khong hop le");
  }

  const lat = Number(baseLocation.lat);
  const lng = Number(baseLocation.lng);
  const isValidLat = Number.isFinite(lat) && lat >= -90 && lat <= 90;
  const isValidLng = Number.isFinite(lng) && lng >= -180 && lng <= 180;

  if (!isValidLat || !isValidLng) {
    logger.warn(`${functionName} invalid coordinates`, { input });
    throw new HttpsError("invalid-argument", "Toa do khong hop le");
  }

  return { lat, lng };
};

const haversineKm = (from, to) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const isMatchingType = (incidentType, teamType) => {
  const priorities = INCIDENT_PRIORITY[incidentType] || [];
  return priorities.includes(teamType);
};

const buildDistance = (baseLocation, target) => {
  if (!baseLocation || !target) {
    return null;
  }

  const distance = haversineKm(baseLocation, target);
  return Math.round(distance * 10) / 10;
};

const createRescueTeam = onCall(REGION_CONFIG, async (request) => {
  const { data, auth } = request;
  const functionName = "createRescueTeam";

  try {
    assertAdmin({ auth }, functionName, data);

    const inputName = data?.fullName || data?.name;
    const phoneNumber = normalizePhone(data?.phoneNumber || data?.hotline);
    const type = data?.type || DEFAULT_RESCUE_TYPE;
    const baseLocation = data?.baseLocation || DEFAULT_BASE_LOCATION;

    if (!inputName || !phoneNumber) {
      logger.warn(`${functionName} missing fields`, { input: data });
      throw new HttpsError("invalid-argument", "Thieu thong tin bat buoc");
    }

    validateRescueType(type, functionName, data);
    const normalizedLocation = validateBaseLocation(baseLocation, functionName, data);

    const firestore = getFirestore();
    const teamRef = firestore.collection("rescue_teams").doc();
    const teamId = teamRef.id;

    const name = String(inputName).trim();
    const email = phoneToAuthEmail(phoneNumber);
    const password = data?.password || DEFAULT_RESCUE_PASSWORD;

    await getAuth().createUser({
      uid: teamId,
      email,
      phoneNumber,
      displayName: name,
      password,
      disabled: false
    });

    await teamRef.set({
      name,
      fullName: name,
      type,
      hotline: phoneNumber,
      phoneNumber,
      authEmail: email,
      role: "RESCUE_TEAM",
      baseLocation: normalizedLocation,
      currentLocation: normalizedLocation,
      isAvailable: true,
      currentSosId: null,
      fcmToken: null,
      createdAt: FieldValue.serverTimestamp(),
      deletedAt: null
    });

    await firestore.collection("users").doc(teamId).set({
      role: "rescuer",
      teamId,
      phoneNumber,
      authEmail: email,
      fullName: name,
      createdAt: FieldValue.serverTimestamp()
    });

    await firestore.collection("Users").doc(teamId).set({
      role: "RESCUE_TEAM",
      teamId,
      phoneNumber,
      authEmail: email,
      fullName: name,
      createdAt: FieldValue.serverTimestamp()
    });

    return {
      teamId,
      email,
      phoneNumber,
      fullName: name,
      password,
      success: true
    };
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }

    logger.error(`${functionName} failed`, {
      input: data,
      error: error && error.message ? error.message : String(error)
    });
    throw new HttpsError("failed-precondition", "Khong the tao doi cuu ho");
  }
});

const updateRescueTeam = onCall(REGION_CONFIG, async (request) => {
  const { data, auth } = request;
  const functionName = "updateRescueTeam";

  try {
    assertAdmin({ auth }, functionName, data);

    const { teamId, updates } = data || {};
    if (!teamId || !updates || typeof updates !== "object") {
      logger.warn(`${functionName} missing fields`, { input: data });
      throw new HttpsError("invalid-argument", "Thieu thong tin bat buoc");
    }

    const allowedFields = ["name", "hotline", "baseLocation", "type"];
    const updateKeys = Object.keys(updates);
    const disallowed = updateKeys.filter((key) => !allowedFields.includes(key));

    if (disallowed.length > 0) {
      logger.warn(`${functionName} disallowed fields`, { input: data, disallowed });
      throw new HttpsError("invalid-argument", "Khong duoc phep update field nay");
    }

    if (Object.prototype.hasOwnProperty.call(updates, "type")) {
      validateRescueType(updates.type, functionName, data);
    }

    if (Object.prototype.hasOwnProperty.call(updates, "baseLocation")) {
      updates.baseLocation = validateBaseLocation(
        updates.baseLocation,
        functionName,
        data
      );
    }

    const firestore = getFirestore();
    const teamRef = firestore.collection("rescue_teams").doc(teamId);
    const teamSnap = await teamRef.get();

    if (!teamSnap.exists) {
      logger.warn(`${functionName} team not found`, { input: data });
      throw new HttpsError("not-found", "Khong tim thay doi cuu ho");
    }

    await teamRef.update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp()
    });

    return { success: true, teamId };
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }

    logger.error(`${functionName} failed`, {
      input: data,
      error: error && error.message ? error.message : String(error)
    });
    throw new HttpsError("failed-precondition", "Khong the cap nhat doi cuu ho");
  }
});

const deleteRescueTeam = onCall(REGION_CONFIG, async (request) => {
  const { data, auth } = request;
  const functionName = "deleteRescueTeam";

  try {
    assertAdmin({ auth }, functionName, data);

    const { teamId } = data || {};
    if (!teamId) {
      logger.warn(`${functionName} missing teamId`, { input: data });
      throw new HttpsError("invalid-argument", "Thieu teamId");
    }

    const firestore = getFirestore();
    const teamRef = firestore.collection("rescue_teams").doc(teamId);
    const teamSnap = await teamRef.get();

    if (!teamSnap.exists) {
      logger.warn(`${functionName} team not found`, { input: data });
      throw new HttpsError("not-found", "Khong tim thay doi cuu ho");
    }

    const teamData = teamSnap.data() || {};
    if (teamData.currentSosId) {
      const teamName = teamData.name || teamId;
      logger.warn(`${functionName} team busy`, { input: data });
      throw new HttpsError(
        "failed-precondition",
        `Doi ${teamName} dang xu ly SOS ${teamData.currentSosId}, khong the xoa`
      );
    }

    try {
      await getAuth().deleteUser(teamId);
    } catch (error) {
      const errorCode = error?.code || error?.errorInfo?.code;
      if (errorCode !== "auth/user-not-found") {
        logger.warn(`${functionName} delete auth failed`, {
          input: data,
          error: error && error.message ? error.message : String(error)
        });
      }
    }

    await teamRef.update({
      isAvailable: false,
      deletedAt: FieldValue.serverTimestamp()
    });

    await Promise.allSettled([
      firestore.collection("users").doc(teamId).set(
        { disabled: true, deletedAt: FieldValue.serverTimestamp() },
        { merge: true }
      ),
      firestore.collection("Users").doc(teamId).set(
        { disabled: true, deletedAt: FieldValue.serverTimestamp() },
        { merge: true }
      )
    ]);

    return { success: true, teamId };
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }

    logger.error(`${functionName} failed`, {
      input: data,
      error: error && error.message ? error.message : String(error)
    });
    throw new HttpsError("failed-precondition", "Khong the xoa doi cuu ho");
  }
});

const getAvailableTeams = onCall(REGION_CONFIG, async (request) => {
  const { data, auth } = request;
  const functionName = "getAvailableTeams";

  try {
    assertAuthenticated({ auth }, functionName, data);

    const { incidentType, lat, lng } = data || {};
    const hasTargetLocation = Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
    const targetLocation = hasTargetLocation
      ? { lat: Number(lat), lng: Number(lng) }
      : null;

    const firestore = getFirestore();
    const snapshot = await firestore
      .collection("rescue_teams")
      .where("isAvailable", "==", true)
      .where("deletedAt", "==", null)
      .get();

    const teams = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    const mapped = teams.map((team) => {
      const distanceKm = hasTargetLocation
        ? buildDistance(team.baseLocation, targetLocation)
        : null;

      return {
        ...team,
        distanceKm
      };
    });

    const priorityTypes = INCIDENT_PRIORITY[incidentType] || [];

    mapped.sort((a, b) => {
      const aPriority = priorityTypes.includes(a.type) ? 0 : 1;
      const bPriority = priorityTypes.includes(b.type) ? 0 : 1;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      if (hasTargetLocation) {
        const aDistance = typeof a.distanceKm === "number" ? a.distanceKm : Number.MAX_VALUE;
        const bDistance = typeof b.distanceKm === "number" ? b.distanceKm : Number.MAX_VALUE;
        if (aDistance !== bDistance) {
          return aDistance - bDistance;
        }
      }

      const aName = (a.name || "").toLowerCase();
      const bName = (b.name || "").toLowerCase();
      return aName.localeCompare(bName, "vi");
    });

    return mapped;
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }

    logger.error(`${functionName} failed`, {
      input: data,
      error: error && error.message ? error.message : String(error)
    });
    throw new HttpsError("failed-precondition", "Khong the lay danh sach doi cuu ho");
  }
});

module.exports = {
  createRescueTeam,
  updateRescueTeam,
  deleteRescueTeam,
  getAvailableTeams
};
