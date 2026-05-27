import { useEffect, useState } from 'react';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { firestore as db } from '../firebase.js';

export function useSosRealtime() {
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sosQuery = query(
      collection(db, 'sos_alerts'),
      where('status', '==', 'pending'),
    );

    const unsubscribe = onSnapshot(
      sosQuery,
      async (snapshot) => {
        const items = await Promise.all(
          snapshot.docs.map(async (sosDoc) => {
            const sos = { id: sosDoc.id, ...sosDoc.data() };
            const user = await getVictimProfile(sos.victimId);
            return normalizeSos(sos, user);
          }),
        );
        items.sort((a, b) => {
          const scoreA = a.aiTriageScore ?? -Infinity;
          const scoreB = b.aiTriageScore ?? -Infinity;
          if (scoreA !== scoreB) return scoreB - scoreA;

          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ?? 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ?? 0);
          return timeB - timeA;
        });
        setSosList(items);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { sosList, loading, error };
}

async function getVictimProfile(victimId) {
  if (!victimId) return null;

  try {
    const snap = await getDoc(doc(db, 'Users', victimId));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.warn('Khong the lay thong tin nan nhan:', error);
    return null;
  }
}

function normalizeSos(sos, user) {
  const location = normalizeLocation(sos.location || sos.victimLocation || user?.currentLocation);
  const fallbackAddress = location
    ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
    : '';

  return {
    ...sos,
    location,
    victimLocation: location,
    victimName: sos.victimName || sos.name || user?.fullName || user?.displayName || 'Nạn nhân',
    victimPhone: sos.victimPhone || sos.phone || sos.phoneNumber || user?.phoneNumber || user?.phone || '',
    victimAddress:
      sos.victimAddress ||
      sos.address ||
      sos.locationAddress ||
      user?.address ||
      user?.currentAddress ||
      fallbackAddress,
  };
}

function normalizeLocation(location) {
  if (!location) return null;
  const lat = location.lat ?? location.latitude;
  const lng = location.lng ?? location.longitude;
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  return { lat, lng, ...location };
}
