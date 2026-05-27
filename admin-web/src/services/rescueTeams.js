import firebaseConfig from '../firebase.config.js';

const DEFAULT_ADMIN_API_URL = 'http://localhost:5055';

const adminApiUrl =
  import.meta.env.VITE_ADMIN_API_URL || DEFAULT_ADMIN_API_URL;

const callAdminApi = async (path, { method, body }) => {
  let response;

  try {
    response = await fetch(`${adminApiUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    });
  } catch {
    throw new Error(
      `Admin API chưa chạy. Hãy chạy: cd functions; $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\Users\\nguye\\Downloads\\lightspeed-rescue-firebase-adminsdk-fbsvc-5c33f6e10b.json"; npm.cmd run admin:api`,
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || 'Admin API xử lý thất bại.');
  }

  return payload;
};

export const createRescueTeamAccount = async ({ phoneNumber, fullName }) => {
  if (!firebaseConfig.apiKey) {
    throw new Error('Thiếu cấu hình Firebase API key.');
  }

  return callAdminApi('/rescue-teams', {
    method: 'POST',
    body: { phoneNumber, fullName },
  });
};

export const deleteRescueTeamAccount = async (team) => {
  const target =
    typeof team === 'string'
      ? { teamId: team }
      : {
          teamId: team?.id,
          phoneNumber: team?.phoneNumber || team?.hotline,
          authEmail: team?.authEmail,
        };

  return callAdminApi('/rescue-teams', {
    method: 'DELETE',
    body: target,
  });
};
