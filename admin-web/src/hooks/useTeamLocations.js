import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { db as rtdb } from '../firebase.js';

export function useTeamLocations(sosIds) {
  const [teamLocations, setTeamLocations] = useState({});

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

  return { teamLocations };
}
