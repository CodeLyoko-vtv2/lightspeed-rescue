import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export const ACTIVE_SOS_STATUSES = new Set(["pending", "assigned", "accepted"]);

export const cancelSosRequest = async (requestId: string, reason: string) => {
  await updateDoc(doc(db, "sos_alerts", requestId), {
    status: "cancelled",
    cancelReason: reason,
    cancelledAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getActiveSosRequests = async (victimId: string) => {
  if (!victimId) return [];

  const activeQuery = query(
    collection(db, "sos_alerts"),
    where("victimId", "==", victimId),
  );
  const activeSnap = await getDocs(activeQuery);

  return activeSnap.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((item: any) => ACTIVE_SOS_STATUSES.has(item.status))
    .sort((a: any, b: any) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });
};

export const cancelActiveSosForVictim = async (
  victimId: string,
  reason: string,
  keepRequestId?: string,
) => {
  const activeRequests = await getActiveSosRequests(victimId);

  await Promise.all(
    activeRequests
      .filter((item) => item.id !== keepRequestId)
      .map((item) => cancelSosRequest(item.id, reason)),
  );
};
