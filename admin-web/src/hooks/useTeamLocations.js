import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db as rtdb, firestore } from '../firebase.js';

export function useTeamLocations(sosIds) {
  const [teamLocations, setTeamLocations] = useState({});
  const [teamProfiles, setTeamProfiles] = useState({});

  useEffect(() => {
    const q = query(
      collection(firestore, 'Users'),
      where('role', '==', 'RESCUE_TEAM'),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nextProfiles = {};
      snapshot.forEach((docSnap) => {
        nextProfiles[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
      });
      setTeamProfiles(nextProfiles);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!Array.isArray(sosIds) || sosIds.length === 0) {
      setTeamLocations({});
      return undefined;
    }

    const unsubscribes = sosIds.map((sosId) => {
      const locationRef = ref(rtdb, `sos_sessions/${sosId}/rescuer_locations`);
      return onValue(locationRef, (snapshot) => {
        const value = snapshot.val();
        if (!value) {
          return;
        }

        setTeamLocations((prev) => ({
          ...prev,
          ...value,
        }));
      });
    });

    return () => {
      unsubscribes.forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [sosIds]);

  return { teamLocations, teamProfiles };
}
